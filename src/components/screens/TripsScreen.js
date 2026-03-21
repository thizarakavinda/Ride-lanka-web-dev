"use client";

import { useMemo, useState } from "react";
import Sidebar from "../Sidebar";
import { useAuth } from "@/context/AuthContext";
import { generateTripPlan } from "@/lib/api";

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

function buildMapEmbedUrl(stops) {
  if (!GOOGLE_MAPS_KEY) return null;

  const validCoords = Array.isArray(stops)
    ? stops.filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
    : [];

  // If we have at least two coordinates, show a directions route
  if (validCoords.length >= 2) {
    const coords = validCoords.map((s) => `${s.lat},${s.lng}`);
    const origin = encodeURIComponent(coords[0]);
    const destination = encodeURIComponent(coords[coords.length - 1]);
    const waypoints =
      coords.length > 2
        ? `&waypoints=${encodeURIComponent(coords.slice(1, -1).join("|"))}`
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

export default function TripsScreen({ active, showScreen }) {
  const { token } = useAuth();

  const trips = [
    { title: "Maldives Honeymoon", img: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=300&q=80", dates: "Mar 15 - Mar 22, 2026", travelers: "2 travelers", budget: "$3,408", progress: 35, status: "upcoming", statusLabel: "Upcoming" },
    { title: "Greek Islands Tour", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&q=80", dates: "Feb 28 - Mar 8, 2026", travelers: "4 travelers", budget: "$5,200", progress: 80, status: "active", statusLabel: "Active" },
    { title: "Bali Family Retreat", img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=300&q=80", dates: "Dec 20 - Dec 30, 2025", travelers: "5 travelers", budget: "$4,100", progress: 100, status: "completed", statusLabel: "Completed" },
  ];

  const [mode, setMode] = useState("list");
  const [tripName, setTripName] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [stopCount, setStopCount] = useState(3);
  const [favorites, setFavorites] = useState(["hiking", "dance"]);
  const [plannedStops, setPlannedStops] = useState([]);
  const [aiSource, setAiSource] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState("");

  const mapEmbedUrl = useMemo(() => buildMapEmbedUrl(plannedStops), [plannedStops]);
  const listMapEmbedUrl = useMemo(() => buildMapEmbedUrl([]), []);

  const mapTitle = useMemo(() => {
    const safeName = tripName.trim();
    if (safeName) return safeName;
    return "AI trip preview";
  }, [tripName]);

  function toggleFavorite(id) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
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
      });

      setPlannedStops(Array.isArray(result?.stops) ? result.stops : []);
      setAiSource(result?.source || "gemini");
    } catch (e) {
      setError(e?.message || "Could not generate trip plan.");
    } finally {
      setLoadingPlan(false);
    }
  }

  return (
    <div id="screen-trips" className={`screen ${active ? "active" : ""}`}>
      <div className="main-layout">
        <Sidebar activeItem="trips" logoIcon="🌍" logoText="Dream" logoEm="Trip" userName="Sithil Semitha" userRole="Explorer · Pro" onNavigate={showScreen} />
        <div className="main-content">
          <div className="topbar">
            <div><h1>My Trips ✈️</h1><div className="subtitle">Track and plan all your adventures</div></div>
            <div className="topbar-actions">
              {mode === "list" ? (
                <button
                  type="button"
                  className="btn-teal"
                  style={{ width: "auto", padding: "12px 24px" }}
                  onClick={() => setMode("new")}
                >
                  + New Trip
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-teal"
                  style={{ width: "auto", padding: "12px 24px", background: "var(--gray-100)", color: "var(--gray-600)" }}
                  onClick={() => setMode("list")}
                >
                  ← Back to trips
                </button>
              )}
            </div>
          </div>
          {mode === "list" ? (
            <div className="trips-layout">
              <div>
                <div className="trip-steps">
                  <div className="step-btn active">All Trips</div>
                  <div className="step-btn">Upcoming</div>
                  <div className="step-btn">Active</div>
                  <div className="step-btn">Completed</div>
                </div>
                {trips.map((t, i) => (
                  <div key={i} className="trip-card">
                    <div className="trip-card-img"><img src={t.img} alt={t.title} /></div>
                    <div className="trip-card-body">
                      <h4>{t.title}</h4>
                      <div className="meta">
                        <span>📅 {t.dates}</span>
                        <span>👥 {t.travelers}</span>
                        <span>💰 {t.budget} budget</span>
                      </div>
                      <div style={{ marginTop: 8, background: "var(--gray-100)", borderRadius: 50, height: 6, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${t.progress}%`, background: t.status === "completed" ? "var(--gray-400)" : t.status === "active" ? "#10b981" : "var(--teal)", borderRadius: 50 }} />
                      </div>
                      <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 4 }}>
                        {t.status === "completed" ? "Trip completed" : `Planning: ${t.progress}% complete`}
                      </div>
                    </div>
                    <div className={`trip-status status-${t.status}`}>{t.statusLabel}</div>
                  </div>
                ))}
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
                        background: "#e5f7fb",
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
                          background: "#e5f7fb",
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
                <div className="new-trip-card" style={{ background: "white", borderRadius: 16, boxShadow: "var(--shadow-sm)", padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800 }}>Add New Trip</h3>
                      <div style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}>Enter trip details and let AI generate your stop route</div>
                    </div>
                    <div className="pill pill-teal">AI Planner</div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label>Trip name</label>
                    <input value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="e.g., Sri Lanka Adventure" />
                  </div>

                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label>Trip date</label>
                      <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label>Number of stops</label>
                      <select
                        value={stopCount}
                        onChange={(e) => setStopCount(Number(e.target.value))}
                        style={{
                          width: "100%",
                          border: "1px solid var(--gray-200)",
                          borderRadius: 12,
                          padding: "12px 14px",
                          fontSize: 14,
                          background: "white",
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
                                  onClick={() => toggleFavorite(opt.id)}
                                  style={{
                                    border: activeFavorite ? "1.5px solid var(--teal)" : "1.5px solid var(--gray-200)",
                                    borderRadius: 10,
                                    padding: "9px 8px",
                                    background: activeFavorite ? "var(--teal-light)" : "white",
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
                    <button type="button" className="btn-teal" style={{ flex: 1 }} onClick={handleGeneratePlan} disabled={loadingPlan}>
                      {loadingPlan ? "Generating..." : "Generate Route with AI"}
                    </button>
                    <button
                      type="button"
                      className="btn-teal"
                      style={{ width: "auto", padding: "14px 18px", background: "white", color: "var(--teal)", border: "1.5px solid var(--gray-200)" }}
                      onClick={() => setMode("list")}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
