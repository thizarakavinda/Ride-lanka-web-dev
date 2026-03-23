"use client";

import { useMemo, useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import { useAuth } from "@/context/AuthContext";
import { getExplorePlaces } from "@/lib/api";

export default function ExploreScreen({ active, showScreen }) {
  const { user, token } = useAuth();
  const displayName = useMemo(() => user?.displayName || user?.email?.split("@")[0] || "traveler", [user]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [explorePlaces, setExplorePlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (active && token) {
      setLoading(true);
      getExplorePlaces(token)
        .then((data) => setExplorePlaces(data.places || []))
        .catch((err) => console.error("Failed to load explore places", err))
        .finally(() => setLoading(false));
    }
  }, [active, token]);

  // Scroll to top when article is opened
  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    const scrollContainer = document.querySelector("#screen-explore .main-content");
    if (scrollContainer) scrollContainer.scrollTop = 0;
  };

  return (
    <div id="screen-explore" className={`screen ${active ? "active" : ""}`}>
      <div className="main-layout">
        <Sidebar activeItem="explore" userName={displayName} userRole="Trip planner for Sri Lanka" onNavigate={showScreen} />
        <div className="main-content">
          
          {selectedPlace ? (
            <div className="explore-article-view">
              <div className="explore-article-hero" style={{ backgroundImage: `url(${selectedPlace.image})` }}>
                <div className="hero-overlay">
                  <div className="hero-topbar">
                    <button 
                      className="btn-back-article" 
                      onClick={() => setSelectedPlace(null)} 
                    >
                      ← Back to Explore
                    </button>
                  </div>
                  <h1>{selectedPlace.title}</h1>
                </div>
              </div>
              <div className="explore-article-content">
                <p className="article-lead">{selectedPlace.snippet}</p>
                <div className="article-body">
                  <p>{selectedPlace.content}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="topbar">
                <div style={{ paddingBottom: "16px", borderBottom: "1px solid var(--gray-200)", width: "100%" }}>
                  <h1 style={{ fontSize: "2rem", color: "var(--teal-dark)", marginBottom: 8 }}>Explore Sri Lanka</h1>
                  <div className="subtitle" style={{ fontSize: "1.1rem", color: "var(--gray-600)" }}>
                    Discover ancient heritage, cultural wonders, and timeless stories from the pearl of the Indian Ocean.
                  </div>
                </div>
              </div>

              <div className="explore-bento">
                {loading ? (
                  <p style={{ color: "var(--gray-500)", fontSize: "1.1rem" }}>Loading articles...</p>
                ) : explorePlaces.length === 0 ? (
                  <p style={{ color: "var(--gray-500)", fontSize: "1.1rem" }}>Check back later! No places found.</p>
                ) : (
                  explorePlaces.map((place, index) => {
                    let bentoClass = "bento-normal";
                    // Pattern for 1..7: Large, Normal, Normal, Wide, Normal, Normal, Wide
                    const pos = index % 7;
                    if (pos === 0) bentoClass = "bento-large";
                    else if (pos === 3 || pos === 6) bentoClass = "bento-wide";

                    return (
                      <div key={place.id} className={`bento-card ${bentoClass}`} onClick={() => handleSelectPlace(place)}>
                        <div className="bento-bg" style={{ backgroundImage: `url(${place.image})` }} />
                        <div className="bento-overlay">
                          <h3>{place.title}</h3>
                          {(bentoClass === "bento-large" || bentoClass === "bento-wide") && (
                            <p>{place.snippet}</p>
                          )}
                          <span className="read-more">Read More →</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
