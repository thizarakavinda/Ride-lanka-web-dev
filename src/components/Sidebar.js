"use client";
import { useSettings } from "@/context/SettingsContext";

export default function Sidebar({
  activeItem = "home",
  logoIcon = "🌊",
  logoText = "Ride",
  logoEm = "Lanka",
  userName = "Sithil Semitha",
  userRole = "Explorer · Pro",
  onNavigate,
}) {
  const { t } = useSettings();
  const resolvedUserRole =
    userRole === "Trip planner for Sri Lanka"
      ? t("appRoleTripPlanner")
      : userRole === "Explorer · Pro"
        ? t("appRoleExplorerPro")
        : userRole;
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
        <div className="nav-label">{t("navDiscover")}</div>
        <div
          className={`nav-item ${activeItem === "home" ? "active" : ""}`}
          onClick={nav("screen-home")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">🏠</span> {t("navHome")}
        </div>
        <div
          className={`nav-item ${activeItem === "explore" ? "active" : ""}`}
          onClick={nav("screen-explore")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">🧭</span> {t("navExplore")}
        </div>
      </div>
      <div className="nav-section" style={{ marginTop: 12 }}>
        <div className="nav-label">{t("navTrips")}</div>
        <div
          className={`nav-item ${activeItem === "trips" ? "active" : ""}`}
          onClick={nav("screen-trips")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">🗺️</span> {t("navMyTrips")}
        </div>
        <div
          className={`nav-item ${activeItem === "wishlist" ? "active" : ""}`}
          onClick={nav("screen-wishlist")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">❤️</span> {t("navWishlist")}
        </div>
      </div>
      <div className="nav-section" style={{ marginTop: 12 }}>
        <div className="nav-label">{t("navAccount")}</div>
        <div
          className={`nav-item ${activeItem === "profile" ? "active" : ""}`}
          onClick={nav("screen-profile")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">👤</span> {t("navProfile")}
        </div>
        <div
          className={`nav-item ${activeItem === "notif" ? "active" : ""}`}
          onClick={nav("screen-notif")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">🔔</span> {t("navNotifications")}
        </div>
        <div
          className={`nav-item ${activeItem === "settings" ? "active" : ""}`}
          onClick={nav("screen-settings")}
          role="button"
          tabIndex={0}
        >
          <span className="icon">⚙️</span> {t("navSettings")}
        </div>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="avatar">{userName.slice(0, 2).toUpperCase()}</div>
          <div className="user-info">
            <div className="name">{userName}</div>
            <div className="role">{resolvedUserRole}</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
