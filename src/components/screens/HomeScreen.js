"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../Sidebar";
import { useAuth } from "@/context/AuthContext";
import { getRecommendations, refreshRecommendations, trackEvent, fetchPlaceCulture } from "@/lib/api";

function AiPlaceCard({ place, token, showScreen }) {
  const fallbackImg = `https://source.unsplash.com/400x220/?${encodeURIComponent(place.name + " Sri Lanka")}`;

  function handleClick() {
    trackEvent(token, {
      place_name: place.name,
      category: place.category || "general",
      action: "view",
    });
    
    // Normalize place object for Home Place Detail
    const normalized = {
      name: place.name,
      description: place.description,
      image: place.photo_url || fallbackImg,
      category: place.category
    };
    showScreen(normalized);
  }

  return (
    <div className="dest-card" role="button" tabIndex={0} onClick={handleClick} onKeyDown={(e) => e.key === "Enter" && handleClick()}>
      <div className="card-img">
        <img src={place.photo_url || fallbackImg} alt={place.name} onError={(e) => { e.currentTarget.src = fallbackImg; }} />
        <span className="card-badge">{place.category || "general"}</span>
      </div>
      <div className="card-body">
        <h4>{place.name}</h4>
        <div className="card-location">{place.description}</div>
        <div className="card-footer">
          <span className="card-rating">{place.rating ? `Rating ${place.rating}` : ""}</span>
          <span className="card-price">Open map</span>
        </div>
      </div>
    </div>
  );
}

