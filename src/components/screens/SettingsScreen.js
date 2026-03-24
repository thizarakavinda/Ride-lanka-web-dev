import Sidebar from "../Sidebar";
import { useSettings } from "@/context/SettingsContext";

export default function SettingsScreen({ active, showScreen }) {
  const { 
    theme, setTheme, 
    language, setLanguage, 
    t,
    notifications, setNotifications,
    privacy, setPrivacy 
  } = useSettings();

  const toggleNotif = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div id="screen-settings" className={`screen ${active ? "active" : ""}`}>
      <div className="main-layout">
        <Sidebar 
          activeItem="settings" 
          userName="Sithil Semitha" 
          userRole={t("appRoleTripPlanner")} 
          onNavigate={showScreen} 
        />
        <div className="main-content">
        <div className="topbar">
          <h1>{t("settingsTitle")}</h1>
          <p className="topbar-subtitle">{t("settingsSubtitle")}</p>
        </div>

        <div className="settings-grid">
          {/* Appearance Section */}
          <div className="settings-card">
            <div className="card-header">
              <span className="icon">🎨</span>
              <div>
                <h3>{t("appearanceTitle")}</h3>
                <p>{t("appearanceDesc")}</p>
              </div>
            </div>
            <div className="card-body">
              <div className="theme-selector">
                <button 
                  className={`theme-btn ${theme === "light" ? "active" : ""}`}
                  onClick={() => setTheme("light")}
                >
                  <span className="icon">☀️</span> {t("themeLight")}
                </button>
                <button 
                  className={`theme-btn ${theme === "dark" ? "active" : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  <span className="icon">🌙</span> {t("themeDark")}
                </button>
                <button 
                  className={`theme-btn ${theme === "system" ? "active" : ""}`}
                  onClick={() => setTheme("system")}
                >
                  <span className="icon">💻</span> {t("themeSystem")}
                </button>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="settings-card">
            <div className="card-header">
              <span className="icon">🌐</span>
              <div>
                <h3>{t("languageTitle")}</h3>
                <p>{t("languageDesc")}</p>
              </div>
            </div>
            <div className="card-body">
              <select 
                className="input-field" 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English (US)</option>
                <option value="si">Sinhala (සිංහල)</option>
                <option value="ta">Tamil (தமிழ்)</option>
              </select>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="settings-card">
            <div className="card-header">
              <span className="icon">🔔</span>
              <div>
                <h3>{t("notificationsTitle")}</h3>
                <p>{t("notificationsDesc")}</p>
              </div>
            </div>
            <div className="card-body">
              <div className="setting-item">
                <div className="label-group">
                  <span className="item-title">{t("emailNotificationsTitle")}</span>
                  <p className="item-desc">{t("emailNotificationsDesc")}</p>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={notifications.email} onChange={() => toggleNotif("email")} />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="label-group">
                  <span className="item-title">{t("pushNotificationsTitle")}</span>
                  <p className="item-desc">{t("pushNotificationsDesc")}</p>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={notifications.push} onChange={() => toggleNotif("push")} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="settings-card">
            <div className="card-header">
              <span className="icon">🔒</span>
              <div>
                <h3>{t("privacyTitle")}</h3>
                <p>{t("privacyDesc")}</p>
              </div>
            </div>
            <div className="card-body">
              <div className="setting-item">
                <div className="label-group">
                  <span className="item-title">{t("publicProfileTitle")}</span>
                  <p className="item-desc">{t("publicProfileDesc")}</p>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={privacy.publicProfile} onChange={() => togglePrivacy("publicProfile")} />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="label-group">
                  <span className="item-title">{t("activityTrackingTitle")}</span>
                  <p className="item-desc">{t("activityTrackingDesc")}</p>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={privacy.tracking} onChange={() => togglePrivacy("tracking")} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
