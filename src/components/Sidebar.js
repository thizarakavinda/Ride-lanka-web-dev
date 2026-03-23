"use client";

export default function Sidebar({
  activeItem = "home",
  logoIcon = "🌊",
  logoText = "Ride",
  logoEm = "Lanka",
  userName = "Sithil Semitha",
  userRole = "Explorer · Pro",
  onNavigate,
}) {
  const nav = (screen) => (e) => {
    e?.preventDefault?.();
    onNavigate?.(screen);
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">{logoIcon}</div>
        <span>{logoText}<em>{logoEm}</em></span>
      </div>
      <div className="nav-section">
        <div className="nav-label">Discover</div>
        <div
          className={`nav-item ${activeItem === "home" ? "active" : ""}`}
          onClick={nav("screen-home")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">🏠</span> Home
        </div>
        <div
          className={`nav-item ${activeItem === "explore" ? "active" : ""}`}
          onClick={nav("screen-explore")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">🧭</span> Explore Sri Lanka
        </div>
      </div>
      <div className="nav-section" style={{ marginTop: 12 }}>
        <div className="nav-label">Trips</div>
        <div
          className={`nav-item ${activeItem === "trips" ? "active" : ""}`}
          onClick={nav("screen-trips")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">🗺️</span> My Trips
        </div>
        <div
          className={`nav-item ${activeItem === "wishlist" ? "active" : ""}`}
          onClick={nav("screen-wishlist")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">⭐</span> Saved Plans
        </div>
      </div>
      <div className="nav-section" style={{ marginTop: 12 }}>
        <div className="nav-label">Account</div>
        <div
          className={`nav-item ${activeItem === "profile" ? "active" : ""}`}
          onClick={nav("screen-profile")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">👤</span> Profile
        </div>
        <div
          className={`nav-item ${activeItem === "notif" ? "active" : ""}`}
          onClick={nav("screen-notif")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">🔔</span> Notifications
        </div>
        <div
          className={`nav-item ${activeItem === "settings" ? "active" : ""}`}
          onClick={nav("screen-settings")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">⚙️</span> Settings
        </div>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="avatar">{userName.slice(0, 2).toUpperCase()}</div>
          <div className="user-info">
            <div className="name">{userName}</div>
            <div className="role">{userRole}</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