function AiRecommendationsSection({ token, showScreen }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadRecommendations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await getRecommendations(token);
      if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        setPlaces(data.recommendations);
      } else {
        const fresh = await refreshRecommendations(token);
        setPlaces(fresh.recommendations || []);
      }
    } catch {
      setError("Could not load recommendations. Ensure backend and AI are running.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  async function handleRefresh() {
    if (!token || refreshing) return;
    setRefreshing(true);
    setError("");
    try {
      const fresh = await refreshRecommendations(token);
      setPlaces(fresh.recommendations || []);
    } catch {
      setError("Refresh failed.");
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) return <p style={{ color: "#666" }}>Loading recommendations...</p>;
  if (error) return <p style={{ color: "#c00" }}>{error}</p>;
  if (places.length === 0) return null;

  return (
    <>
      <div className="section-header">
        <h3>Recommended for you by AI</h3>
        <span className="see-all" role="button" tabIndex={0} onClick={handleRefresh}>
          {refreshing ? "Refreshing..." : "Refresh AI"}
        </span>
      </div>
      <div className="cards-grid cards-grid-3">
        {places.map((p, i) => (
          <AiPlaceCard key={`${p.name}-${i}`} place={p} token={token} showScreen={showScreen} />
        ))}
      </div>
    </>
  );
}

function HomePlaceDetail({ place, token, onClose }) {
  const [cultureInfo, setCultureInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!place || !token) return;
    setLoading(true);
    // Fetch AI cultural insights
    fetchPlaceCulture(token, place.name)
      .then((data) => setCultureInfo(data))
      .catch((err) => {
        console.error("Culture fetch error:", err);
        setCultureInfo({ error: "Could not load detailed AI insights for this location right now." });
      })
      .finally(() => setLoading(false));
      
    // Scroll to top
    const scrollContainer = document.querySelector("#screen-home .main-content");
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }, [place, token]);

  if (!place) return null;

  return (
    <div className="explore-article-view">
      <div className="explore-article-hero" style={{ backgroundImage: `url(${place.image})` }}>
        <div className="hero-overlay">
          <div className="hero-topbar">
            <button className="btn-back-article" onClick={onClose}>
              ← Back to Home
            </button>
          </div>
          <h1 style={{ fontSize: "3rem" }}>{place.name}</h1>
          <div style={{ marginTop: "12px" }}>
            <span className="card-badge" style={{ fontSize: "1rem", padding: "6px 12px" }}>{place.category || "Destination"}</span>
          </div>
        </div>
      </div>
      <div className="explore-article-content" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <p className="article-lead" style={{ fontSize: "1.3rem", color: "var(--gray-600)", borderLeft: "4px solid var(--teal-main)", paddingLeft: "16px", marginBottom: "40px" }}>
          {place.description}
        </p>
        
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ height: "24px", width: "100%", background: "#f1f5f9", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
            <div style={{ height: "24px", width: "80%", background: "#f1f5f9", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
            <div style={{ height: "24px", width: "90%", background: "#f1f5f9", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
            <p style={{ color: "var(--gray-400)", marginTop: "12px", fontStyle: "italic" }}>✨ AI is compiling cultural and seasonal insights...</p>
          </div>
        ) : cultureInfo?.error ? (
          <div style={{ background: "#fff1f2", color: "#e11d48", padding: "16px", borderRadius: "8px" }}>
            {cultureInfo.error}
          </div>
        ) : (
          <div className="article-body">
            {/* The python backend typically returns culture, history, tips or raw text */}
            {cultureInfo?.culture && (
              <>
                <h2>Cultural Significance</h2>
                <p>{cultureInfo.culture}</p>
              </>
            )}
            {cultureInfo?.history && (
              <>
                <h2>Historical Background</h2>
                <p>{cultureInfo.history}</p>
              </>
            )}
            {cultureInfo?.seasonal && (
              <>
                <h2>Weather & Best Time to Visit</h2>
                <p>{cultureInfo.seasonal}</p>
              </>
            )}
            {cultureInfo?.tips && (
              <>
                <h2>Traveler Tips</h2>
                <p>{cultureInfo.tips}</p>
              </>
            )}
            {/* Fallback if backend just returns a single text block */}
            {cultureInfo?.text && (
              <>
                <h2>Insights</h2>
                <p>{cultureInfo.text}</p>
              </>
            )}
            {/* Render any other keys as paragraphs if the object structure is unpredictable */}
            {!cultureInfo?.culture && !cultureInfo?.history && !cultureInfo?.text && Object.keys(cultureInfo || {}).map(key => (
              typeof cultureInfo[key] === 'string' && (
                <div key={key}>
                  <h2 style={{ textTransform: "capitalize" }}>{key.replace(/_/g, ' ')}</h2>
                  <p>{cultureInfo[key]}</p>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomeScreen({ active, showScreen }) {
  const [activeCategory, setActiveCategory] = useState("beach");
  const [selectedHomePlace, setSelectedHomePlace] = useState(null);
  const { token, user } = useAuth();
  const displayName = useMemo(() => user?.displayName || user?.email?.split("@")[0] || "traveler", [user]);

  const popular = [
    { title: "Cultural Triangle Explorer", location: "Sigiriya · Dambulla · Kandy", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80", badge: "7 days", rating: "4.8", trips: "2134", description: "Journey through the ancient heart of Sri Lanka.", category: "culture" },
    { title: "South Coast Highlights", location: "Colombo · Galle · Mirissa", img: "https://images.unsplash.com/photo-1526481280695-3c687fd543c0?w=400&q=80", badge: "5 days", rating: "4.7", trips: "1042", description: "Sun, sand, and colonial heritage on the tropical south coast.", category: "beach" },
    { title: "Hill Country and Safari", location: "Kandy · Ella · Yala", img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80", badge: "10 days", rating: "4.9", trips: "864", description: "Mist-shrouded tea plantations and thrilling leopard safaris.", category: "wildlife" },
  ];

  const hiddenGems = [
    { title: "Secret Beaches of Tangalle", location: "Deep South Coast", img: "https://images.unsplash.com/photo-1574673322047-bfac83e1cfa1?w=400&q=80", badge: "Relax", rating: "4.9", trips: "340", description: "Escape the crowds and discover pristine, untouched bays.", category: "beach" },
    { title: "Knuckles Mountain Range", location: "Central Highlands", img: "https://images.unsplash.com/photo-1583492770851-bc0004ffbccb?w=400&q=80", badge: "Trek", rating: "4.8", trips: "128", description: "A UNESCO World Heritage site perfect for hardcore trekkers.", category: "nature" },
    { title: "Jaffna Peninsula", location: "Northern Sri Lanka", img: "https://images.unsplash.com/photo-1624647970792-71ab523b09de?w=400&q=80", badge: "Culture", rating: "4.6", trips: "591", description: "Distinctive Tamil culture, colorful temples, and unique cuisine.", category: "culture" },
  ];

  const adventures = [
    { title: "Surfing at Arugam Bay", location: "East Coast", img: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&q=80", badge: "Surf", rating: "4.9", trips: "1150", description: "Catch world-class waves at one of the top surfing spots globally.", category: "adventure" },
    { title: "White Water Rafting", location: "Kitulgala", img: "https://images.unsplash.com/photo-1533580554160-c3d3ddcc1bd2?w=400&q=80", badge: "Adrenaline", rating: "4.7", trips: "890", description: "Conquer the roaring rapids of the Kelani River in lush jungles.", category: "adventure" },
    { title: "Hot Air Ballooning", location: "Dambulla", img: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&q=80", badge: "Scenic", rating: "4.8", trips: "245", description: "Float above ancient monuments and serene lakes at sunrise.", category: "adventure" },
  ];

  const categoryPlaces = {
    beach: [
      { title: "Mirissa Beach", location: "South Coast", img: "https://images.unsplash.com/photo-1549473889-14f410d83298?w=400&q=80", badge: "Surf & Chill", rating: "4.8", trips: "3200", description: "Famous for whale watching, surfing, and swaying palm trees.", category: "beach" },
      { title: "Unawatuna", location: "Galle District", img: "https://images.unsplash.com/photo-1574673322047-bfac83e1cfa1?w=400&q=80", badge: "Swimming", rating: "4.7", trips: "2100", description: "A beautifully curved bay perfect for safe swimming and relaxing.", category: "beach" },
      { title: "Nilaveli", location: "East Coast", img: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&q=80", badge: "Snorkeling", rating: "4.9", trips: "1400", description: "Crystal clear shallow waters and nearby Pigeon Island.", category: "beach" }
    ],
    hill: [
      { title: "Ella Rock", location: "Ella", img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80", badge: "Hiking", rating: "4.9", trips: "4500", description: "A stunning viewpoint overlooking valleys and tea plantations.", category: "hill" },
      { title: "Nuwara Eliya", location: "Central Province", img: "https://images.unsplash.com/photo-1583492770851-bc0004ffbccb?w=400&q=80", badge: "Cool Climate", rating: "4.6", trips: "1800", description: "Known as 'Little England' for its colonial architecture and cool weather.", category: "hill" },
      { title: "Horton Plains", location: "Ohiya", img: "https://images.unsplash.com/photo-1624647970792-71ab523b09de?w=400&q=80", badge: "World's End", rating: "4.8", trips: "2200", description: "A unique plateau leading to the dramatic World's End precipice.", category: "hill" }
    ],
    cultural: [
      { title: "Sigiriya Lion Rock", location: "Matale", img: "https://images.unsplash.com/photo-1588096344390-8b0101b44917?w=400&q=80", badge: "Heritage", rating: "4.9", trips: "8900", description: "An ancient palace and fortress complex atop a massive rock.", category: "culture" },
      { title: "Temple of the Tooth", location: "Kandy", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80", badge: "Sacred", rating: "4.8", trips: "6200", description: "Houses the sacred tooth relic of Lord Buddha.", category: "culture" },
      { title: "Polonnaruwa Vatadage", location: "Polonnaruwa", img: "https://images.unsplash.com/photo-1632832971206-88d4078ea222?w=400&q=80", badge: "Ruins", rating: "4.7", trips: "3100", description: "Ancient stupa house in the second capital of Sri Lanka.", category: "culture" }
    ],
    nature: [
      { title: "Yala National Park", location: "South East", img: "https://images.unsplash.com/photo-1533580554160-c3d3ddcc1bd2?w=400&q=80", badge: "Leopards", rating: "4.8", trips: "5100", description: "Sri Lanka's most famous wildlife park, home to elusive leopards.", category: "nature" },
      { title: "Udawalawe", location: "Sabaragamuwa", img: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&q=80", badge: "Elephants", rating: "4.9", trips: "3400", description: "Outstanding park for observing large herds of Asian elephants.", category: "nature" },
      { title: "Sinharaja Forest", location: "South West", img: "https://images.unsplash.com/photo-1558223681-3be2cdfae513?w=400&q=80", badge: "Rainforest", rating: "4.7", trips: "1200", description: "A biodiversity hotspot and original rainforest of Sri Lanka.", category: "nature" }
    ],
    food: [
      { title: "Colombo Street Food", location: "Galle Face Green", img: "https://images.unsplash.com/photo-1591873215206-cfa39247eb97?w=400&q=80", badge: "Isso Vadei", rating: "4.8", trips: "2900", description: "Taste fresh seafood and street snacks as the sun sets over the ocean.", category: "food" },
      { title: "Jaffna Cuisine", location: "Jaffna", img: "https://images.unsplash.com/photo-1624647970792-71ab523b09de?w=400&q=80", badge: "Spicy", rating: "4.9", trips: "850", description: "Experience unique northern spices, crab curries, and palmyra treats.", category: "food" },
      { title: "Tea Tasting", location: "Hatton", img: "https://images.unsplash.com/photo-1583492770851-bc0004ffbccb?w=400&q=80", badge: "Ceylon Tea", rating: "4.7", trips: "1600", description: "Visit historic factories and sip world-renowned Ceylon tea.", category: "food" }
    ],
    family: [
      { title: "Turtle Hatchery", location: "Kosgoda", img: "https://images.unsplash.com/photo-1526481280695-3c687fd543c0?w=400&q=80", badge: "Conservation", rating: "4.8", trips: "4100", description: "Release baby turtles into the ocean—a great experience for kids.", category: "family" },
      { title: "Pinnawala Combo", location: "Kegalle", img: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&q=80", badge: "Orphanage", rating: "4.6", trips: "3800", description: "Watch elephants bathe in the river right next to your viewing deck.", category: "family" },
      { title: "Train to Ella", location: "Kandy to Ella", img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80", badge: "Scenic Journey", rating: "4.9", trips: "7200", description: "A magical and comfortable train ride through the misty mountains.", category: "family" }
    ]
  };

  function handleCardClick(card) {
    if (token) {
      trackEvent(token, { place_name: card.title, category: card.category, action: "view" });
    }
    const normalized = {
      name: card.title,
      description: card.description || card.location,
      image: card.img,
      category: card.category
    };
    setSelectedHomePlace(normalized);
  }

  return (
    <div id="screen-home" className={`screen ${active ? "active" : ""}`}>
      <div className="main-layout">
        <Sidebar activeItem="home" userName={displayName} userRole="Trip planner for Sri Lanka" onNavigate={showScreen} />
        <div className="main-content">
          
          {selectedHomePlace ? (
            <HomePlaceDetail 
              place={selectedHomePlace} 
              token={token} 
              onClose={() => setSelectedHomePlace(null)} 
            />
          ) : (
            <>
              <div className="topbar">
                <div>
                  <h1>Plan your Sri Lanka trip</h1>
                  <div className="subtitle">Good morning, {displayName}.</div>
                </div>
              </div>

              {token && <AiRecommendationsSection token={token} showScreen={setSelectedHomePlace} />}

              <div className="section-header" style={{ marginTop: "40px" }}><h3>Trip style</h3></div>
              <div className="categories">
                {[
                  { id: "beach", label: "Beach and Relax" },
                  { id: "hill", label: "Hill Country" },
                  { id: "cultural", label: "Cultural Triangle" },
                  { id: "nature", label: "Nature and Wildlife" },
                  { id: "food", label: "Food and Local Life" },
                  { id: "family", label: "Family Friendly" },
                ].map((cat) => (
                  <div key={cat.id} className={`cat-chip ${activeCategory === cat.id ? "active" : ""}`} onClick={() => setActiveCategory(cat.id)} role="button" tabIndex={0}>
                    {cat.label}
                  </div>
                ))}
              </div>

              {/* Dynamic Trip Style Grid based on active category */}
              <div className="cards-grid cards-grid-3" style={{ marginTop: "24px" }}>
                {(categoryPlaces[activeCategory] || []).map((card) => (
                  <div key={card.title} className="dest-card" role="button" tabIndex={0} onClick={() => handleCardClick(card)}>
                    <div className="card-img">
                      <img src={card.img} alt={card.title} />
                      <span className="card-badge">{card.badge}</span>
                    </div>
                    <div className="card-body">
                      <h4>{card.title}</h4>
                      <div className="card-location">{card.location}</div>
                      <div className="card-footer">
                        <span className="card-rating">{card.rating} ({card.trips} trips)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="section-header" style={{ marginTop: "40px" }}>
                <h3>Popular itineraries in Sri Lanka</h3>
              </div>
              <div className="cards-grid cards-grid-3">
                {popular.map((card) => (
                  <div key={card.title} className="dest-card" role="button" tabIndex={0} onClick={() => handleCardClick(card)}>
                    <div className="card-img">
                      <img src={card.img} alt={card.title} />
                      <span className="card-badge">{card.badge}</span>
                    </div>
                    <div className="card-body">
                      <h4>{card.title}</h4>
                      <div className="card-location">{card.location}</div>
                      <div className="card-footer">
                        <span className="card-rating">{card.rating} ({card.trips} trips)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="section-header" style={{ marginTop: "40px" }}>
                <h3>Hidden Gems & Off the Beaten Path</h3>
              </div>
              <div className="cards-grid cards-grid-3">
                {hiddenGems.map((card) => (
                  <div key={card.title} className="dest-card" role="button" tabIndex={0} onClick={() => handleCardClick(card)}>
                    <div className="card-img">
                      <img src={card.img} alt={card.title} />
                      <span className="card-badge" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.8)" }}>{card.badge}</span>
                    </div>
                    <div className="card-body">
                      <h4>{card.title}</h4>
                      <div className="card-location">{card.location}</div>
                      <div className="card-footer">
                        <span className="card-rating">{card.rating} ({card.trips} trips)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="section-header" style={{ marginTop: "40px" }}>
                <h3>Thrilling Adventures</h3>
              </div>
              <div className="cards-grid cards-grid-3" style={{ marginBottom: "60px" }}>
                {adventures.map((card) => (
                  <div key={card.title} className="dest-card" role="button" tabIndex={0} onClick={() => handleCardClick(card)}>
                    <div className="card-img">
                      <img src={card.img} alt={card.title} />
                      <span className="card-badge" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.8)" }}>{card.badge}</span>
                    </div>
                    <div className="card-body">
                      <h4>{card.title}</h4>
                      <div className="card-location">{card.location}</div>
                      <div className="card-footer">
                        <span className="card-rating">{card.rating} ({card.trips} trips)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
