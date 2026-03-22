"use client";

import { useState } from "react";
import Link from "next/link";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "quests", label: "Quests", icon: "🎯" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "trips", label: "Trips & routes", icon: "🗺️" },
  { id: "engagement", label: "Engagement", icon: "💬" },
  { id: "settings", label: "System", icon: "⚙️" },
];

export default function AdminShell({ user, onLogout }) {
  const [section, setSection] = useState("dashboard");
  const devNote = user?.isDevAdmin ? "Demo admin session (no Firebase)" : "Signed in with Firebase";

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark">🛡️</div>
          <div className="admin-brand-text">
            Ride Lanka
            <small>ADMIN PORTAL</small>
          </div>
        </div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={section === item.id ? "active" : ""}
              onClick={() => setSection(item.id)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-link-home" style={{ color: "#5eead4", marginTop: 0 }}>
            ← Public site
          </Link>
          <p style={{ marginTop: 12 }}>{devNote}</p>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <h1>
            {NAV.find((n) => n.id === section)?.label || "Dashboard"}
          </h1>
          <div className="admin-header-actions">
            <div className="admin-user-pill" title={user?.email || ""}>
              <span>{user?.email || "Admin"}</span>
              <span className="admin-badge admin-badge-teal" style={{ margin: 0 }}>
                Admin
              </span>
            </div>
            <button type="button" className="admin-btn-outline" onClick={onLogout}>
              Log out
            </button>
          </div>
        </header>

        <main className="admin-content">
          {section === "dashboard" && <AdminDashboard />}
          {section === "quests" && <AdminQuests />}
          {section === "users" && <AdminUsers />}
          {section === "trips" && <AdminTrips />}
          {section === "engagement" && <AdminEngagement />}
          {section === "settings" && <AdminSettings />}
        </main>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <>
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="label">Active travelers</div>
          <div className="value">—</div>
          <div className="hint">Connect Firestore / API to show live counts</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Trips this month</div>
          <div className="value">—</div>
          <div className="hint">From users/*/trips collection</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">AI plans generated</div>
          <div className="value">—</div>
          <div className="hint">Backend / AI service metrics</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Support tickets</div>
          <div className="value">0</div>
          <div className="hint">Placeholder for future inbox</div>
        </div>
      </div>
      <div className="admin-panel">
        <h2>Recent activity</h2>
        <p className="admin-placeholder">
          This overview is ready for your dissertation demo. Wire it to your backend (e.g. list recent{" "}
          <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>users</code> /{" "}
          <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>trips</code>{" "}
          documents) when you add admin APIs.
        </p>
      </div>
    </>
  );
}

function AdminQuests() {
  return (
    <div className="admin-panel">
      <h2>Quests & challenges</h2>  
      <p className="admin-placeholder">
        Quests are a fun way to gamify travel. Create, edit, and retire quests here in a future iteration. Connect to
        a <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>/api/quests</code> endpoint to manage
        quest data stored in Firestore.
      </p>
    </div>
  );
}

function AdminUsers() {
  return (
    <div className="admin-panel">
      <h2>Registered users</h2>
      <p className="admin-placeholder" style={{ marginBottom: 20 }}>
        Placeholder table. Extend with a secured Cloud Function or backend route that lists Firebase Auth / Firestore{" "}
        <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>users</code> profiles.
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>—</td>
              <td>Traveler</td>
              <td>—</td>
              <td>
                <span className="admin-badge admin-badge-slate">Sample</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminTrips() {
  return (
    <div className="admin-panel">
      <h2>Trips & saved routes</h2>
      <p className="admin-placeholder">
        Trip documents live under <strong>users / {"{uid}"} / trips</strong>. Add an admin-only endpoint to aggregate
        trip names, dates, and statuses for moderation or analytics.
      </p>
    </div>
  );
}

function AdminEngagement() {
  return (
    <div className="admin-panel">
      <h2>Community & events</h2>
      <p className="admin-placeholder">
        Hook this section to your events API (<code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>/api/events</code>)
        or wishlist activity when you expose read endpoints for admins.
      </p>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="admin-panel">
      <h2>System</h2>
      <p className="admin-placeholder">
        Configure API keys, feature flags, and maintenance mode here in a future iteration. Admin access is restricted
        to <strong>admin@gmail.com</strong> after sign-in from the same auth screen as travelers.
      </p>
    </div>
  );
}
