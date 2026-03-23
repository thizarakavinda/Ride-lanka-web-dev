"use client";

import Sidebar from "../Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function ProfileScreen({ active, showScreen }) {
  const { user, logOut } = useAuth();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "traveler";

  async function handleLogout() {
    await logOut();
    showScreen("screen-auth");
    
  }

  return (
    <div id="screen-profile" className={`screen ${active ? "active" : ""}`}>
      <div className="main-layout">
        <Sidebar activeItem="profile" userName={displayName} userRole="Trip planner for Sri Lanka" onNavigate={showScreen} />
        <div className="main-content">
          <div className="topbar"><h1>Profile</h1></div>
          <div style={{ marginTop: 24 }}>
            <p><strong>Name:</strong> {displayName}</p>
            <p><strong>Email:</strong> {user?.email || "-"}</p>

            <div style={{ marginTop: 32, padding: 24, background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-color)" }}>
              <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Traveler Quests</h2>
              <p style={{ color: "var(--text-light)", marginBottom: 16 }}>
                View and complete available quests to earn rewards!
              </p>
              <button className="btn-primary" onClick={() => showScreen("screen-quests")}>
                View Quests
              </button>
            </div>

            <button className="btn-teal" style={{ marginTop: 32 }} onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
