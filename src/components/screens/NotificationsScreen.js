"use client";

import Sidebar from "../Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";

export default function NotificationsScreen({ active, showScreen }) {
  const { user } = useAuth();
  const { t } = useSettings();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "traveler";

  return (
    <div id="screen-notif" className={`screen ${active ? "active" : ""}`}>
      <div className="main-layout">
        <Sidebar activeItem="notif" userName={displayName} userRole={t("appRoleTripPlanner")} onNavigate={showScreen} />
        <div className="main-content">
          <div className="topbar"><h1>{t("navNotifications")}</h1></div>
          <p style={{ color: "var(--gray-600)", marginTop: 24 }}>{t("notificationsEmpty")}</p>
        </div>
      </div>
    </div>
  );
}
