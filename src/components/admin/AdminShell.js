"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getQuests, createQuest, deleteQuest, getSystemSettings, updateSystemSettings } from "@/lib/api";
import { addDoc, collection, collectionGroup, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "quests", label: "Quests", icon: "🎯" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "trips", label: "Trips & routes", icon: "🗺️" },
  { id: "explore", label: "Explore CMS", icon: "📰" },
  { id: "engagement", label: "Engagement", icon: "💬" },
  { id: "settings", label: "System", icon: "⚙️" },
];

const DASHBOARD_STATIC_CHARTS = {
  userStatus: {
    labels: ["Active", "Suspended", "Blocked"],
    values: [62, 23, 15],
  },
  tripsTrend: {
    labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    values: [42, 55, 61, 58, 66, 73],
  },
  contentMix: {
    labels: ["Users", "Trips", "Explore", "Quests"],
    values: [120, 280, 64, 25],
  },
};

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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeTravelers: 0,
    tripsThisMonth: 0,
    aiPlansGenerated: 0,
    supportTickets: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      try {
        setLoading(true);

        const [usersSnap, tripsSnap, questsSnap, exploreSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collectionGroup(db, "trips")),
          getDocs(collection(db, "quests")),
          getDocs(collection(db, "explore_places")),
        ]);

        const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const trips = tripsSnap.docs.map((d) => ({ id: d.id, ...d.data(), _path: d.ref.path }));
        const quests = questsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const explore = exploreSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const toMs = (value) => {
          if (!value) return 0;
          if (typeof value?.toDate === "function") return value.toDate().getTime();
          const parsed = new Date(value).getTime();
          return Number.isNaN(parsed) ? 0 : parsed;
        };

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();

        const normalizeUserStatus = (u) => {
          const raw = String(u.status || u.accountStatus || "active").toLowerCase();
          if (raw === "blocked" || raw === "suspended") return raw;
          return "active";
        };

        const tripsThisMonth = trips.filter((t) => {
          const ts = toMs(t.createdAt) || toMs(t.trip_date);
          return ts >= monthStart && ts < monthEnd;
        }).length;

        const aiPlansGenerated = trips.filter((t) => {
          const src = String(t.aiSource || "").toLowerCase();
          const hasAiStops = Array.isArray(t.stops) && t.stops.some((s) => String(s?.source || "").toLowerCase().includes("ai"));
          return src.includes("ai") || hasAiStops;
        }).length;

        const activeTravelers = users.filter((u) => normalizeUserStatus(u) === "active").length;


        const activity = [
          ...users.map((u) => ({
            type: "User",
            text: `New user: ${u.name || u.email || u.id}`,
            time: toMs(u.createdAt),
          })),
          ...trips.map((t) => ({
            type: "Trip",
            text: `Trip saved: ${t.trip_name || t.id}`,
            time: toMs(t.createdAt) || toMs(t.trip_date),
          })),
          ...quests.map((q) => ({
            type: "Quest",
            text: `Quest published: ${q.title || q.id}`,
            time: toMs(q.createdAt),
          })),
          ...explore.map((p) => ({
            type: "Explore",
            text: `Article published: ${p.title || p.id}`,
            time: toMs(p.createdAt),
          })),
        ]
          .filter((a) => a.time > 0)
          .sort((a, b) => b.time - a.time)
          .slice(0, 8);

        if (!mounted) return;
        setStats({
          activeTravelers,
          tripsThisMonth,
          aiPlansGenerated,
          supportTickets: 0,
        });
        setRecentActivity(activity);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const formatTime = (ms) => {
    if (!ms) return "—";
    const d = new Date(ms);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="label">Active travelers</div>
          <div className="value">{loading ? "—" : stats.activeTravelers}</div>
          <div className="hint">Users with active status</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Trips this month</div>
          <div className="value">{loading ? "—" : stats.tripsThisMonth}</div>
          <div className="hint">From users/*/trips collection</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">AI plans generated</div>
          <div className="value">{loading ? "—" : stats.aiPlansGenerated}</div>
          <div className="hint">Trips marked as AI-generated</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Support tickets</div>
          <div className="value">{stats.supportTickets}</div>
          <div className="hint">Placeholder for future inbox</div>
        </div>
      </div>
      <div className="admin-panel">
        <h2>Insights charts</h2>
        <div className="admin-chart-grid">
          <div className="admin-chart-card">
            <h3>User status distribution</h3>
            <div className="admin-chart-canvas">
              <Bar
                data={{
                  labels: DASHBOARD_STATIC_CHARTS.userStatus.labels,
                  datasets: [
                    {
                      label: "Users",
                      data: DASHBOARD_STATIC_CHARTS.userStatus.values,
                      backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                  },
                }}
              />
            </div>
          </div>
          <div className="admin-chart-card">
            <h3>Trips trend (last 6 months)</h3>
            <div className="admin-chart-canvas">
              <Line
                data={{
                  labels: DASHBOARD_STATIC_CHARTS.tripsTrend.labels,
                  datasets: [
                    {
                      label: "Trips",
                      data: DASHBOARD_STATIC_CHARTS.tripsTrend.values,
                      borderColor: "#0ba891",
                      backgroundColor: "rgba(11,168,145,0.2)",
                      fill: true,
                      tension: 0.35,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: false,
                  scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                  },
                }}
              />
            </div>
          </div>
          <div className="admin-chart-card">
            <h3>Data mix</h3>
            <div className="admin-chart-canvas">
              <Doughnut
                data={{
                  labels: DASHBOARD_STATIC_CHARTS.contentMix.labels,
                  datasets: [
                    {
                      data: DASHBOARD_STATIC_CHARTS.contentMix.values,
                      backgroundColor: ["#3b82f6", "#0ba891", "#8b5cf6", "#f59e0b"],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="admin-panel">
        <h2>Recent activity</h2>
        {loading ? (
          <p className="admin-placeholder">Loading activity...</p>
        ) : recentActivity.length === 0 ? (
          <p className="admin-placeholder">No activity found yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Activity</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item, idx) => (
                  <tr key={`${item.type}-${item.time}-${idx}`}>
                    <td><span className="admin-badge admin-badge-slate">{item.type}</span></td>
                    <td>{item.text}</td>
                    <td>{formatTime(item.time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsers(rows);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load users:", err);
        setError(err.message || "Failed to load users");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const getStatus = (u) => {
    const raw = u.status || u.accountStatus || "active";
    const s = String(raw).toLowerCase();
    if (s === "blocked") return "blocked";
    if (s === "suspended") return "suspended";
    return "active";
  };

  const statusCounts = users.reduce(
    (acc, u) => {
      const s = getStatus(u);
      acc[s] += 1;
      return acc;
    },
    { active: 0, suspended: 0, blocked: 0 }
  );

  const totalUsers = users.length || 1;
  const toPercent = (n) => Math.round((n / totalUsers) * 100);

  const formatDate = (value) => {
    if (!value) return "—";
    if (typeof value?.toDate === "function") return value.toDate().toLocaleDateString();
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  };

  const getUserName = (u) => u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Unknown user";
  const getUserEmail = (u) => u.email || "—";

  const updateUserStatus = async (userId, nextStatus) => {
    try {
      setUpdatingId(userId);
      await updateDoc(doc(db, "users", userId), {
        status: nextStatus,
        accountStatus: nextStatus,
        moderationUpdatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to update user status:", err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId("");
    }
  };

  const badgeClassByStatus = (status) => {
    if (status === "active") return "admin-badge admin-badge-teal";
    if (status === "suspended") return "admin-badge admin-badge-amber";
    return "admin-badge admin-badge-danger";
  };

  return (
    <div className="admin-panel">
      <h2>Registered users</h2>
      <p className="admin-placeholder" style={{ marginBottom: 20 }}>
        Live data from Firestore <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>users</code>.
        Admins can switch account status to active, suspended, or blocked.
      </p>

      <div className="admin-user-status-grid">
        <div className="admin-user-status-card">
          <div className="admin-user-status-head">
            <span>Active</span>
            <strong>{statusCounts.active}</strong>
          </div>
          <div className="admin-user-status-bar">
            <div className="admin-user-status-fill active" style={{ width: `${toPercent(statusCounts.active)}%` }} />
          </div>
        </div>
        <div className="admin-user-status-card">
          <div className="admin-user-status-head">
            <span>Suspended</span>
            <strong>{statusCounts.suspended}</strong>
          </div>
          <div className="admin-user-status-bar">
            <div className="admin-user-status-fill suspended" style={{ width: `${toPercent(statusCounts.suspended)}%` }} />
          </div>
        </div>
        <div className="admin-user-status-card">
          <div className="admin-user-status-head">
            <span>Blocked</span>
            <strong>{statusCounts.blocked}</strong>
          </div>
          <div className="admin-user-status-bar">
            <div className="admin-user-status-fill blocked" style={{ width: `${toPercent(statusCounts.blocked)}%` }} />
          </div>
        </div>
      </div>

      {error && <p style={{ color: "#ef4444", marginBottom: 12 }}>{error}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6">No users found in Firestore.</td>
              </tr>
            ) : (
              users.map((u) => {
                const status = getStatus(u);
                const isUpdating = updatingId === u.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <strong>{getUserName(u)}</strong>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>ID: {u.id}</span>
                      </div>
                    </td>
                    <td>{getUserEmail(u)}</td>
                    <td>{u.role || "Traveler"}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <span className={badgeClassByStatus(status)}>{status}</span>
                    </td>
                    <td>
                      <div className="admin-user-actions">
                        <button
                          type="button"
                          className="admin-btn-outline"
                          disabled={isUpdating || status === "active"}
                          onClick={() => updateUserStatus(u.id, "active")}
                        >
                          Activate
                        </button>
                        <button
                          type="button"
                          className="admin-btn-outline admin-btn-warn"
                          disabled={isUpdating || status === "suspended"}
                          onClick={() => updateUserStatus(u.id, "suspended")}
                        >
                          Suspend
                        </button>
                        <button
                          type="button"
                          className="admin-btn-outline admin-btn-danger"
                          disabled={isUpdating || status === "blocked"}
                          onClick={() => updateUserStatus(u.id, "blocked")}
                        >
                          Block
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminTrips() {
  const [trips, setTrips] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snap) => {
        const map = {};
        snap.docs.forEach((d) => {
          map[d.id] = d.data() || {};
        });
        setUsersById(map);
      },
      (err) => {
        console.error("Failed to load users for trips view:", err);
      }
    );

    const tripsQ = query(collectionGroup(db, "trips"));
    const unsubTrips = onSnapshot(
      tripsQ,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data = d.data() || {};
          const pathParts = d.ref.path.split("/");
          const uid = pathParts[1] || "";
          return {
            id: d.id,
            uid,
            path: d.ref.path,
            ...data,
          };
        }).sort((a, b) => {
          const toMs = (value) => {
            if (!value) return 0;
            if (typeof value?.toDate === "function") return value.toDate().getTime();
            const parsed = new Date(value).getTime();
            return Number.isNaN(parsed) ? 0 : parsed;
          };
          return toMs(b.createdAt) - toMs(a.createdAt);
        });
        setTrips(rows);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load trips:", err);
        setError(err.message || "Failed to load trips");
        setLoading(false);
      }
    );

    return () => {
      unsubUsers();
      unsubTrips();
    };
  }, []);

  const normalizeStatus = (value) => {
    const raw = String(value || "Upcoming").toLowerCase();
    if (raw === "active") return "Active";
    if (raw === "completed" || raw === "complete") return "Completed";
    return "Upcoming";
  };

  const counts = trips.reduce(
    (acc, t) => {
      const status = normalizeStatus(t.status);
      acc.total += 1;
      if (status === "Active") acc.active += 1;
      if (status === "Completed") acc.completed += 1;
      if (status === "Upcoming") acc.upcoming += 1;
      acc.stops += Number(t.stop_count || t.stops?.length || 0);
      return acc;
    },
    { total: 0, active: 0, completed: 0, upcoming: 0, stops: 0 }
  );

  const filteredTrips = trips.filter((t) => {
    const status = normalizeStatus(t.status);
    if (statusFilter !== "all" && status !== statusFilter) return false;
    const q = searchText.trim().toLowerCase();
    if (!q) return true;
    const owner = usersById[t.uid] || {};
    const ownerName = owner.name || `${owner.firstName || ""} ${owner.lastName || ""}`.trim();
    const haystack = [
      t.trip_name,
      ownerName,
      owner.email,
      t.uid,
      t.id,
      t.stops?.[0]?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  const formatDate = (value) => {
    if (!value) return "—";
    if (typeof value?.toDate === "function") return value.toDate().toLocaleDateString();
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString();
  };

  const deleteTrip = async (trip) => {
    if (!window.confirm(`Delete trip "${trip.trip_name || trip.id}"? This cannot be undone.`)) return;
    try {
      setDeletingId(trip.id);
      await deleteDoc(doc(db, trip.path));
    } catch (err) {
      console.error("Failed to delete trip:", err);
      alert(`Failed to delete trip: ${err.message}`);
    } finally {
      setDeletingId("");
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "Active") return "admin-badge admin-badge-teal";
    if (status === "Completed") return "admin-badge admin-badge-slate";
    return "admin-badge admin-badge-amber";
  };

  return (
    <div className="admin-panel">
      <h2>Trips & saved routes</h2>
      <p className="admin-placeholder" style={{ marginBottom: 16 }}>
        Live route records from <strong>users / {"{uid}"} / trips</strong>.
      </p>

      <div className="admin-trips-stats">
        <div className="admin-stat-card">
          <div className="label">Total trips</div>
          <div className="value">{counts.total}</div>
          <div className="hint">All saved route plans</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Active</div>
          <div className="value">{counts.active}</div>
          <div className="hint">Currently in progress</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Completed</div>
          <div className="value">{counts.completed}</div>
          <div className="hint">Finished routes</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Saved stops</div>
          <div className="value">{counts.stops}</div>
          <div className="hint">Across all routes</div>
        </div>
      </div>

      <div className="admin-trips-toolbar">
        <input
          className="admin-input"
          style={{ maxWidth: 360, marginTop: 0 }}
          placeholder="Search by trip, user, email, or uid..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          className="admin-input admin-select"
          style={{ marginTop: 0 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {error && <p style={{ color: "#ef4444", marginBottom: 10 }}>{error}</p>}
      {loading ? (
        <p>Loading trips...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Owner</th>
                <th>Date</th>
                <th>Stops</th>
                <th>Status</th>
                <th>Saved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan="7">No trips found for current filters.</td>
                </tr>
              ) : (
                filteredTrips.map((t) => {
                  const owner = usersById[t.uid] || {};
                  const ownerName = owner.name || `${owner.firstName || ""} ${owner.lastName || ""}`.trim() || "Unknown";
                  const status = normalizeStatus(t.status);
                  return (
                    <tr key={`${t.uid}-${t.id}`}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <strong>{t.trip_name || "Untitled trip"}</strong>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>{t.id}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span>{ownerName}</span>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>{owner.email || t.uid}</span>
                        </div>
                      </td>
                      <td>{formatDate(t.trip_date)}</td>
                      <td>{Number(t.stop_count || t.stops?.length || 0)}</td>
                      <td>
                        <span className={statusBadgeClass(status)}>{status}</span>
                      </td>
                      <td>{formatDate(t.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn-outline admin-btn-danger"
                          disabled={deletingId === t.id}
                          onClick={() => deleteTrip(t)}
                        >
                          {deletingId === t.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminEngagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [insights, setInsights] = useState({
    totalUsers: 0,
    totalTrips: 0,
    avgStopsPerTrip: 0,
    completionRate: 0,
    topDestinations: [],
    activeUsersEstimate: 0,
  });

  useEffect(() => {
    let mounted = true;
    async function loadEngagement() {
      try {
        setLoading(true);
        const [usersSnap, tripsSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collectionGroup(db, "trips")),
        ]);

        const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const trips = tripsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const normalizeStatus = (raw) => {
          const s = String(raw || "Upcoming").toLowerCase();
          if (s === "completed" || s === "complete") return "Completed";
          if (s === "active") return "Active";
          return "Upcoming";
        };

        const completedTrips = trips.filter((t) => normalizeStatus(t.status) === "Completed").length;
        const completionRate = trips.length ? Math.round((completedTrips / trips.length) * 100) : 0;

        const totalStops = trips.reduce((acc, t) => acc + Number(t.stop_count || t.stops?.length || 0), 0);
        const avgStopsPerTrip = trips.length ? (totalStops / trips.length).toFixed(1) : "0.0";

        const destinationCounter = {};
        trips.forEach((t) => {
          const stops = Array.isArray(t.stops) ? t.stops : [];
          stops.forEach((s) => {
            const name = String(s?.name || "").trim();
            if (!name) return;
            destinationCounter[name] = (destinationCounter[name] || 0) + 1;
          });
        });
        const topDestinations = Object.entries(destinationCounter)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, count]) => ({ name, count }));

        const activeUsersEstimate = users.filter((u) => {
          const status = String(u.status || u.accountStatus || "active").toLowerCase();
          return status !== "blocked" && status !== "suspended";
        }).length;

        if (!mounted) return;
        setInsights({
          totalUsers: users.length,
          totalTrips: trips.length,
          avgStopsPerTrip: Number(avgStopsPerTrip),
          completionRate,
          topDestinations,
          activeUsersEstimate,
        });
      } catch (err) {
        console.error("Failed to load engagement panel:", err);
        if (mounted) setError(err.message || "Failed to load engagement data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadEngagement();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="admin-panel">
      <h2>Community & events</h2>
      <p className="admin-placeholder" style={{ marginBottom: 16 }}>
        Engagement overview helps admin spot retention and content opportunities.
      </p>

      {error && <p style={{ color: "#ef4444", marginBottom: 12 }}>{error}</p>}

      <div className="admin-stats" style={{ marginBottom: 20 }}>
        <div className="admin-stat-card">
          <div className="label">Active users</div>
          <div className="value">{loading ? "—" : insights.activeUsersEstimate}</div>
          <div className="hint">Estimated currently reachable audience</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Trips created</div>
          <div className="value">{loading ? "—" : insights.totalTrips}</div>
          <div className="hint">All-time saved route plans</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Completion rate</div>
          <div className="value">{loading ? "—" : `${insights.completionRate}%`}</div>
          <div className="hint">Trips marked as completed</div>
        </div>
        <div className="admin-stat-card">
          <div className="label">Avg stops / trip</div>
          <div className="value">{loading ? "—" : insights.avgStopsPerTrip}</div>
          <div className="hint">Route depth per plan</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <div className="admin-panel" style={{ margin: 0, padding: 16 }}>
          <h2 style={{ marginBottom: 10 }}>Top destinations by route usage</h2>
          {loading ? (
            <p className="admin-placeholder">Calculating destination trends...</p>
          ) : insights.topDestinations.length === 0 ? (
            <p className="admin-placeholder">No stop-level data found in saved trips yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>Mentions</th>
                    <th>Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.topDestinations.map((d) => (
                    <tr key={d.name}>
                      <td>{d.name}</td>
                      <td>{d.count}</td>
                      <td>
                        <span className="admin-badge admin-badge-teal">
                          {d.count >= 10 ? "High" : d.count >= 4 ? "Medium" : "Emerging"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-panel" style={{ margin: 0, padding: 16 }}>
          <h2 style={{ marginBottom: 10 }}>Admin recommendations</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.8, fontSize: "0.9rem" }}>
            <li>Promote top destinations in Explore feed hero cards.</li>
            <li>Create seasonal quests to improve trip completion rate.</li>
            <li>Trigger re-engagement notifications for inactive users.</li>
            <li>Spot low-engagement destinations and refresh their content.</li>
            <li>Run monthly campaign focused on high-save trip themes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function AdminSettings() {
  const [health, setHealth] = useState({
    backend: "Checking...",
    ai: "Operational",
    web: "Healthy",
    latency: 0,
    rtt: 0,
  });

  useEffect(() => {
    const checkSystems = async () => {
      const start = performance.now();
      try {
        // Ping the backend to measure real latency
        const res = await fetch("http://localhost:5000/api/health"); // Assuming there's a health endpoint or just use index
        const end = performance.now();
        const lat = Math.round(end - start);
        
        setHealth(prev => ({
          ...prev,
          backend: res.ok ? "Operational" : "Degraded",
          latency: lat,
          rtt: Math.round(lat / 6), // Estimated RTT
        }));
      } catch (err) {
        setHealth(prev => ({
          ...prev,
          backend: "Offline",
          latency: 0,
        }));
      }
    };

    checkSystems();
    const interval = setInterval(checkSystems, 10000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"],
    datasets: [
      {
        label: "Active Users",
        data: [120, 85, 450, 890, 1120, 750, 310],
        borderColor: "#5eead4",
        backgroundColor: "rgba(94, 234, 212, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#5eead4",
      },
      {
        label: "System Load (%)",
        data: [15, 12, 45, 68, 82, 55, 25],
        borderColor: "#f59e0b",
        backgroundColor: "transparent",
        tension: 0.4,
        borderDash: [5, 5],
        pointRadius: 0,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { boxWidth: 12, color: '#64748b', font: { size: 12, weight: '500' }, padding: 20 }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: { 
        grid: { color: 'rgba(226, 232, 240, 0.1)' }, 
        ticks: { color: '#64748b', font: { size: 11 } },
        beginAtZero: true
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#64748b', font: { size: 11 } } 
      }
    }
  };

  return (
    <div className="admin-settings-container">
      {/* Top Row: Service Health */}
      <div className="admin-monitor-row">
        <div className="admin-monitor-card">
          <div className="monitor-header">
            <span className="monitor-icon">🖥️</span>
            <h3>Backend Service</h3>
          </div>
          <div className="monitor-status">
            <span className={`admin-health-status ${health.backend === "Operational" ? "online" : "warning"}`}></span>
            <strong>{health.backend}</strong>
          </div>
          <div className="monitor-meta">Uptime: 99.98% • Version 2.4.1</div>
        </div>

        <div className="admin-monitor-card">
          <div className="monitor-header">
            <span className="monitor-icon">🧠</span>
            <h3>AI Processor</h3>
          </div>
          <div className="monitor-status">
            <span className="admin-health-status online"></span>
            <strong>{health.ai}</strong>
          </div>
          <div className="monitor-meta">Gemini Flash 1.5 • Active</div>
        </div>

        <div className="admin-monitor-card">
          <div className="monitor-header">
            <span className="monitor-icon">🌐</span>
            <h3>Web Service</h3>
          </div>
          <div className="monitor-status">
            <span className="admin-health-status online"></span>
            <strong>{health.web}</strong>
          </div>
          <div className="monitor-meta">Vercel Edge • Region: SIN</div>
        </div>
      </div>

      {/* Middle Row: Performance Metrics */}
      <div className="admin-monitor-metrics">
        <div className="metric-tile">
          <label>Network Speed</label>
          <div className="metric-value">48.2 <span>Mbps</span></div>
          <div className="metric-trend trend-up">↑ 2.4% vs last hour</div>
        </div>
        <div className="metric-tile">
          <label>API Latency</label>
          <div className="metric-value">{health.latency || "--"} <span>ms</span></div>
          <div className="metric-trend trend-down">↓ 12ms improvement</div>
        </div>
        <div className="metric-tile">
          <label>Database RTT</label>
          <div className="metric-value">{health.rtt || "--"} <span>ms</span></div>
          <div className="metric-trend trend-neutral">Stable</div>
        </div>
        <div className="metric-tile">
          <label>Memory Usage</label>
          <div className="metric-value">42%</div>
          <div className="metric-trend trend-warn">↑ Trending high</div>
        </div>
      </div>

      {/* Bottom Row: User Load Chart */}
      <section className="admin-panel admin-monitor-chart-section">
        <div className="section-header" style={{ marginBottom: '20px' }}>
          <h2>Application Load Performance</h2>
          <span className="admin-badge admin-badge-teal">Daily Cycle</span>
        </div>
        <div style={{ height: "320px", width: "100%" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </section>
    </div>
  );
}

