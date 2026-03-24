"use client";

import { useMemo, useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { generateTripPlan, fetchPlaceCulture, getUserTrips, saveUserTrip, searchAndAddPlace, reorderRouteList, updateUserTrip } from "@/lib/api";

const FAVORITE_CATEGORIES = [
  {
    title: "Activities",
    options: [
      { id: "hiking", label: "Hiking" },
      { id: "dance", label: "Dancing" },
      { id: "sing", label: "Singing" },
      { id: "surfing", label: "Surfing" },
      { id: "safari", label: "Safari" },
      { id: "scuba", label: "Scuba Diving" },
      { id: "snorkeling", label: "Snorkeling" },
      { id: "cycling", label: "Cycling" },
      { id: "yoga", label: "Yoga Retreat" },
      { id: "cooking", label: "Cooking Class" },
      { id: "rock_climbing", label: "Rock Climb" },
      { id: "kayaking", label: "Kayaking" }
    ]
  },
  {
    title: "Likes & Themes",
    options: [
      { id: "culture", label: "Culture" },
      { id: "nature", label: "Nature" },
      { id: "beach", label: "Beach" },
      { id: "wildlife", label: "Wildlife" },
      { id: "food", label: "Food" },
      { id: "adventure", label: "Adventure" },
      { id: "relaxation", label: "Relax" },
      { id: "photography", label: "Photography" },
      { id: "nightlife", label: "Nightlife" },
      { id: "shopping", label: "Shopping" },
      { id: "romantic", label: "Romantic" },
      { id: "backpacking", label: "Backpacking" }
    ]
  }
];

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function buildMapEmbedUrl(stops, preference = "shortest") {
  if (!GOOGLE_MAPS_KEY) return null;

  const validCoords = Array.isArray(stops)
    ? stops.filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
    : [];

  // If we have at least two coordinates, show a directions route
  if (validCoords.length >= 2) {
    const coords = validCoords.map((s) => `${s.lat},${s.lng}`);
    const origin = encodeURIComponent(coords[0]);
    const destination = encodeURIComponent(coords[coords.length - 1]);
    const optimizePrefix = preference === "shortest" ? "optimize:true|" : "";
    const waypoints =
      coords.length > 2
        ? `&waypoints=${encodeURIComponent(optimizePrefix + coords.slice(1, -1).join("|"))}`
        : "";

    return `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_KEY}&origin=${origin}&destination=${destination}${waypoints}`;
  }

  // If we have a single coordinate, just center the map there
  if (validCoords.length === 1) {
    const { lat, lng } = validCoords[0];
    return `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_KEY}&center=${lat},${lng}&zoom=10&maptype=roadmap`;
  }

  // Fallback: center on Sri Lanka so the map is always visible
  const defaultLat = 7.8731;
  const defaultLng = 80.7718;
  return `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_KEY}&center=${defaultLat},${defaultLng}&zoom=7&maptype=roadmap`;
}

/** Firebase may store status in different casing or omit it — normalize for UI + filters */
function normalizeTripStatus(raw) {
  if (raw == null || raw === "") return "Upcoming";
  const s = String(raw).trim().toLowerCase();
  if (s === "active") return "Active";
  if (s === "completed" || s === "complete") return "Completed";
  if (s === "upcoming" || s === "planned") return "Upcoming";
  return "Upcoming";
}

/** Format trip_date (often YYYY-MM-DD) for list cards without timezone shift */
function formatTripDateForDisplay(value) {
  if (value == null || value === "") return "Date TBD";
  const trimmed = String(value).trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]) - 1;
    const d = Number(ymd[3]);
    return new Date(y, m, d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return trimmed;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function TripsScreen({ active, showScreen }) {
  const { token } = useAuth();
  const { t } = useSettings();
  const TRIP_FILTER_TABS = [
    { id: "all", label: t("tripsFilterAll") },
    { id: "Upcoming", label: t("tripsFilterUpcoming") },
    { id: "Active", label: t("tripsFilterActive") },
    { id: "Completed", label: t("tripsFilterCompleted") },
  ];

  const [userTrips, setUserTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripFilter, setTripFilter] = useState("all");

  const [mode, setMode] = useState("list"); // list, new, view
  const [tripName, setTripName] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [stopCount, setStopCount] = useState(3);
  const [routePreference, setRoutePreference] = useState("shortest");

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [favorites, setFavorites] = useState(["hiking", "dance"]);
  const [plannedStops, setPlannedStops] = useState([]);
  const [aiSource, setAiSource] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [cultureData, setCultureData] = useState({});
  const [loadingCultureId, setLoadingCultureId] = useState(null);
  const [tripMemories, setTripMemories] = useState({});

  useEffect(() => {
    if (activeTrip && activeTrip.stops) {
      const mems = {};
      activeTrip.stops.forEach((s) => {
        mems[s.stop_order] = {
           note: s.user_memory || "",
           img: s.user_memory_img || ""
        };
      });
      setTripMemories(mems);
    }
  }, [activeTrip]);

  async function handleToggleTripStatus() {
     if (!activeTrip) return;
     const currentStatus = normalizeTripStatus(activeTrip.status);
     // State machine: Upcoming -> Active -> Completed -> Upcoming
     const newStatus = currentStatus === "Upcoming" ? "Active" : 
                       (currentStatus === "Active" ? "Completed" : "Upcoming");
                       
     try {
       await updateUserTrip(token, activeTrip.id, { status: newStatus });
       setActiveTrip(prev => ({ ...prev, status: newStatus }));
       loadTrips();
     } catch (err) {
       console.error("Failed to update status", err);
       alert("Could not update trip status.");
     }
  }

  async function handleSaveMemory(stopOrder) {
     if (!activeTrip) return;
     const memory = tripMemories[stopOrder];
     if (!memory) return;
     
     const updatedStops = activeTrip.stops.map(s => {
       if (s.stop_order === stopOrder) {
         return { ...s, user_memory: memory.note, user_memory_img: memory.img };
       }
       return s;
     });

     try {
       await updateUserTrip(token, activeTrip.id, { stops: updatedStops });
       setActiveTrip(prev => ({ ...prev, stops: updatedStops }));
       alert("Memory saved securely! 📸");
     } catch(err) {
       console.error("Failed to save memory", err);
       alert("Could not save memory.");
     }
  }

  const mapEmbedUrl = useMemo(() => buildMapEmbedUrl(plannedStops, routePreference), [plannedStops, routePreference]);
  const listMapEmbedUrl = useMemo(() => buildMapEmbedUrl([]), []);
  const activeTripMapUrl = useMemo(() => buildMapEmbedUrl(activeTrip?.stops || []), [activeTrip]);

  const displayedTrips = useMemo(() => {
    if (tripFilter === "all") return userTrips;
    return userTrips.filter((t) => normalizeTripStatus(t.status) === tripFilter);
  }, [userTrips, tripFilter]);

  useEffect(() => {
    if (token && active) {
      loadTrips();
    }
  }, [token, active]);

  async function loadTrips() {
    try {
      setLoadingTrips(true);
      const data = await getUserTrips(token);
      const trips = (data.trips || []).map((t) => ({
        ...t,
        status: normalizeTripStatus(t.status),
      }));
      setUserTrips(trips);
      setActiveTrip((prev) => {
        if (!prev?.id) return prev;
        const fresh = trips.find((x) => x.id === prev.id);
        return fresh ?? prev;
      });
    } catch (err) {
      console.error("Failed to load trips", err);
    } finally {
      setLoadingTrips(false);
    }
  }

  const mapTitle = useMemo(() => {
    const safeName = tripName.trim();
    if (safeName) return safeName;
    return "AI trip preview";
  }, [tripName]);

  function toggleFavorite(id) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleGetCulture(stopIdx, placeName) {
    if (cultureData[stopIdx]) {
      const newD = { ...cultureData };
      delete newD[stopIdx];
      setCultureData(newD);
      return;
    }
    setLoadingCultureId(stopIdx);
    try {
      const data = await fetchPlaceCulture(token, placeName);
      setCultureData(prev => ({ ...prev, [stopIdx]: data }));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load insights");
    } finally {
      setLoadingCultureId(null);
    }
  }

  async function handleSaveTrip() {
    try {
      setLoadingPlan(true);
      await saveUserTrip(token, {
        trip_name: tripName,
        trip_date: tripDate,
        stop_count: stopCount,
        favorites,
        stops: plannedStops
      });
      setMode("list");
      setTripName("");
      setPlannedStops([]);
      setFavorites(["hiking", "dance"]);
      setIsEditing(true);
      loadTrips();
    } catch (err) {
      console.error(err);
      alert("Failed to save trip.");
    } finally {
      setLoadingPlan(false);
    }
  }

  async function applyAlgorithm() {
    if (plannedStops.length < 2) return;
    setLoadingPlan(true);
    try {
      const result = await reorderRouteList(token, plannedStops, routePreference);
      if (result.stops && result.stops.length) {
        setPlannedStops(result.stops);
      }
    } catch (err) {
      console.error(err);
      alert("Algorithm failed to reorder.");
    } finally {
      setLoadingPlan(false);
    }
  }

  async function handleSearchPlace(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await searchAndAddPlace(token, searchQuery.trim());
      const newOrder = plannedStops.length + 1;
      const newStop = { ...result, stop_order: newOrder, category: result.category || "general" };
      setPlannedStops((prev) => [...prev, newStop]);
      setSearchQuery("");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to search place");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleGeneratePlan() {
    if (!tripName.trim()) {
      setError("Please enter a trip name.");
      return;
    }
    if (!tripDate) {
      setError("Please select a trip date.");
      return;
    }
    if (favorites.length === 0) {
      setError("Select at least one favorite style.");
      return;
    }
    if (!token) {
      setError("Please sign in again to generate a trip plan.");
      return;
    }

    setLoadingPlan(true);
    setError("");

    try {
      const result = await generateTripPlan(token, {
        trip_name: tripName.trim(),
        trip_date: tripDate,
        stop_count: stopCount,
        favorites,
        route_preference: routePreference,
      });

      setPlannedStops(Array.isArray(result?.stops) ? result.stops : []);
      setAiSource(result?.source || "gemini");
      setCultureData({});
      setIsEditing(false);
    } catch (e) {
      setError(e?.message || "Could not generate trip plan.");
    } finally {
      setLoadingPlan(false);
    }
  }

  return (
    <div id="screen-trips" className={`screen ${active ? "active" : ""}`}>
      <div className="main-layout">
        <Sidebar activeItem="trips" logoIcon="🌍" logoText="Dream" logoEm="Trip" userName="Sithil Semitha" userRole={t("appRoleExplorerPro")} onNavigate={showScreen} />
        <div className="main-content">
          <div className="topbar">
            <div><h1>{t("tripsTitle")}</h1><div className="subtitle">{t("tripsSubtitle")}</div></div>
            <div className="topbar-actions">
              {mode === "list" ? (
                <button
                  type="button"
                  className="btn-teal"
                  style={{ width: "auto", padding: "12px 24px" }}
                  onClick={() => setMode("new")}
                >
                  {t("tripsNewTrip")}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-teal"
                  style={{ width: "auto", padding: "12px 24px", background: "var(--gray-100)", color: "var(--gray-600)" }}
                  onClick={() => { setMode("list"); setActiveTrip(null); }}
                >
                  {t("tripsBackToTrips")}
                </button>
              )}
            </div>
          </div>
          {mode === "list" ? (
            <div className="trips-layout">
              <div>
                <div className="trip-steps">
                  {TRIP_FILTER_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`step-btn${tripFilter === tab.id ? " active" : ""}`}
                      onClick={() => setTripFilter(tab.id)}
                      style={{
                        border: "none",
                        background: tripFilter === tab.id ? undefined : "transparent",
                        cursor: "pointer",
                        font: "inherit",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {loadingTrips ? (
                  <div style={{ padding: 20, textAlign: "center", color: "var(--gray-500)" }}>{t("tripsLoading")}</div>
                ) : userTrips.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--gray-500)", background: "var(--white)", border: "1px solid var(--gray-100)", borderRadius: 16, marginTop: 20 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
                    <h3 style={{ color: "var(--gray-800)", marginBottom: 8 }}>{t("tripsNoSaved")}</h3>
                    <p>{t("tripsNoSavedDesc")}</p>
                  </div>
                ) : displayedTrips.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: "var(--gray-500)", background: "var(--white)", border: "1px solid var(--gray-100)", borderRadius: 16, marginTop: 20 }}>
                    <p>{t("tripsNoCategory")}</p>
                    <button type="button" className="btn-teal" style={{ marginTop: 12, width: "auto", padding: "10px 20px" }} onClick={() => setTripFilter("all")}>
                      {t("tripsShowAll")}
                    </button>
                  </div>
                ) : (
                  displayedTrips.map((t, i) => {
                  const status = normalizeTripStatus(t.status);
                  const firstStopPhoto = t.stops?.[0]?.photo_url || "https://images.unsplash.com/photo-1544487661-04e8d38cb71f?w=300&q=80";
                  return (
                    <div key={t.id || i} className="trip-card" onClick={() => { setActiveTrip({ ...t, status }); setMode("view"); }} style={{ cursor: "pointer" }}>
                      <div className="trip-card-img"><img src={firstStopPhoto} alt={t.trip_name} style={{ objectFit: "cover", width: "100%", height: "100%" }} /></div>
                      <div className="trip-card-body">
                        <h4>{t.trip_name}</h4>
                        <div className="meta" style={{ marginTop: 6 }}>
                          <span>📅 {formatTripDateForDisplay(t.trip_date)}</span>
                          <span>📍 {t.stop_count || t.stops?.length || 0} stops</span>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          Starts at: {t.stops?.[0]?.name || "Unknown"}
                        </div>
                      </div>
                      <div className={`trip-status`} style={{ background: status === "Active" ? "#10b981" : (status === "Completed" ? "var(--teal-dark)" : "var(--teal-light)"), color: status === "Upcoming" ? "var(--teal-dark)" : "white", fontWeight: 700 }}>
                        {status}
                      </div>
                    </div>
                  );
                })
                )}
              </div>
              <div className="map-panel">
                <div className="map-placeholder" style={{ padding: 0, display: "flex", alignItems: "stretch", justifyContent: "center" }}>
                  {listMapEmbedUrl && (
                    <div
                      style={{
                        width: "92%",
                        height: "92%",
                        margin: "4%",
                        borderRadius: 18,
                        overflow: "hidden",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                        background: "var(--gray-50)",
                      }}
                    >
                      <iframe
                        title="Trips map overview"
                        src={listMapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : mode === "view" && activeTrip ? (
            <div className="view-trip-layout" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 22 }}>
              <div className="new-trip-map">
                <div className="map-panel" style={{ position: "relative", top: 0, height: "100%", minHeight: 580 }}>
                  <div className="map-placeholder" style={{ padding: 0, alignItems: "stretch", justifyContent: "center", display: "flex" }}>
                    {activeTripMapUrl && (
                      <div style={{ width: "94%", height: "92%", margin: "3%", borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.12)", background: "var(--gray-50)" }}>
                        <iframe title="Active trip route" src={activeTripMapUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="new-trip-details" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="new-trip-card" style={{ background: "var(--white)", borderRadius: 16, boxShadow: "var(--shadow-sm)", padding: 20, border: "1px solid var(--gray-100)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800 }}>{activeTrip.trip_name}</h3>
                      <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 4 }}>{formatTripDateForDisplay(activeTrip.trip_date)}</div>
                    </div>
                    <button 
                       onClick={handleToggleTripStatus}
                       className="pill pill-teal" 
                       style={{ 
                         cursor: "pointer", 
                         border: "none", 
                         background: normalizeTripStatus(activeTrip.status) === "Active" ? "#10b981" : (normalizeTripStatus(activeTrip.status) === "Completed" ? "var(--teal-dark)" : "var(--gray-200)"), 
                         color: normalizeTripStatus(activeTrip.status) === "Upcoming" ? "var(--gray-800)" : "white",
                         fontWeight: 700
                       }}
                    >
                      {normalizeTripStatus(activeTrip.status) === "Active" ? "Active (Click to Complete)" : (normalizeTripStatus(activeTrip.status) === "Completed" ? "Completed (Click to Reset)" : "Upcoming (Click to Start)")}
                    </button>
                  </div>

                  <div style={{ marginTop: 24, borderTop: "1px solid var(--gray-200)", paddingTop: 18 }}>
                    <h4 style={{ marginBottom: 12, fontSize: 16, fontWeight: 800 }}>Start Driving ({activeTrip.stops?.length || 0} stops)</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "calc(100vh - 280px)", overflowY: "auto", paddingRight: 8 }}>
                      {(activeTrip.stops || []).map((stop, i) => (
                        <div key={i} style={{ background: "var(--gray-50)", padding: 14, borderRadius: 12, border: "1px solid var(--gray-100)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, color: "var(--teal-dark)" }}>{stop.stop_order}. {stop.name}</div>
                              <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 6, lineHeight: 1.4 }}>{stop.description}</div>
                            </div>
                            <button
                              onClick={() => handleGetCulture(stop.stop_order, stop.name)}
                              disabled={loadingCultureId === stop.stop_order}
                              style={{
                                border: "1px solid var(--teal)", background: cultureData[stop.stop_order] ? "var(--teal)" : "transparent",
                                color: cultureData[stop.stop_order] ? "white" : "var(--teal)", padding: "6px 10px", borderRadius: 6,
                                fontSize: 12, fontWeight: 700, cursor: "pointer", marginLeft: 12, whiteSpace: "nowrap", transition: "0.2s"
                              }}
                            >
                              {loadingCultureId === stop.stop_order ? "..." : (cultureData[stop.stop_order] ? "Hide Info" : "📖 Insights")}
                            </button>
                          </div>
                          {stop.stop_note && <div style={{ fontSize: 12, color: "var(--teal)", marginTop: 8, fontWeight: 600 }}>💡 {stop.stop_note}</div>}

                          <div style={{ marginTop: 14, background: "var(--white)", padding: 12, borderRadius: 10, border: "1px solid var(--gray-200)" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-700)", marginBottom: 8 }}>📝 Your Memory Journal</div>
                            
                            {tripMemories[stop.stop_order]?.img && (
                              <img src={tripMemories[stop.stop_order].img} alt="Memory" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                            )}

                            <input
                              type="text"
                              placeholder="Add a photo URL here (optional)..."
                              value={tripMemories[stop.stop_order]?.img || ""}
                              onChange={e => setTripMemories(prev => ({...prev, [stop.stop_order]: { ...prev[stop.stop_order], img: e.target.value }}))}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--gray-200)", fontSize: 12, marginBottom: 8, outline: "none", background: "var(--white)", color: "var(--text)" }}
                            />
                            <textarea
                              placeholder="What did you experience here? Write your thoughts..."
                              value={tripMemories[stop.stop_order]?.note || ""}
                              onChange={e => setTripMemories(prev => ({...prev, [stop.stop_order]: { ...prev[stop.stop_order], note: e.target.value }}))}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--gray-200)", fontSize: 12, minHeight: 60, resize: "vertical", outline: "none", background: "var(--white)", color: "var(--text)" }}
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                              <button 
                                onClick={() => handleSaveMemory(stop.stop_order)}
                                style={{ background: "var(--teal-dark)", color: "white", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", transition: "0.2s" }}
                              >
                                Save Memory
                              </button>
                            </div>
                          </div>
                          
                          {cultureData[stop.stop_order] && (
                            <div style={{ marginTop: 12, borderTop: "1px dashed var(--gray-200)", paddingTop: 12, animation: "fadeIn 0.3s" }}>
                              <h5 style={{ fontSize: 13, marginBottom: 8, color: "var(--gray-800)" }}>Local Culture & Seasons:</h5>
                              <div style={{ fontSize: 12, color: "var(--gray-600)", display: "flex", flexDirection: "column", gap: 6 }}>
                                <div><strong>👕 Dress Code:</strong> {cultureData[stop.stop_order].dress_code}</div>
                                <div><strong>🛑 Behavior Rules:</strong> {cultureData[stop.stop_order].behavior_rules}</div>
                                <div><strong>🌤️ Best Season:</strong> {cultureData[stop.stop_order].best_season}</div>
                                <div><strong>🏛️ Context:</strong> {cultureData[stop.stop_order].historical_context}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="new-trip-layout" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 22 }}>
              <div className="new-trip-map">
                <div className="map-panel" style={{ position: "relative", top: 0, height: "100%", minHeight: 580 }}>
                  <div
                    className="map-placeholder"
                    style={{
                      padding: 0,
                      alignItems: "stretch",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    {mapEmbedUrl && (
                      <div
                        style={{
                          width: "94%",
                          height: "92%",
                          margin: "3%",
                          borderRadius: 18,
                          overflow: "hidden",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                          background: "var(--gray-50)",
                        }}
                      >
                        <iframe
                          title="Trip route"
                          src={mapEmbedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="new-trip-details">
                <div className="new-trip-card" style={{ background: "var(--white)", borderRadius: 16, boxShadow: "var(--shadow-sm)", padding: 20, border: "1px solid var(--gray-100)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800 }}>Add New Trip</h3>
                      <div style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}>Enter trip details and let AI generate your stop route</div>
                    </div>
                    <div className="pill pill-teal">AI Planner</div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label>Trip name</label>
                    <input value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="e.g., Sri Lanka Adventure" disabled={!isEditing || loadingPlan} />
                  </div>

                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label>Trip date</label>
                      <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} disabled={!isEditing || loadingPlan} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label>Number of stops</label>
                      <select
                        value={stopCount}
                        onChange={(e) => setStopCount(Number(e.target.value))}
                        disabled={!isEditing || loadingPlan}
                        style={{
                          width: "100%",
                          border: "1px solid var(--gray-200)",
                          borderRadius: 12,
                          padding: "12px 14px",
                          fontSize: 14,
                          background: "var(--white)",
                          color: "var(--text)",
                          outline: "none",
                        }}
                      >
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((count) => (
                          <option key={count} value={count}>{count} {count === 1 ? 'stop' : 'stops'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label>Favorites</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
                      {FAVORITE_CATEGORIES.map((category) => (
                        <div key={category.title}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", marginBottom: 8 }}>{category.title}</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                            {category.options.map((opt) => {
                              const activeFavorite = favorites.includes(opt.id);
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  disabled={!isEditing || loadingPlan}
                                  onClick={() => toggleFavorite(opt.id)}
                                  style={{
                                    opacity: (!isEditing || loadingPlan) ? 0.6 : 1,
                                    border: activeFavorite ? "1.5px solid var(--teal)" : "1.5px solid var(--gray-200)",
                                    borderRadius: 10,
                                    padding: "9px 8px",
                                    background: activeFavorite ? "var(--teal-light)" : "var(--white)",
                                    color: activeFavorite ? "var(--teal-dark)" : "var(--gray-600)",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                  }}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8 }}>{error}</p>}

                  <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                    {isEditing ? (
                      <button type="button" className="btn-teal" style={{ flex: 1 }} onClick={handleGeneratePlan} disabled={loadingPlan}>
                        {loadingPlan ? "Generating..." : "Generate Route with AI"}
                      </button>
                    ) : (
                      <button type="button" className="btn-teal" style={{ flex: 1, background: "var(--gray-800)", border: "none" }} onClick={() => setIsEditing(true)}>
                        ✎ Edit Details
                      </button>
                    )}
                    {plannedStops.length > 0 && !isEditing ? (
                      <button
                        type="button"
                        className="btn-teal"
                        style={{ width: "auto", padding: "14px 18px" }}
                        onClick={handleSaveTrip}
                        disabled={loadingPlan}
                      >
                        Save Trip
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-teal"
                        style={{ width: "auto", padding: "14px 18px", background: "var(--white)", color: "var(--teal)", border: "1.5px solid var(--gray-200)" }}
                        onClick={() => setMode("list")}
                        disabled={loadingPlan}
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {plannedStops.length > 0 && (
                    <div style={{ marginTop: 24, borderTop: "1px solid var(--gray-200)", paddingTop: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 800 }}>Your AI Route ({plannedStops.length} stops)</h4>
                      </div>

                      {!isEditing && (
                        <div style={{ background: "var(--teal-light)", padding: "10px 14px", borderRadius: 10, marginBottom: 16, border: "1px solid #b2ece3" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-dark)", marginBottom: 6 }}>Active Route Algorithm</div>
                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "var(--gray-800)", fontWeight: 600 }}>
                              <input type="radio" name="routeAlgActive" value="shortest" checked={routePreference === "shortest"} onChange={e => setRoutePreference(e.target.value)} disabled={loadingPlan} />
                              Shortest Path
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "var(--gray-800)", fontWeight: 600 }}>
                              <input type="radio" name="routeAlgActive" value="safest" checked={routePreference === "safest"} onChange={e => setRoutePreference(e.target.value)} disabled={loadingPlan} />
                              Safest Path
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "var(--gray-800)", fontWeight: 600 }}>
                              <input type="radio" name="routeAlgActive" value="max_places" checked={routePreference === "max_places"} onChange={e => setRoutePreference(e.target.value)} disabled={loadingPlan} />
                              Max Places Covering
                            </label>
                            <button
                              onClick={applyAlgorithm}
                              disabled={loadingPlan || plannedStops.length < 2}
                              style={{ marginLeft: "auto", background: "var(--teal-dark)", color: "white", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, border: "none", cursor: (loadingPlan || plannedStops.length < 2) ? "not-allowed" : "pointer" }}
                            >
                              {loadingPlan ? "Applying..." : "Apply Algorithm"}
                            </button>
                          </div>
                        </div>
                      )}

                      {!isEditing && (
                        <form onSubmit={handleSearchPlace} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                          <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Add a custom place... (e.g. Kandy Lake)"
                            disabled={isSearching}
                            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--gray-200)", fontSize: 13, outline: "none", background: "var(--white)", color: "var(--text)" }}
                          />
                          <button
                            type="submit"
                            disabled={isSearching || !searchQuery.trim()}
                            style={{ background: "var(--teal)", color: "white", padding: "0 16px", borderRadius: 8, fontWeight: 700, fontSize: 13, border: "none", cursor: (isSearching || !searchQuery.trim()) ? "not-allowed" : "pointer", opacity: (isSearching || !searchQuery.trim()) ? 0.6 : 1 }}
                          >
                            {isSearching ? "Searching..." : "Add to Route +"}
                          </button>
                        </form>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 380, overflowY: "auto", paddingRight: 8 }}>
                        {plannedStops.map((stop, i) => (
                          <div key={i} style={{ background: "var(--gray-50)", padding: 14, borderRadius: 12, border: "1px solid var(--gray-100)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, color: "var(--teal-dark)" }}>{stop.stop_order}. {stop.name}</div>
                                <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 6, lineHeight: 1.4 }}>{stop.description}</div>
                              </div>
                              <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
                                <button
                                  onClick={() => handleGetCulture(stop.stop_order, stop.name)}
                                  disabled={loadingCultureId === stop.stop_order}
                                  style={{
                                    border: "1px solid var(--teal)",
                                    background: cultureData[stop.stop_order] ? "var(--teal)" : "transparent",
                                    color: cultureData[stop.stop_order] ? "white" : "var(--teal)",
                                    padding: "6px 10px",
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    transition: "0.2s"
                                  }}
                                >
                                  {loadingCultureId === stop.stop_order ? "..." : (cultureData[stop.stop_order] ? "Hide Info" : "📖 Insights")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPlannedStops(prev => prev.filter((_, idx) => idx !== i))}
                                  style={{
                                    border: "1px solid #fecaca",
                                    background: "#fef2f2",
                                    color: "#ef4444",
                                    padding: "6px 10px",
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    transition: "0.2s"
                                  }}
                                >
                                  ✖ Remove
                                </button>
                              </div>
                            </div>
                            {stop.stop_note && <div style={{ fontSize: 12, color: "var(--teal)", marginTop: 8, fontWeight: 600 }}>💡 {stop.stop_note}</div>}

                            <div style={{ marginTop: 14, background: "white", padding: 12, borderRadius: 10, border: "1px solid var(--gray-200)" }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-700)", marginBottom: 8 }}>📝 Your Memory Journal</div>
                              
                              {tripMemories[stop.stop_order]?.img && (
                                <img src={tripMemories[stop.stop_order].img} alt="Memory" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                              )}

                              <input
                                type="text"
                                placeholder="Add a photo URL here (optional)..."
                                value={tripMemories[stop.stop_order]?.img || ""}
                                onChange={e => setTripMemories(prev => ({...prev, [stop.stop_order]: { ...prev[stop.stop_order], img: e.target.value }}))}
                                style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--gray-200)", fontSize: 12, marginBottom: 8, outline: "none" }}
                              />
                              <textarea
                                placeholder="What did you experience here? Write your thoughts..."
                                value={tripMemories[stop.stop_order]?.note || ""}
                                onChange={e => setTripMemories(prev => ({...prev, [stop.stop_order]: { ...prev[stop.stop_order], note: e.target.value }}))}
                                style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--gray-200)", fontSize: 12, minHeight: 60, resize: "vertical", outline: "none" }}
                              />
                              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                                <button 
                                  onClick={() => handleSaveMemory(stop.stop_order)}
                                  style={{ background: "var(--teal-dark)", color: "white", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", transition: "0.2s" }}
                                >
                                  Save Memory
                                </button>
                              </div>
                            </div>

                            {cultureData[stop.stop_order] && (
                              <div style={{ marginTop: 12, borderTop: "1px dashed var(--gray-200)", paddingTop: 12, animation: "fadeIn 0.3s" }}>
                                <h5 style={{ fontSize: 13, marginBottom: 8, color: "var(--gray-800)" }}>Local Culture & Seasons:</h5>
                                <div style={{ fontSize: 12, color: "var(--gray-600)", display: "flex", flexDirection: "column", gap: 6 }}>
                                  <div><strong>👕 Dress Code:</strong> {cultureData[stop.stop_order].dress_code}</div>
                                  <div><strong>🛑 Behavior Rules:</strong> {cultureData[stop.stop_order].behavior_rules}</div>
                                  <div><strong>🌤️ Best Season:</strong> {cultureData[stop.stop_order].best_season}</div>
                                  <div><strong>🏛️ Context:</strong> {cultureData[stop.stop_order].historical_context}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
