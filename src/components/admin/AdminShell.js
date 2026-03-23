"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getQuests, createQuest, deleteQuest, getExplorePlaces, createExplorePlace, deleteExplorePlace } from "@/lib/api";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "quests", label: "Quests", icon: "🎯" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "trips", label: "Trips & routes", icon: "🗺️" },
  { id: "explore", label: "Explore CMS", icon: "📰" },
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
          {section === "explore" && <AdminExploreCMS />}
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
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", reward: "", badgeImage: "" });

  useEffect(() => {
    loadQuests();
  }, []);

  async function loadQuests() {
    try {
      setLoading(true);
      const token = await window.authContextTokenGetter?.(); // Hack to get token if needed, wait.
      const res = await getQuests("dev-admin-token"); // using demo token for now based on Admin access
      setQuests(res.quests || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, badgeImage: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (isCreating) return;
    if (!formData.title || !formData.description) return;
    try {
      setIsCreating(true);
      await createQuest("dev-admin-token", formData);
      setFormData({ title: "", description: "", reward: "", badgeImage: "" });
      // Clear file input visually
      const fileInput = document.getElementById("badge-upload");
      if (fileInput) fileInput.value = "";
      await loadQuests();
    } catch (err) {
      alert("Failed to create quest: " + err.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this quest?")) return;
    try {
      await deleteQuest("dev-admin-token", id);
      await loadQuests();
    } catch (err) {
      alert("Failed to delete quest: " + err.message);
    }
  }

  return (
    <div className="admin-panel">
      <h2>Quests & Challenges</h2>  
      <p style={{ color: "#64748b", marginBottom: 20 }}>
        Create and manage broadcast quests for travelers.
      </p>

      <form className="admin-form" onSubmit={handleCreate} style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap", background: "#f8fafc", padding: "16px", borderRadius: "8px" }}>
        <input 
          type="text" 
          placeholder="Quest Title" 
          value={formData.title} 
          onChange={e => setFormData({ ...formData, title: e.target.value })} 
          style={{ flex: "1 1 200px", padding: "8px" }}
          required
        />
        <input 
          type="text" 
          placeholder="Description" 
          value={formData.description} 
          onChange={e => setFormData({ ...formData, description: e.target.value })} 
          style={{ flex: "2 1 300px", padding: "8px" }}
          required
        />
        <input 
          type="text" 
          placeholder="Reward (e.g. 100 XP)" 
          value={formData.reward} 
          onChange={e => setFormData({ ...formData, reward: e.target.value })} 
          style={{ flex: "1 1 150px", padding: "8px" }}
        />
        <button type="submit" disabled={isCreating} className="admin-btn-solid" style={{ background: "#0d9488", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          {isCreating ? "Adding..." : "+ Create Quest"}
        </button>

        <div style={{ flex: "1 1 100%", marginTop: "8px" }}>
          <label style={{ fontSize: "0.85rem", color: "#64748b", display: "block", marginBottom: "4px" }}>Badge Image (PNG)</label>
          <input 
            id="badge-upload"
            type="file" 
            accept="image/png, image/jpeg" 
            onChange={handleFileChange}
            style={{ padding: "4px", fontSize: "0.9rem" }}
          />
          {formData.badgeImage && (
            <img src={formData.badgeImage} alt="Preview" style={{ height: "40px", width: "40px", objectFit: "cover", marginLeft: "12px", borderRadius: "4px", verticalAlign: "middle" }} />
          )}
        </div>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {loading ? <p>Loading quests...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Reward</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quests.length === 0 ? (
                <tr><td colSpan="4">No quests found. Create one above!</td></tr>
              ) : (
                quests.map(q => (
                  <tr key={q.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {q.badgeImage && (
                          <img src={q.badgeImage} alt="badge" style={{ width: 32, height: 32, borderRadius: 4, objectFit: "cover" }} />
                        )}
                        <strong>{q.title}</strong>
                      </div>
                    </td>
                    <td>{q.description}</td>
                    <td><span className="admin-badge admin-badge-teal">{q.reward}</span></td>
                    <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleDelete(q.id)}
                        className="admin-btn-outline" 
                        style={{ border: "1px solid #ef4444", color: "#ef4444", padding: "4px 8px", fontSize: "0.8rem", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
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

function AdminExploreCMS() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", snippet: "", content: "", image: "" });

  useEffect(() => {
    loadPlaces();
  }, []);

  async function loadPlaces() {
    try {
      setLoading(true);
      const res = await getExplorePlaces("dev-admin-token");
      setPlaces(res.places || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (isCreating) return;
    if (!formData.title || !formData.snippet || !formData.content) return;
    try {
      setIsCreating(true);
      await createExplorePlace("dev-admin-token", formData);
      setFormData({ title: "", snippet: "", content: "", image: "" });
      
      // Clear file input visually
      const fileInput = document.getElementById("explore-img-upload");
      if (fileInput) fileInput.value = "";
      
      await loadPlaces();
    } catch (err) {
      alert("Failed to create post: " + err.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteExplorePlace("dev-admin-token", id);
      await loadPlaces();
    } catch (err) {
      alert("Failed to delete post: " + err.message);
    }
  }

  return (
    <div className="admin-panel">
      <h2>Explore Sri Lanka CMS</h2>  
      <p style={{ color: "#64748b", marginBottom: 20 }}>
        Manage articles for the Explore destination grid. Adding new articles pushes them immediately to users' feeds.
      </p>

      <form className="admin-form" onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px", background: "#f8fafc", padding: "20px", borderRadius: "8px" }}>
        
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input 
            type="text" 
            placeholder="Post Title (e.g. Ruwanwelisaya)" 
            value={formData.title} 
            onChange={e => setFormData({ ...formData, title: e.target.value })} 
            style={{ flex: "1 1 200px", padding: "8px" }}
            required
          />
          <input 
            type="text" 
            placeholder="Short Snippet (displayed on grid card)" 
            value={formData.snippet} 
            onChange={e => setFormData({ ...formData, snippet: e.target.value })} 
            style={{ flex: "2 1 300px", padding: "8px" }}
            required
          />
        </div>

        <textarea 
          placeholder="Full Article Content..." 
          value={formData.content} 
          onChange={e => setFormData({ ...formData, content: e.target.value })} 
          style={{ width: "100%", padding: "10px", minHeight: "100px", resize: "vertical", fontFamily: "inherit" }}
          required
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#64748b", display: "block", marginBottom: "4px" }}>Cover Image (PNG/JPG)</label>
            <input 
              id="explore-img-upload"
              type="file" 
              accept="image/png, image/jpeg" 
              onChange={handleFileChange}
              style={{ padding: "4px", fontSize: "0.9rem" }}
            />
            {formData.image && (
              <img src={formData.image} alt="Preview" style={{ height: "40px", width: "80px", objectFit: "cover", marginLeft: "12px", borderRadius: "4px", verticalAlign: "middle" }} />
            )}
          </div>
          
          <button type="submit" disabled={isCreating} className="admin-btn-solid" style={{ background: "#4f46e5", color: "white", padding: "10px 24px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
            {isCreating ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {loading ? <p>Loading articles...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Snippet</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {places.length === 0 ? (
                <tr><td colSpan="4">No articles found. Initializing missing...</td></tr>
              ) : (
                places.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "180px" }}>
                        {p.image && (
                          <img src={p.image} alt="cover" style={{ width: 48, height: 32, borderRadius: 4, objectFit: "cover" }} />
                        )}
                        <strong>{p.title}</strong>
                      </div>
                    </td>
                    <td><div style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.snippet}</div></td>
                    <td>{new Date(p.createdAt || new Date()).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="admin-btn-outline" 
                        style={{ border: "1px solid #ef4444", color: "#ef4444", padding: "4px 8px", fontSize: "0.8rem", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