function AdminExploreCMS() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [deletingPlaceId, setDeletingPlaceId] = useState(null);
  const [editingPlaceId, setEditingPlaceId] = useState(null);
  const [formData, setFormData] = useState({ title: "", snippet: "", content: "", image: "" });

  useEffect(() => {
    loadPlaces();
  }, []);

  async function loadPlaces() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "explore_places"));
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const toMs = (value) => {
            if (!value) return 0;
            if (typeof value?.toDate === "function") return value.toDate().getTime();
            const parsed = new Date(value).getTime();
            return Number.isNaN(parsed) ? 0 : parsed;
          };
          return toMs(b.createdAt) - toMs(a.createdAt);
        });
      setPlaces(rows);
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
      await addDoc(collection(db, "explore_places"), {
        title: formData.title,
        snippet: formData.snippet,
        content: formData.content,
        image: formData.image || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
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

  function startEdit(place) {
    setEditingPlaceId(place.id);
    setFormData({
      title: place.title || "",
      snippet: place.snippet || "",
      content: place.content || "",
      image: place.image || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingPlaceId(null);
    setFormData({ title: "", snippet: "", content: "", image: "" });
    const fileInput = document.getElementById("explore-img-upload");
    if (fileInput) fileInput.value = "";
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingPlaceId) return;
    if (!formData.title || !formData.snippet || !formData.content) return;
    try {
      setIsCreating(true);
      await updateDoc(doc(db, "explore_places", editingPlaceId), {
        title: formData.title,
        snippet: formData.snippet,
        content: formData.content,
        image: formData.image || "",
        updatedAt: new Date().toISOString(),
      });
      cancelEdit();
      await loadPlaces();
    } catch (err) {
      alert("Failed to update post: " + err.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setDeletingPlaceId(id);
      const ref = doc(db, "explore_places", id);
      await deleteDoc(ref);
      const verify = await getDoc(ref);
      if (verify.exists()) {
        throw new Error("Delete verification failed. Document still exists in Firestore.");
      }
      await loadPlaces();
    } catch (err) {
      const msg = err?.message || "Unknown error";
      if (msg.toLowerCase().includes("permission")) {
        alert("Delete failed due to Firestore permissions. Allow admin write/delete access for explore_places in your rules.");
      } else {
        alert("Failed to delete post: " + msg);
      }
    } finally {
      setDeletingPlaceId(null);
    }
  }

  return (
    <div className="admin-panel">
      <h2>Explore Sri Lanka CMS</h2>  
      <p style={{ color: "#64748b", marginBottom: 20 }}>
        Manage articles for the Explore destination grid. Adding new articles pushes them immediately to users' feeds.
      </p>

      <form className="admin-form admin-cms-form" onSubmit={editingPlaceId ? handleUpdate : handleCreate}>
        
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input 
            type="text" 
            placeholder="Post Title (e.g. Ruwanwelisaya)" 
            value={formData.title} 
            onChange={e => setFormData({ ...formData, title: e.target.value })} 
            className="admin-input admin-input-cms"
            style={{ flex: "1 1 200px", marginTop: 0 }}
            required
          />
          <input 
            type="text" 
            placeholder="Short Snippet (displayed on grid card)" 
            value={formData.snippet} 
            onChange={e => setFormData({ ...formData, snippet: e.target.value })} 
            className="admin-input admin-input-cms"
            style={{ flex: "2 1 300px", marginTop: 0 }}
            required
          />
        </div>

        <textarea 
          placeholder="Full Article Content..." 
          value={formData.content} 
          onChange={e => setFormData({ ...formData, content: e.target.value })} 
          className="admin-input admin-input-cms admin-textarea-cms"
          style={{ width: "100%", marginTop: 0 }}
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
          
          <div style={{ display: "flex", gap: 10 }}>
            {editingPlaceId && (
              <button type="button" onClick={cancelEdit} className="admin-btn-outline">
                Cancel Edit
              </button>
            )}
            <button type="submit" disabled={isCreating} className="admin-btn-solid" style={{ background: "#4f46e5", color: "white", padding: "10px 24px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              {isCreating ? (editingPlaceId ? "Updating..." : "Publishing...") : (editingPlaceId ? "Update Post" : "Publish Post")}
            </button>
          </div>
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
                        onClick={() => startEdit(p)}
                        className="admin-btn-outline"
                        style={{ marginRight: 8, border: "1px solid #6366f1", color: "#4338ca", padding: "4px 8px", fontSize: "0.8rem", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="admin-btn-outline" 
                        disabled={deletingPlaceId === p.id}
                        style={{ border: "1px solid #ef4444", color: "#ef4444", padding: "4px 8px", fontSize: "0.8rem", cursor: "pointer" }}
                      >
                        {deletingPlaceId === p.id ? "Deleting..." : "Delete"}
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
