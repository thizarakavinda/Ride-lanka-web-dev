"use client";

import { useMemo, useState } from "react";
import Sidebar from "../Sidebar";

export default function TripsScreen({ active, showScreen }) {
  const trips = [
    { title: "Maldives Honeymoon", img: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=300&q=80", dates: "Mar 15 – Mar 22, 2026", travelers: "2 travelers", budget: "$3,408", progress: 35, status: "upcoming", statusLabel: "Upcoming" },
    { title: "Greek Islands Tour", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&q=80", dates: "Feb 28 – Mar 8, 2026", travelers: "4 travelers", budget: "$5,200", progress: 80, status: "active", statusLabel: "Active" },
    { title: "Bali Family Retreat", img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=300&q=80", dates: "Dec 20 – Dec 30, 2025", travelers: "5 travelers", budget: "$4,100", progress: 100, status: "completed", statusLabel: "Completed" },
  ];

  const [mode, setMode] = useState("list"); // "list" | "new"
  const [tripName, setTripName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [stopDraft, setStopDraft] = useState("");
  const [stops, setStops] = useState([
    { name: "Colombo", note: "Arrival + hotel" },
    { name: "Kandy", note: "Temple of the Tooth" },
    { name: "Nuwara Eliya", note: "Tea country" },
  ]);

  const mapTitle = useMemo(() => {
    const safeLocation = location.trim();
    if (safeLocation) return safeLocation;
    if (stops.length > 0) return `${stops[0].name} route`;
    return "Select a location";
  }, [location, stops]);

  function addStop() {
    const name = stopDraft.trim();
    if (!name) return;
    setStops((prev) => [...prev, { name, note: "" }]);
    setStopDraft("");
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
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "24px 0 16px" }}>Greek Islands — Day by Day</h3>
                <div className="itinerary-day">
                  <div className="day-header">
                    <span className="day-badge">Day 1</span>
                    <h4>Arrival in Athens</h4>
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--gray-400)" }}>Feb 28, 2026</span>
                  </div>
                  {[
                    { time: "09:00", title: "Athens International Airport", desc: "Arrive & collect luggage · Transfer to hotel" },
                    { time: "13:00", title: "Lunch at Monastiraki Square", desc: "Traditional Greek cuisine · Avg. €25/person" },
                    { time: "15:00", title: "Acropolis Museum Visit", desc: "Duration: 2 hours · Tickets: €20" },
                    { time: "20:00", title: "Check-in: Hotel Grande Bretagne", desc: "4 nights booked · Confirmation #HGB-4892" },
                  ].map((a, i) => (
                    <div key={i} className="activity-item">
                      <div className="activity-time">{a.time}</div>
                      <div className="activity-dot" />
                      <div className="activity-info"><h5>{a.title}</h5><p>{a.desc}</p></div>
                    </div>
                  ))}
                </div>
                <div className="itinerary-day">
                  <div className="day-header">
                    <span className="day-badge">Day 2</span>
                    <h4>Santorini Day Trip</h4>
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--gray-400)" }}>Mar 1, 2026</span>
                  </div>
                  {[
                    { time: "07:30", title: "Ferry to Santorini", desc: "Piraeus Port · 8hr journey · Economy class" },
                    { time: "15:30", title: "Oia Village Exploration", desc: "Blue-domed churches, white-washed alleys" },
                    { time: "19:30", title: "Sunset at Oia Castle", desc: "Most famous sunset spot in the world 🌅" },
                  ].map((a, i) => (
                    <div key={i} className="activity-item">
                      <div className="activity-time">{a.time}</div>
                      <div className="activity-dot" />
                      <div className="activity-info"><h5>{a.title}</h5><p>{a.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="map-panel">
                <div className="map-placeholder">
                  <div className="icon">🗺️</div>
                  <strong>Trip Map</strong>
                  <span style={{ fontSize: 12 }}>Greek Islands Route</span>
                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10, padding: "0 24px", width: "100%" }}>
                    {["Athens — Day 1–4", "Santorini — Day 2 (day trip)", "Mykonos — Day 5–8", "Rhodes — Day 9 (return)"].map((s, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
                        <strong>{s.split("—")[0].trim()}</strong> — {s.split("—")[1]?.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="new-trip-layout">
              <div className="new-trip-map">
                <div className="map-placeholder">
                  <div className="icon">📍</div>
                  <strong>Map Preview</strong>
                  <span style={{ fontSize: 12 }}>{mapTitle}</span>
                  <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10, padding: "0 24px", width: "100%" }}>
                    {stops.map((s, i) => (
                      <div key={`${s.name}-${i}`} style={{ background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
                        <strong>Stop {i + 1}:</strong> {s.name}{s.note ? ` · ${s.note}` : ""}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="new-trip-details">
                <div className="new-trip-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800 }}>Add New Trip</h3>
                      <div style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}>Enter your trip location, dates and stops</div>
                    </div>
                    <div className="pill pill-teal">Draft</div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label>Trip name</label>
                      <input value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="e.g., Sri Lanka Adventure" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label>Location</label>
                      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Sri Lanka" />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label>Start date</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label>End date</label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label>Travelers</label>
                    <input type="number" min={1} value={travelers} onChange={(e) => setTravelers(Number(e.target.value || 1))} />
                  </div>

                  <div className="new-trip-stops">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 800 }}>Stops</h4>
                      <span style={{ fontSize: 12, color: "var(--gray-400)" }}>{stops.length} added</span>
                    </div>

                    <div className="new-stop-row">
                      <input
                        value={stopDraft}
                        onChange={(e) => setStopDraft(e.target.value)}
                        placeholder="Add a stop (e.g., Sigiriya)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addStop();
                        }}
                      />
                      <button type="button" className="btn-teal" style={{ width: "auto", padding: "12px 16px" }} onClick={addStop}>
                        Add
                      </button>
                    </div>

                    <div className="new-trip-stop-list">
                      {stops.map((s, i) => (
                        <div key={`${s.name}-${i}`} className="new-trip-stop">
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="stop-index">{i + 1}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                              <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{s.note || "Add a note (optional)"}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="stop-remove"
                            onClick={() => setStops((prev) => prev.filter((_, idx) => idx !== i))}
                            aria-label={`Remove stop ${i + 1}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                    <button type="button" className="btn-teal" style={{ flex: 1 }}>
                      Save Trip
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
