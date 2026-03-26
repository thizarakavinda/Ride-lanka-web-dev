"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { listPublicGuides, listBookingsForTraveller, GUIDE_EXPERTISE_OPTIONS } from "@/lib/tourGuides";

export default function TourGuidesScreen({ active, showScreen }) {
  const { user } = useAuth();
  const { t } = useSettings();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "traveler";
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listPublicGuides();
      setGuides(list);
    } catch {
      setGuides([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) {
      load();
      if (user?.uid) {
        setBookingsLoading(true);
        listBookingsForTraveller(user.uid)
          .then(setMyBookings)
          .catch(() => setMyBookings([]))
          .finally(() => setBookingsLoading(false));
      }
    }
  }, [active, load, user]);

  const filtered = useMemo(() => {
    let list = guides;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.displayName.toLowerCase().includes(q) ||
          (g.location || "").toLowerCase().includes(q) ||
          (g.headline || "").toLowerCase().includes(q)
      );
    }
    if (expertiseFilter.length) {
      list = list.filter((g) => expertiseFilter.every((id) => (g.expertise || []).includes(id)));
    }
    if (minRating > 0) {
      list = list.filter((g) => (g.ratingAvg || 0) >= minRating);
    }
    return list;
  }, [guides, search, expertiseFilter, minRating]);

  function toggleExpertise(id) {
    setExpertiseFilter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div id="screen-tour-guides" className={`screen ${active ? "active" : ""}`}>
      <div className="main-layout">
        <Sidebar activeItem="tour-guides" userName={displayName} userRole={t("appRoleTripPlanner")} onNavigate={showScreen} />
        <div className="main-content">
          <div className="topbar">
            <div>
              <h1>{t("guidesTitle")}</h1>
              <div className="subtitle">{t("guidesSubtitle")}</div>
            </div>
          </div>

          {user && (
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
              <div className="section-header" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{t("myBookingRequestsTitle")}</h3>
              </div>
              
              {bookingsLoading ? (
                <p className="subtitle">{t("loadingData")}</p>
              ) : myBookings.length === 0 ? (
                <p className="subtitle" style={{ fontSize: '0.9rem' }}>{t("noTravelerBookings")}</p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {myBookings.map((b) => (
                    <div key={b.id} className="past-booking-item" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="past-info">
                        <span className="past-name">
                          {t("homeTripStyle")} {t("withGuideLabel")} {b.guideDisplayName || "Tour Guide"}
                        </span>
                        <span className="past-meta">
                          📍 {b.destination} • 📅 {b.tourDate}
                        </span>
                      </div>
                      <span className={`status-tag ${b.status}`}>
                        {b.status === 'accepted' ? t("bookingStatusAccepted") : 
                         b.status === 'rejected' ? t("bookingStatusRejected") : 
                         t("bookingStatusPending")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="settings-card" style={{ marginBottom: 24, padding: 20 }}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>{t("guidesSearch")}</label>
              <input
                className="input-field"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("guidesSearchPh")}
                style={{ width: "100%", maxWidth: 420 }}
              />
            </div>
            <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 13 }}>{t("guidesFilterExpertise")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {GUIDE_EXPERTISE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`cat-chip${expertiseFilter.includes(opt.id) ? " active" : ""}`}
                  onClick={() => toggleExpertise(opt.id)}
                >
                  {t("exp" + opt.id.charAt(0).toUpperCase() + opt.id.slice(1))}
                </button>
              ))}
            </div>
            <div className="form-group" style={{ marginBottom: 0, maxWidth: 200 }}>
              <label>{t("guidesMinRating")}</label>
              <select className="input-field" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} style={{ width: "100%" }}>
                <option value={0}>{t("guidesAnyRating")}</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={4.5}>4.5+</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="subtitle">{t("guidesLoading")}</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 48, color: "var(--gray-400)" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>🧭</div>
              <h3>{t("guidesEmptyTitle")}</h3>
              <p>{t("guidesEmptyDesc")}</p>
            </div>
          ) : (
            <div className="cards-grid cards-grid-3" style={{ marginTop: 8 }}>
              {filtered.map((g) => (
                <div
                  key={g.userId}
                  className="guide-select-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => showScreen("screen-guide-detail", { guideId: g.userId })}
                  onKeyDown={(e) => e.key === "Enter" && showScreen("screen-guide-detail", { guideId: g.userId })}
                >
                  <div className="guide-select-thumb">
                    <img
                      src={g.photoURL || `https://source.unsplash.com/320x320/?portrait,guide,${encodeURIComponent(g.location || "Sri Lanka")}`}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80";
                      }}
                    />
                  </div>

                  <div className="guide-select-body">
                    <div className="guide-select-text">
                      <div className="guide-select-title-row">
                        <h4>{g.displayName}</h4>
                        <span className="guide-select-rating">
                          ⭐ {g.ratingAvg ? g.ratingAvg.toFixed(1) : "—"}
                          {g.ratingCount ? ` (${g.ratingCount})` : ""}
                        </span>
                      </div>

                      <div className="guide-select-location">📍 {g.location || "Sri Lanka"}</div>
                      <div className="guide-select-headline">
                        {g.headline || g.bio?.slice(0, 80) || "—"}
                      </div>
                    </div>

                    <div className="guide-select-bottom">
                      <span className="guide-select-price">{g.hourlyRate ? `LKR ${g.hourlyRate}/hr` : "—"}</span>
                    </div>
                  </div>

                  <div className="guide-select-action">
                    <button
                      type="button"
                      className="guide-select-btn"
                      aria-label={t("guidesViewProfile")}
                      onClick={(e) => {
                        e.stopPropagation();
                        showScreen("screen-guide-detail", { guideId: g.userId });
                      }}
                    >
                      <span aria-hidden="true">👁</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
