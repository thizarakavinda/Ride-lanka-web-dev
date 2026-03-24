"use client";

import Sidebar from "../Sidebar";
import { useSettings } from "@/context/SettingsContext";

export default function DetailScreen({ active, showScreen }) {
  const { t } = useSettings();
  return (
    <div id="screen-detail" className={`screen ${active ? "active" : ""}`}>
      <div className="main-layout">
        <Sidebar activeItem="explore" logoIcon="🌍" logoText="Dream" logoEm="Trip" userName="Sithil Semitha" userRole={t("appRoleExplorerPro")} onNavigate={showScreen} />
        <div className="main-content">
          <div className="back-btn" onClick={() => showScreen("screen-home")} role="button" tabIndex={0}>{t("detailBackToExplore")}</div>
          <div className="detail-layout">
            <div className="detail-main">
              <div className="detail-images">
                <div className="main-img"><img src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80" alt="Maldives" style={{ height: "100%" }} /></div>
                <img src="https://images.unsplash.com/photo-1540202404-a2f29564bc01?w=400&q=80" alt="Maldives 2" />
                <img src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80" alt="Maldives 3" />
              </div>
              <div className="tag-row">
                <span className="tag">🏖️ Beach</span>
                <span className="tag">🏊 Water Sports</span>
                <span className="tag">🐠 Snorkeling</span>
                <span className="tag">💆 Spa</span>
                <span className="tag">🍽️ Fine Dining</span>
              </div>
              <h1 className="detail-title">St. Dukes Maldives Resort & Spa</h1>
              <div className="detail-meta">
                <span>📍 North Malé Atoll, Maldives</span>
                <span>⭐ 4.9 (312 reviews)</span>
                <span>🌙 Min. 3 nights</span>
                <span className="pill pill-teal">Available</span>
              </div>
              <p className="detail-desc">
                Experience paradise at St. Dukes Maldives, a luxury overwater resort nestled in a pristine lagoon. Each villa features direct ocean access, a private infinity pool, and panoramic views of the Indian Ocean.
              </p>
              <div className="amenities">
                {["🏊 Infinity Pool", "🍽️ 5 Restaurants", "💆 Full Spa", "🤿 Diving Center", "🎾 Tennis Court", "🛥️ Water Sports", "🌙 Night Snorkeling", "📶 Free WiFi"].map((a, i) => (
                  <div key={i} className="amenity">
                    <div className="icon">{a.split(" ")[0]}</div>
                    <p>{a.slice(2)}</p>
                  </div>
                ))}
              </div>
              <div style={{ height: 220, borderRadius: "var(--radius)", overflow: "hidden", marginBottom: 24, background: "linear-gradient(135deg,#e0f5f2,#7dd8cc)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal-dark)", fontSize: 14, flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 36 }}>🗺️</span>
                <strong>Interactive Map</strong>
                <span style={{ fontSize: 12, opacity: 0.7 }}>North Malé Atoll, Maldives</span>
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Guest Reviews</h4>
              <div className="review-card">
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, flexShrink: 0 }}>JL</div>
                <div>
                  <div className="review-name">Jessica Lane</div>
                  <div className="review-stars">⭐⭐⭐⭐⭐</div>
                  <p className="review-text">Absolutely stunning! The overwater bungalow was breathtaking and the staff were incredibly attentive.</p>
                </div>
              </div>
              <div className="review-card">
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, flexShrink: 0, background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}>AR</div>
                <div>
                  <div className="review-name">Ahmed Rashid</div>
                  <div className="review-stars">⭐⭐⭐⭐⭐</div>
                  <p className="review-text">The underwater dining experience was magical. Crystal clear water and impeccable service.</p>
                </div>
              </div>
            </div>
            <div>
              <div className="booking-card">
                <div className="booking-price">$299 <span>/ night</span></div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 20 }}>
                  <span style={{ color: "#f59e0b", fontSize: 14 }}>⭐ 4.9</span>
                  <span style={{ color: "var(--gray-400)", fontSize: 13 }}>· 312 reviews</span>
                </div>
                <div className="booking-form">
                  <div className="guest-row">
                    <div className="form-group"><label>Check-in</label><input type="date" /></div>
                    <div className="form-group"><label>Check-out</label><input type="date" /></div>
                  </div>
                  <div className="form-group"><label>Guests</label>
                    <select><option>2 Adults</option><option>1 Adult</option><option>2 Adults, 1 Child</option></select>
                  </div>
                  <div className="form-group"><label>Room Type</label>
                    <select><option>Overwater Bungalow</option><option>Beach Villa</option><option>Family Suite</option></select>
                  </div>
                </div>
                <div className="booking-summary">
                  <div className="booking-row"><span>$299 × 5 nights</span><span>$1,495</span></div>
                  <div className="booking-row"><span>Cleaning fee</span><span>$120</span></div>
                  <div className="booking-row"><span>Service fee</span><span>$89</span></div>
                  <div className="booking-row booking-total"><span>Total</span><span>$1,704</span></div>
                </div>
                <button type="button" className="btn-teal">{t("detailBookNow")}</button>
                <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--gray-400)" }}>You won&apos;t be charged yet</div>
                <button type="button" style={{ width: "100%", marginTop: 10, padding: 12, border: "1.5px solid var(--teal)", background: "transparent", color: "var(--teal)", borderRadius: "var(--radius-sm)", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>{t("detailAddToWishlist")}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
