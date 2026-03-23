"use client";

import { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import { useAuth } from "@/context/AuthContext";
import { getQuests } from "@/lib/api";

export default function QuestsScreen({ active, showScreen }) {
  const { user, token } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "traveler";

  useEffect(() => {
    if (active && token) {
      loadQuests();
    }
  }, [active, token]);

  async function loadQuests() {
    try {
      setLoading(true);
      const res = await getQuests(token);
      setQuests(res.quests || []);
    } catch (err) {
      console.error("Failed to load quests:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="screen-quests" className={`screen ${active ? "active" : ""}`}>
      <div className="main-layout">
        <Sidebar activeItem="quests" userName={displayName} userRole="Trip planner for Sri Lanka" onNavigate={showScreen} />
        
        <div className="main-content">
          <div className="topbar">
            <h1>Quests & Challenges</h1>
          </div>
          
          <div className="quests-container" style={{ marginTop: 24, padding: "0 16px" }}>
            <p style={{ color: "var(--text-light)", marginBottom: "24px" }}>
              Complete these quests to earn rewards and upgrade your traveler status!
            </p>

            {loading ? (
              <p>Loading quests...</p>
            ) : quests.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", background: "var(--bg-card)", borderRadius: "12px" }}>
                <p>No quests available right now. Check back later!</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {quests.map((q) => (
                  <div key={q.id} style={{ 
                    background: "var(--bg-card)", 
                    padding: "20px", 
                    borderRadius: "12px", 
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--primary)" }}>{q.title}</h3>
                      <span style={{ 
                        background: "var(--teal-light)", 
                        color: "var(--teal-dark)", 
                        padding: "4px 12px", 
                        borderRadius: "16px",
                        fontSize: "0.85rem",
                        fontWeight: "600"
                      }}>
                        {q.reward}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: "var(--text-main)", lineHeight: "1.5" }}>{q.description}</p>
                    <div style={{ marginTop: "12px" }}>
                      <button className="btn-outline" style={{ fontSize: "0.9rem", padding: "6px 12px" }}>
                        Start Quest
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
