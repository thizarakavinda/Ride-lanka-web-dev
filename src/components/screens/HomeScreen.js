"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSettings } from "@/context/SettingsContext";
import { getRecommendations, refreshRecommendations, trackEvent, fetchPlaceCulture } from "@/lib/api";

import highlandtain from "../assets/Highland Train Journey.jpg";
import pettahImg from "../assets/pettah.jpg";
import kosgodaImg from "../assets/Kosgoda Turtle Hatchery.jpg";
import gardensImg from "../assets/Royal Botanical Gardens.jpg";
import unawatuna from "../assets/unawatuna.jpg";
import badulla from "../assets/Badulla.jpg";
import dehiwala from "../assets/dehiwala.jpg";
import kandys from "../assets/Kandys.jpg";
import jaffna from "../assets/slider1.jpg";
import dolphin from "../assets/dolphin.jpg";

function WishlistBtn({ card }) {
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const normalized = { ...card, name: card.name || card.title, image: card.photo_url || card.img };
  const liked = isWishlisted(normalized);
  return (
    <button
      className={`wishlist-btn ${liked ? "wishlisted" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        liked ? removeFromWishlist(normalized.name) : addToWishlist(normalized);
      }}
      title={liked ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      {liked ? "❤️" : "🤍"}
    </button>
  );
}

function AiPlaceCard({ place, token, showScreen }) {
  const { t } = useSettings();
  const fallbackImg = `https://source.unsplash.com/400x220/?${encodeURIComponent(place.name + " Sri Lanka")}`;

  function handleClick() {
    trackEvent(token, {
      place_name: place.name,
      category: place.category || "general",
      action: "view",
    });
    
    // Normalize place object for Home Place Detail
    const normalized = {
      ...place,
      name: place.name,
      description: place.description,
      image: place.photo_url || fallbackImg,
      category: place.category,
      isAiRecommended: true // Flag to distinguish from hardcoded cards
    };
    showScreen(normalized);
  }

  return (
    <div className="dest-card" role="button" tabIndex={0} onClick={handleClick} onKeyDown={(e) => e.key === "Enter" && handleClick()}>
      <div className="card-img">
        <img src={place.photo_url || fallbackImg} alt={place.name} onError={(e) => { e.currentTarget.src = fallbackImg; }} />
        <span className="card-badge">{place.category || "general"}</span>
        <WishlistBtn card={place} />
      </div>
      <div className="card-body">
        <h4>{place.name}</h4>
        <div className="card-location">{place.description}</div>
        <div className="card-footer">
          <span className="card-rating">{place.rating ? `Rating ${place.rating}` : ""}</span>
          <span className="card-price">{t("homeOpenMap")}</span>
        </div>
      </div>
    </div>
  );
}

function AiRecommendationsSection({ token, showScreen }) {
  const { t } = useSettings();
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
      setError(t("homeRecommendationsError"));
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
      setError(t("homeRefreshFailed"));
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) return <p style={{ color: "var(--gray-600)" }}>{t("homeLoadingRecommendations")}</p>;
  if (error) return <p style={{ color: "#c00" }}>{error}</p>;
  if (places.length === 0) return null;

  return (
    <>
      <div className="section-header">
        <h3>{t("homeRecommended")}</h3>
        <span className="see-all" role="button" tabIndex={0} onClick={handleRefresh}>
          {refreshing ? t("homeRefreshing") : t("homeRefreshAI")}
        </span>
      </div>
      <div className="cards-grid">
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
    if (!place) return;
    
    if (place.isAiRecommended && token) {
      setLoading(true);
      fetchPlaceCulture(token, place.name)
        .then((data) => setCultureInfo(data))
        .catch((err) => {
          console.error("Culture fetch error:", err);
          setCultureInfo({ error: "Could not load detailed AI insights for this location right now." });
        })
        .finally(() => setLoading(false));
    } else {
      // Use hardcoded data
      setCultureInfo(place);
      setLoading(false);
    }
  }, [place, token]);

  if (!place) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close-modal" onClick={onClose}>×</button>
        
        <div className="explore-article-hero" style={{ backgroundImage: `url(${place.image || place.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="hero-overlay">
            <h1 style={{ fontSize: "2.5rem", marginBottom: "8px" }}>{place.name || place.title}</h1>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span className="card-badge" style={{ background: "white", color: "var(--teal-main, #0f766e)", padding: "4px 12px", borderRadius: "20px", fontWeight: "600" }}>
                {place.category || "Destination"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.9rem", fontWeight: "500" }}>
                ⭐ {place.rating} • {place.trips || "1.2k+"} trips taken
              </span>
            </div>
          </div>
        </div>

        <div className="explore-article-content">
          <p className="article-lead" style={{ fontSize: "1.1rem", color: "var(--gray-600)", borderLeft: "4px solid var(--teal)", paddingLeft: "16px", marginBottom: "32px", lineHeight: "1.6" }}>
            {place.description}
          </p>
          
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ height: "24px", width: "100%", background: "#f1f5f9", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
              <div style={{ height: "24px", width: "80%", background: "#f1f5f9", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
              <p style={{ color: "var(--gray-400)", marginTop: "12px", fontStyle: "italic" }}>✨ AI is compiling cultural and seasonal insights...</p>
            </div>
          ) : cultureInfo?.error ? (
            <div style={{ background: "#fff1f2", color: "#e11d48", padding: "16px", borderRadius: "8px" }}>
              {cultureInfo.error}
            </div>
          ) : (
            <div className="article-body">
              {cultureInfo?.history && (
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "1.4rem", marginBottom: "12px", color: "var(--teal-dark)" }}>Historical Background</h2>
                  <p style={{ color: "var(--gray-800)", lineHeight: "1.7" }}>{cultureInfo.history}</p>
                </div>
              )}
              {cultureInfo?.culture && (
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "1.4rem", marginBottom: "12px", color: "var(--teal-dark)" }}>Cultural Significance</h2>
                  <p style={{ color: "var(--gray-800)", lineHeight: "1.7" }}>{cultureInfo.culture}</p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                {cultureInfo?.seasonal && (
                  <div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>☀️ Best Time to Visit</h3>
                    <p style={{ fontSize: "0.95rem", color: "var(--gray-600)" }}>{cultureInfo.seasonal}</p>
                  </div>
                )}
                {cultureInfo?.tips && (
                  <div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>💡 Traveler Tips</h3>
                    <p style={{ fontSize: "0.95rem", color: "var(--gray-600)" }}>{cultureInfo.tips}</p>
                  </div>
                )}
              </div>

              <h2 style={{ fontSize: "1.4rem", marginBottom: "16px", color: "var(--teal-dark)" }}>Location in Real Life</h2>
              <div className="maps-container">
                <iframe 
                  className="maps-embed"
                  title="Google Maps Location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent((place.name || place.title) + ", Sri Lanka")}&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomeScreen({ active, showScreen }) {
const [activeCategory, setActiveCategory] = useState("beach");
  const { t } = useSettings();
  const [selectedHomePlace, setSelectedHomePlace] = useState(null);
  const { token, user } = useAuth();
  const displayName = useMemo(() => user?.displayName || user?.email?.split("@")[0] || "traveler", [user]);

  const popular = [
    { title: "The Ultimate South Coast", location: "Weligama · Matara · Hambantota", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Galle_Fort.jpg/960px-Galle_Fort.jpg", badge: "7 days", rating: "4.8", trips: "1840", description: "A classic coastal road trip through colonial forts and golden bays.", category: "beach", history: "Galle Fort was first built by the Portuguese in 1588 and later extensively fortified by the Dutch in the 17th century.", culture: "The south is known for stilt fishing, vibrant mask carving, and the annual Galle Literary Festival.", seasonal: "Best from November to April, avoiding the southwest monsoon.", tips: "Sunrise surf sessions in Weligama are magical." },
    { title: "Northern Discovery", location: "Vavuniya · Kilinochchi · Mullaitivu", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Anuradhapura_view.jpg/960px-Anuradhapura_view.jpg", badge: "6 days", rating: "4.7", trips: "920", description: "Journey into the historic heart and vibrant Tamil culture of the north.", category: "culture", history: "Jaffna was the capital of the Aryachakravarti kingdom and later saw Portuguese, Dutch, and British governance.", culture: "Explore Nallur Kandaswamy Kovil and savor unique Jaffna crab curries and palmyra treats.", seasonal: "January to September is ideal; October to December brings rains.", tips: "Try the ice cream at Rio's in Jaffna." },
    { title: "Highland Train Journey", location: "Hatton · Talawakele · Demodara", img: highlandtain.src, badge: "5 days", rating: "4.9", trips: "2350", description: "Ride one of the world's most scenic trains through mist-shrouded peaks.", category: "hill", history: "The railway was originally constructed by the British to transport tea from the mountains to Colombo port.", culture: "The estate lifestyle and colonial-era railway architecture are living history here.", seasonal: "All year round, but misty mornings in December are spectacular.", tips: "Book 'Observation Car' tickets at least 30 days in advance." },
    { title: "Ancient Cities Loop", location: "Anuradhapura · Polonnaruwa · Sigiriya", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Polonnaruwa_01.jpg/960px-Polonnaruwa_01.jpg", badge: "8 days", rating: "4.7", trips: "1650", description: "Immerse yourself in 3,000 years of history through the sacred cultural triangle.", category: "culture", history: "This region was the cradle of Sinhalese civilization for over a millennium.", culture: "Visit huge dagobas and intricate moonstones; experience traditional village life.", seasonal: "Best from May to September to avoid monsoon rains.", tips: "Wear socks; the stone paths can get very hot at midday." },
  ];

  const hiddenGems = [
    { title: "Delft Island", location: "Northern Province", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Jaffna_montage.jpg/960px-Jaffna_montage.jpg", badge: "Remote", rating: "4.6", trips: "180", description: "A rugged, isolated island famous for its wild horses and coral walls.", category: "culture", history: "The island is home to ruins of a Dutch fort and evidence of Arab horse trading.", culture: "Local life is slow, characterized by coral-fenced gardens and wild pony sightings.", seasonal: "Best in the dry months from February to August.", tips: "Take the morning ferry from Kurikadduwan jetty; it's a 1-hour ride." },
    { title: "Ritigala Peak", location: "Strict Nature Reserve", img: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Ritigala.jpg", badge: "Mystic", rating: "4.8", trips: "240", description: "An ancient, ruined Buddhist monastery hidden deep within a jungle canopy.", category: "nature", history: "A 1st-century BCE mountain monastery where monks practiced strict asceticism.", culture: "Legend says it holds part of the Himalayas brought by Lord Hanuman in the Ramayana.", seasonal: "April to September for dry trekking paths.", tips: "Hire a local guide to find the hidden stone bridges and meditation pads." },
    { title: "Riverston", location: "Matale District", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Knuckles_Range.JPG/960px-Knuckles_Range.JPG", badge: "Trek", rating: "4.9", trips: "410", description: "Breathtaking viewpoints and misty trails connecting the Knuckles range.", category: "nature", history: "Part of the Knuckles conservation area, vital for Sri Lanka's biodiversity.", culture: "Mist-covered peaks and tea-plucking communities define the highland vibe.", seasonal: "July to September and January to March are the clearest months.", tips: "Don't miss the 'World's End' mini viewpoint for stunning drops." },
    { title: "Jaffna Fort", location: "Jaffna Peninsula", img: jaffna.src, badge: "History", rating: "4.7", trips: "320", description: "A massive Vauban-style star fort overlooking the calm Jaffna lagoon.", category: "culture", history: "Built by the Portuguese in 1618 and later expanded by the Dutch and British.", culture: "A symbol of the northern resilience and heritage, beautifully restored.", seasonal: "January to August for clear lagoon views.", tips: "Walk the ramparts at sunset for a stunning golden hour experience." },
  ];

  const adventures = [
    { title: "White Water Rafting", location: "Kitulgala", img: "https://upload.wikimedia.org/wikipedia/commons/1/1c/SL01kitulgala.jpg", badge: "Currents", rating: "4.8", trips: "1420", description: "Navigate the roaring, jungle-fringed rapids of the Kelani River.", category: "adventure", history: "Kitulgala is also the filming location for the Academy Award-winning 'The Bridge on the River Kwai'.", culture: "A hub for adventure tourism in a lush jungle setting.", seasonal: "May to December for the highest water levels and best thrills.", tips: "Always use a certified guide from the Adventure Operators Association." },
    { title: "Night Climb to Sri Pada", location: "Adam's Peak", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sri_Pada.JPG/960px-Sri_Pada.JPG", badge: "Pilgrimage", rating: "4.9", trips: "3200", description: "A sacred nighttime ascent to witness a legendary mountain sunrise.", category: "adventure", history: "Venerated for centuries by Buddhists, Hindus, Muslims, and Christians alike.", culture: "Join thousands of pilgrims chanting 'Sadhu Sadhu' as they climb the 5,000+ stairs.", seasonal: "December to May (poya to poya) is the official pilgrimage season.", tips: "Start at midnight to reach the summit for the sunrise and 'shadow' phenomenon." },
    { title: "Kitesurfing Paradise", location: "Kalpitiya", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/SL_Kalpitiya_asv2020-01_img4_Fishery_harbour.jpg/960px-SL_Kalpitiya_asv2020-01_img4_Fishery_harbour.jpg", badge: "Winds", rating: "4.7", trips: "890", description: "Glide across flat water lagoons powered by perfect wind conditions.", category: "adventure", history: "Once a quiet fishing village, now a globally recognized kiting destination.", culture: "A mix of laid-back surf culture and local Catholic fishing community traditions.", seasonal: "May to September (summer season) and December to February (winter season).", tips: "The Kappaladi lagoon is perfect for beginners." },
    { title: "Dolphin Watching", location: "Mirissa", img: dolphin.src, badge: "Marine", rating: "4.8", trips: "4200", description: "A thrilling ocean safari to spot playful dolphins.", category: "adventure", history: "Mirissa became the world's best spot for blue Dolphins in the late 2000s.", culture: "Combines a laid-back surfing vibe with world-class marine conservation awareness.", seasonal: "November to April is the best time for sightings.", tips: "Pick an operator with proper 'Whale Watching' certification for safety." },
  ];

  const categoryPlaces = {
    beach: [
      { title: "Pasikuda Beach", location: "East Coast", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Pasikudah_beach.JPG/960px-Pasikudah_beach.JPG", badge: "Shallow Waters", rating: "4.8", trips: "2700", description: "Famous for its safe, crystal-clear shallow bay spanning for miles.", category: "beach", history: "Revitalized significantly since 2009, becoming a premier luxury resort destination.", culture: "Calm waters make it a favorite for local families and relaxed tourism.", seasonal: "May to September is the peak sun period for the East Coast.", tips: "Walk out for hundreds of meters; the water stays waist-deep." },
      { title: "Bentota", location: "South West Coast", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sri_Lanka%2C_Bentota%2C_beach_%282%29.JPG/960px-Sri_Lanka%2C_Bentota%2C_beach_%282%29.JPG", badge: "Resort", rating: "4.7", trips: "4100", description: "A renowned resort town perfect for water sports and golden sands.", category: "beach", history: "Named after 'Bem', a mythical demon who once ruled the river bank.", culture: "Famous for 'Bawa' architecture, including Brief Garden and Lunuganga.", seasonal: "November to April is best for swimming and water sports.", tips: "Try a river safari on the Bentara River for crocodile sightings." },
      { title: "Hikkaduwa", location: "South Coast", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Hikkaduwa3.JPG/960px-Hikkaduwa3.JPG", badge: "Coral Reefs", rating: "4.6", trips: "3600", description: "Vibrant beach town known for its snorkeling and lively nightlife.", category: "beach", history: "In the 1970s, it became Sri Lanka’s first major tourist destination on the South Coast.", culture: "A hub for surfing, scuba diving, and local batik industry.", seasonal: "October to April for diving and coral viewing.", tips: "Glass-bottom boat tours are great if you don't want to snorkel." },
      { title: "Unawatuna", location: "South Coast", img: unawatuna.src, badge: "Golden Bay", rating: "4.7", trips: "5100", description: "Iconic palm-fringed bay with calm waters and a vibrant culinary scene.", category: "beach", history: "A legendary bay mentioned in the Ramayana as part of the Hanumana story.", culture: "The heart of Sri Lankan 'boutique' beach tourism and eco-friendly cafes.", seasonal: "December to April for the calmest, clearest blue waters.", tips: "Check out the Japanese Peace Pagoda on the hill for sunset." },
    ],
    hill: [
      { title: "Haputale", location: "Uva Province", img: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Haputale_town_01_640.jpg", badge: "Ridge Views", rating: "4.9", trips: "1500", description: "Perched on a dramatic ridge with spectacular views over the southern plains.", category: "hill", history: "Significant for its proximity to Lipton’s Seat, where tea magnate Sir Thomas Lipton lived.", culture: "Known for its Tamil estate heritage and vibrant fruit and vegetable markets.", seasonal: "February to May for the clearest southern views.", tips: "Visit Lipton’s Seat at 6:00 AM before the clouds roll in." },
      { title: "Ella", location: "Uva Province", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Ella_railway_station.jpg/960px-Ella_railway_station.jpg", badge: "Backpacker Hub", rating: "4.8", trips: "5200", description: "A charming village surrounded by tea hills, waterfalls, and hiking trails.", category: "hill", history: "Linked to the Ravana legends; the Ravana Falls and Caves are nearby.", culture: "The quintessential 'wellness and nature' hub of modern Sri Lankan travel.", seasonal: "Great all year, but clearest in the first half of the year.", tips: "Hike Little Adam's Peak for a 360-degree view with minimal effort." },
      { title: "Nuwara Eliya", location: "Central Province", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/NuwaraEliya_from_top.jpg/960px-NuwaraEliya_from_top.jpg", badge: "Little England", rating: "4.6", trips: "4800", description: "Colonial architecture, manicured gardens, and a cool, misty climate.", category: "hill", history: "Founded by Samuel Baker in 1846 as a health sanctuary for the British.", culture: "The capital of 'Ceylon Tea' with a distinct colonial mountain vibe.", seasonal: "April is the festive season; avoid for quiet, go from January to March.", tips: "High tea at the Grand Hotel is a must-do experience." },
      { title: "Badulla", location: "Uva Province", img: badulla.src, badge: "Mist Peaks", rating: "4.7", trips: "1100", description: "The mountain capital and end-point of the scenic Main Line railway.", category: "hill", history: "One of the oldest towns in Sri Lanka, it was a hub for regional trade in the Kandyan era.", culture: "Visit the Muthiyangana Vihara, one of the sixteen sacred places in Sri Lanka.", seasonal: "Best in the drier months of January to March.", tips: "The train ride from Ella to Badulla is short but breathtaking." },
    ],
    cultural: [
      { title: "Polonnaruwa", location: "North Central Province", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Polonnaruwa_01.jpg/960px-Polonnaruwa_01.jpg", badge: "Ancient City", rating: "4.8", trips: "4100", description: "Explore the incredibly preserved ruins of Sri Lanka's second capital.", category: "culture", history: "Iterated as the royal capital in the 11th century after the fall of Anuradhapura.", culture: "Epicenter of medieval Sinhalese irrigation and Buddhist architecture.", seasonal: "Very hot; July and August dry weather is okay but stay hydrated.", tips: "Rent a bicycle to explore the vast archaeological site." },
      { title: "Dambulla Cave Temple", location: "Central Province", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Dambulla-buddhastupa.jpg/960px-Dambulla-buddhastupa.jpg", badge: "Rock Temple", rating: "4.9", trips: "6200", description: "A vast, spectacular cave complex filled with ancient statues and murals.", category: "culture", history: "Used as a refuge by King Valagamba in the 1st century BCE, later converted to a monastery.", culture: "Contains over 150 statues of Buddha and intricate religious ceiling paintings.", seasonal: "Any time, as the temple is inside caves, but avoid peak weekend crowds.", tips: "Dress modestly (shoulders/knees covered) to enter the sacred site." },
      { title: "Mihintale", location: "Anuradhapura District", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Mihintale_Rock.jpg/960px-Mihintale_Rock.jpg", badge: "Sacred Peak", rating: "4.7", trips: "2800", description: "The mountain peak believed to be the birthplace of Buddhism in Sri Lanka.", category: "culture", history: "Site of the 247 BCE meeting between Mahinda (son of Ashoka) and King Devanampiya Tissa.", culture: "The center of Poson Poya celebrations every June.", seasonal: "June is spectacular but very crowded; May is great for clear skies.", tips: "Be prepared to walk 1,840 stone steps to reach the summit." },
      { title: "Anuradhapura", location: "North Central Province", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Anuradhapura_view.jpg/960px-Anuradhapura_view.jpg", badge: "First Capital", rating: "4.8", trips: "3400", description: "A vast precinct of ancient world ruins, sacred trees, and colossal stupas.", category: "culture", history: "One of the world's continuously inhabited cities, it was the capital of Sri Lanka for nearly 1,400 years.", culture: "Home to the Jaya Sri Maha Bodhi, the oldest human-planted tree in the world.", seasonal: "Dry season (May-September) is best for exploring the vast site.", tips: "Wear white to blend in with pilgrims and remember to remove shoes at sacred spots." },
    ],
    nature: [
      { title: "Wilpattu National Park", location: "North West", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/WilpattuNationalPark-April2014_%283%29.JPG/960px-WilpattuNationalPark-April2014_%283%29.JPG", badge: "Leopards", rating: "4.8", trips: "2100", description: "Known for its natural lakes (Willus) and dense, quiet leopard population.", category: "nature", history: "According to legend, Prince Vijaya landed at Tambapanni (Kudirimalai) nearby.", culture: "A dry zone forest that offers a more secluded safari experience than Yala.", seasonal: "February to October is the best window for wildlife sightings.", tips: "Opt for a full-day safari to reach the deeper 'Villu' lakes." },
      { title: "Minneriya National Park", location: "North Central", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Birds_at_the_Minneriya-Giritale_National_Park.jpg/960px-Birds_at_the_Minneriya-Giritale_National_Park.jpg", badge: "The Gathering", rating: "4.9", trips: "3900", description: "Famous for the gathering of hundreds of Asian elephants during dry season.", category: "nature", history: "The park surrounds the Minneriya tank, built by King Mahasen in the 3rd century.", culture: "Witnessing 'The Gathering' is considered one of the world's great wildlife spectacles.", seasonal: "August to September is peak time for elephant gatherings.", tips: "Book your safari for late afternoon when elephants come to drink." },
      { title: "Sinharaja Forest Reserve", location: "South West", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/20160128_Sri_Lanka_4132_Sinharaja_Forest_Preserve_sRGB_%2825674474901%29.jpg/960px-20160128_Sri_Lanka_4132_Sinharaja_Forest_Preserve_sRGB_%2825674474901%29.jpg", badge: "Rainforest", rating: "4.8", trips: "1400", description: "A biodiversity hotspot and the last viable area of primary tropical rainforest.", category: "nature", history: "Saved from logging in the 1970s and declared a UNESCO site in 1988.", culture: "Deeply respected by locals who believe the spirits of the forest protect the water sources.", seasonal: "January to March and August to September are the 'drier' rainforest months.", tips: "Leech socks are a must! Don't forget your raincoat." },
      { title: "Knuckles Range", location: "Central Province", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Knuckles_Range.JPG/960px-Knuckles_Range.JPG", badge: "Trekker Hub", rating: "4.9", trips: "650", description: "Mist-covered peaks and rare biodiversity across a dramatic mountain range.", category: "nature", history: "Named by British surveyors for its resemblance to a clenched fist.", culture: "Isolation from the plains has preserved unique local customs and flora.", seasonal: "June to September and January to March are the clearest trek windows.", tips: "Prepare for rapid weather changes and hire a guide who knows the mist trails." },
    ],
    food: [
      { title: "Pettah Market", location: "Colombo", img: pettahImg.src, badge: "Street Food", rating: "4.6", trips: "5100", description: "A bustling, chaotic open-air market spanning diverse street food and local goods.", category: "food", history: "A commercial hub since the Portuguese era, its name comes from the Tamil 'Pettai'.", culture: "A melting pot where you can find everything from spices to electronics.", seasonal: "All year, but avoid midday heat if possible.", tips: "Try the freshly made Isso Wade (prawn fritters) near the railway station." },
      { title: "Jaffna Cuisine", location: "Northern Province", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Jaffna_montage.jpg/960px-Jaffna_montage.jpg", badge: "Spicy Seafood", rating: "4.9", trips: "1200", description: "Experience unique northern spices, rich crab curries, and palmyra treats.", category: "food", history: "Influenced by South Indian Tamil traditions and the arid northern climate.", culture: "The Jaffna crab curry is a legendary dish known for its intense heat and flavor.", seasonal: "Best in the dry months to enjoy outdoor spice markets.", tips: "Visit a local home for a truly authentic northern 'Cool' (seafood stew)." },
      { title: "Negombo Fish Market", location: "Western Province", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Negombo_Beach_resort_pool_%28Unsplash%29.jpg/960px-Negombo_Beach_resort_pool_%28Unsplash%29.jpg", badge: "Fresh Catch", rating: "4.7", trips: "2900", description: "Witness the colorful, busy daily catch and try authentic seafood dishes.", category: "food", history: "Negombo was a primary trading port for cinnamon during colonial times.", culture: "A strongly Catholic community known as 'Little Rome' with deep fishing ties.", seasonal: "September to April for the best seafood variety.", tips: "Go at 6:00 AM to see the traditional outrigger canoes returning with their catch." },
      { title: "Kandy Spices", location: "Central Province", img: kandys.src, badge: "Aromatic", rating: "4.8", trips: "3100", description: "Discover the source of Ceylon cinnamon, vanilla, and various island spices.", category: "food", history: "Sri Lankan spices (especially cinnamon) drove the colonial age for centuries.", culture: "Traditional Ayurvedic medicine often integrates these very same spices for healing.", seasonal: "Any time, but the harvest season (May-June) is particularly vivid.", tips: "Buy directly from spice gardens but compare prices before you shop." },
    ],
    family: [
      { title: "Kosgoda Turtle Hatchery", location: "South Coast", img: kosgodaImg.src, badge: "Conservation", rating: "4.8", trips: "6300", description: "An educational experience helping to conserve endangered sea turtles.", category: "family", history: "Local conservation efforts began here in the 1980s to combat illegal egg harvesting.", culture: "Community-led protection of the 5 species that visit the southern shores.", seasonal: "Peak nesting and hatching season is between November and May.", tips: "Visit in the evening for a chance to witness the release of hatchlings." },
      { title: "Pinnawala Elephant Orphanage", location: "Sabaragamuwa", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Pinnawala_01.jpg/960px-Pinnawala_01.jpg", badge: "Sanctuary", rating: "4.7", trips: "8400", description: "Watch gentle giants bathe in the river right next to your viewing deck.", category: "family", history: "Established in 1975 to care for and protect many of the orphaned unweaned wild elephants found wandering in and near the forests of Sri Lanka.", culture: "A major destination for educational family trips.", seasonal: "Best all year long.", tips: "Elephant bathing times are 10:00 AM and 2:00 PM; be there early for a good seat." },
      { title: "Royal Botanical Gardens", location: "Peradeniya", img: gardensImg.src, badge: "Nature Walk", rating: "4.9", trips: "7100", description: "A massive, beautifully landscaped garden perfect for family picnics and walks.", category: "family", history: "Origins date back to 1371 as a royal garden for the Kings of Gampola and Kandy.", culture: "Home to a world-renowned orchid collection and giant Javan fig trees.", seasonal: "January to March for the best flower blooms.", tips: "Walk through the Great Lawn and find the 'Cannonball' trees." },
      { title: "Dehiwala Zoo", location: "Colombo District", img: dehiwala.src, badge: "Wildlife", rating: "4.5", trips: "4100", description: "A classic family outing spot featuring animals from across the globe.", category: "family", history: "One of the oldest zoos in Asia, originally founded in 1936.", culture: "A weekend tradition for Colombo families for generations.", seasonal: "All year round; weekdays are quieter.", tips: "Don't miss the sea lion show, it's a family favorite." },
    ]
  };

  function handleCardClick(card) {
    if (token) {
      trackEvent(token, { place_name: card.title, category: card.category, action: "view" });
    }
    const normalized = {
      ...card,
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
        <Sidebar activeItem="home" userName={displayName} userRole={t("appRoleTripPlanner")} onNavigate={showScreen} />
        <div className="main-content">
          <div className="topbar">
            <div>
              <h1>{t("homeTitle")}</h1>
              <div className="subtitle">{t("homeMorning")}, {displayName}.</div>
            </div>
          </div>

          {token && <AiRecommendationsSection token={token} showScreen={setSelectedHomePlace} />}

          <div className="section-header" style={{ marginTop: "40px" }}><h3>{t("homeTripStyle")}</h3></div>
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
          <div className="cards-grid" style={{ marginTop: "24px" }}>
            {(categoryPlaces[activeCategory] || []).map((card) => (
              <div key={card.title} className="dest-card" role="button" tabIndex={0} onClick={() => handleCardClick(card)}>
                <div className="card-img">
                  <img src={card.img} alt={card.title} />
                  <span className="card-badge">{card.badge}</span>
                  <WishlistBtn card={card} />
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

          <div className="cards-grid" style={{ marginTop: "40px" }}>
            <h3>{t("homePopularItineraries")}</h3>
          </div>
          <div className="cards-grid">
            {popular.map((card) => (
              <div key={card.title} className="dest-card" role="button" tabIndex={0} onClick={() => handleCardClick(card)}>
                <div className="card-img">
                  <img src={card.img} alt={card.title} />
                  <span className="card-badge">{card.badge}</span>
                  <WishlistBtn card={card} />
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
            <h3>{t("homeHiddenGems")}</h3>
          </div>
          <div className="cards-grid">
            {hiddenGems.map((card) => (
              <div key={card.title} className="dest-card" role="button" tabIndex={0} onClick={() => handleCardClick(card)}>
                <div className="card-img">
                  <img src={card.img} alt={card.title} />
                  <span className="card-badge" style={{ background: "white", color: "var(--teal-main, #0f766e)" }}>{card.badge}</span>
                  <WishlistBtn card={card} />
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
            <h3>{t("homeThrillingAdventures")}</h3>
          </div>
          <div className="cards-grid" style={{ marginBottom: "60px" }}>
            {adventures.map((card) => (
              <div key={card.title} className="dest-card" role="button" tabIndex={0} onClick={() => handleCardClick(card)}>
                <div className="card-img">
                  <img src={card.img} alt={card.title} />
                  <span className="card-badge" style={{ background: "white", color: "var(--teal-main, #0f766e)" }}>{card.badge}</span>
                  <WishlistBtn card={card} />
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
        </div>

        {/* Modal Overlay Rendered Globally in Screen */}
        {selectedHomePlace && (
          <HomePlaceDetail 
            place={selectedHomePlace} 
            token={token} 
            onClose={() => setSelectedHomePlace(null)} 
          />
        )}
      </div>
    </div>
  );
}
