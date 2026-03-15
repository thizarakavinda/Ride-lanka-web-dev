"use client";

import Sidebar from "../Sidebar";

export default function ProfileScreen({ active, showScreen }) {
  return (
    <div id="screen-profile" className={`screen ${active ? "active" : ""}`}>
      <div className="main-layout">
        <Sidebar activeItem="profile" logoIcon="🌍" logoText="Dream" logoEm="Trip" userName="Sithil Semitha" userRole="Explorer · Pro" onNavigate={showScreen} />
        <div className="main-content">
          <div className="topbar"><div><h1>My Profile 👤</h1><div className="subtitle">Manage your account</div></div></div>
          <div className="profile-layout">
            <div className="profile-card">
              <div className="profile-avatar">SS</div>
              <div className="profile-name">Sithil Semitha</div>
              <div className="profile-handle">@sithilsemitha · Explorer Pro</div>
              <button type="button" className="btn-teal" style={{ width: "auto", padding: "10px 24px", fontSize: 13, marginBottom: 20 }}>Edit Profile</button>
              <div className="profile-stats">
                <div className="stat-item"><div className="val">18</div><div className="lbl">Trips</div></div>
                <div className="stat-item"><div className="val">342</div><div className="lbl">Followers</div></div>
                <div className="stat-item"><div className="val">89</div><div className="lbl">Following</div></div>
              </div>
              <div className="profile-menu">
                <div className="profile-menu-item"><div className="left">✈️ My Trips</div><span>›</span></div>
                <div className="profile-menu-item"><div className="left">❤️ Wishlist</div><span>›</span></div>
                <div className="profile-menu-item"><div className="left">⭐ My Reviews</div><span>›</span></div>
                <div className="profile-menu-item"><div className="left">🔔 Notifications</div><span>›</span></div>
                <div className="profile-menu-item" onClick={() => showScreen("screen-settings")} role="button" tabIndex={0}><div className="left">⚙️ Settings</div><span>›</span></div>
                <div className="profile-menu-item" style={{ color: "#ef4444" }}><div className="left" style={{ color: "#ef4444" }}>🚪 Sign Out</div><span>›</span></div>
              </div>
            </div>
            <div className="profile-right">
              <div className="info-card">
                <h4>Personal Information</h4>
                <div className="info-row">
                  <div className="form-group"><label>First Name</label><input defaultValue="Sithil" /></div>
                  <div className="form-group"><label>Last Name</label><input defaultValue="Semitha" /></div>
                </div>
                <div className="info-row">
                  <div className="form-group"><label>Email</label><input defaultValue="sithil.semitha@email.com" /></div>
                  <div className="form-group"><label>Phone</label><input defaultValue="+94 71 234 5678" /></div>
                </div>
                <div className="info-row">
                  <div className="form-group"><label>Location</label><input defaultValue="Negombo, Sri Lanka" /></div>
                  <div className="form-group"><label>Language</label><input defaultValue="English" /></div>
                </div>
                <button type="button" className="btn-teal" style={{ width: "auto", padding: "11px 28px" }}>Save Changes</button>
              </div>
              <div className="info-card">
                <h4>Travel Preferences</h4>
                <div className="info-row">
                  <div className="form-group"><label>Preferred Travel Style</label>
                    <select style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>
                      <option>Adventure & Outdoors</option><option>Luxury</option><option>Budget</option><option>Family</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Currency</label>
                    <select style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>
                      <option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Bio</label>
                  <textarea style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, resize: "vertical", minHeight: 80 }} defaultValue="Passionate traveler exploring the world one destination at a time. 18 countries and counting! 🌍" />
                </div>
                <button type="button" className="btn-teal" style={{ width: "auto", padding: "11px 28px" }}>Save Preferences</button>
              </div>
              <div className="info-card">
                <h4>Travel History</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { title: "Bali, Indonesia", img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=60&q=80", date: "Dec 2025 · 10 days", status: "⭐ Reviewed" },
                    { title: "Santorini, Greece", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=60&q=80", date: "Sep 2025 · 7 days", status: "⭐ Reviewed" },
                    { title: "Swiss Alps, Switzerland", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=60&q=80", date: "Mar 2025 · 5 days", status: "Completed" },
                  ].map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                      <img src={t.img} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div><div style={{ fontSize: 12, color: "var(--gray-400)" }}>{t.date}</div></div>
                      <div className={`pill ${t.status === "Completed" ? "" : "pill-teal"}`}>{t.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
