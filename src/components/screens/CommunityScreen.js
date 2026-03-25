"use client";

import Sidebar from "../Sidebar";
import { useSettings } from "@/context/SettingsContext";

export default function CommunityScreen({ active, showScreen }) {
  const { t } = useSettings();
  const posts = [
    { name: "Jessica Lane", avatar: "JL", gradient: "linear-gradient(135deg,#ec4899,#8b5cf6)", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=700&q=80", text: "Just arrived in Santorini and it's even more beautiful than I imagined! The blue domes, the white walls, the incredible sunsets — every photo tells a story.", meta: "Explorer · 48 trips", time: "2h ago", likes: 124, comments: 32 },
    { name: "Ahmed Rashid", avatar: "AR", gradient: "linear-gradient(135deg,#0ba891,#065f52)", img: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=700&q=80", text: "The Maldives is pure paradise. Woke up to turquoise lagoons and crystal-clear waters this morning. The overwater bungalow experience is absolutely surreal!", meta: "Explorer · 22 trips", time: "5h ago", likes: 298, comments: 67 },
  ];

  const suggested = [
    { name: "Sarah Parker", avatar: "SP", trips: "31 trips · Beach lover", gradient: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { name: "Tom Kim", avatar: "TK", trips: "56 trips · Backpacker", gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)" },
    { name: "Maria Rodriguez", avatar: "MR", trips: "18 trips · Foodie traveler", gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)" },
  ];

  const trending = [
    { icon: "🏖️", name: "Maldives", count: "2.4k posts this week" },
    { icon: "🇬🇷", name: "Santorini", count: "1.8k posts this week" },
    { icon: "🌿", name: "Bali", count: "1.2k posts this week" },
    { icon: "🏔️", name: "Swiss Alps", count: "890 posts this week" },
  ];

  return (
    <div id="screen-community" className={`screen ${active ? "active" : ""}`}>
      <div className="main-layout">
        <Sidebar activeItem="community" logoIcon="🌍" logoText="Dream" logoEm="Trip" userRole={t("appRoleExplorerPro")} onNavigate={showScreen} />
        <div className="main-content">
          <div className="topbar"><div><h1>{t("communityTitle")}</h1><div className="subtitle">{t("communitySubtitle")}</div></div></div>
          <div className="social-layout">
            <div>
              {posts.map((p, i) => (
                <div key={i} className="feed-post">
                  <div className="post-header">
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, background: p.gradient }}>{p.avatar}</div>
                    <div><div className="name">{p.name}</div><div style={{ fontSize: 11, color: "var(--gray-400)" }}>{p.meta}</div></div>
                    <div className="time">{p.time}</div>
                  </div>
                  <img className="post-img" src={p.img} alt="" />
                  <p className="post-text">{p.text}</p>
                  <div className="post-actions">
                    <div className="post-action">❤️ {p.likes} Likes</div>
                    <div className="post-action">💬 {p.comments} Comments</div>
                    <div className="post-action">🔗 Share</div>
                    <div className="post-action">🔖 Save</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="follow-card" style={{ marginBottom: 20 }}>
                <h4>Suggested Travelers</h4>
                {suggested.map((s, i) => (
                  <div key={i} className="follow-item">
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, background: s.gradient }}>{s.avatar}</div>
                    <div className="info"><div className="name">{s.name}</div><div className="trips">{s.trips}</div></div>
                    <button type="button" className="follow-btn">Follow</button>
                  </div>
                ))}
              </div>
              <div className="follow-card">
                <h4>Trending Destinations</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {trending.map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: "var(--gray-50)", borderRadius: "var(--radius-sm)", cursor: "pointer" }} onClick={() => showScreen("screen-detail")} role="button" tabIndex={0}>
                      <span style={{ fontSize: 20 }}>{t.icon}</span>
                      <div><div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div><div style={{ fontSize: 11, color: "var(--gray-400)" }}>{t.count}</div></div>
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
