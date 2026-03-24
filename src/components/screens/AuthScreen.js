"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import { useSettings } from "@/context/SettingsContext";

export default function AuthScreen({ active, onSignIn, onSignUp }) {
  const [activeTab, setActiveTab] = useState("login");
  const { t } = useSettings();

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  const onTabKey = (e, tab) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      switchTab(tab);
    }
  };

  return (
    <div id="screen-auth" className={`screen ${active ? "active" : ""}`}>
      <div className="auth-visual-bg" aria-hidden />
      <div className="auth-visual-grid" aria-hidden />
      <div className="auth-layout">
        <div className="auth-copy">
          <h2>
            {t("authHeroTitleLine1")}
            <br />
            {t("authHeroTitleLine2")}
          </h2>
          <p>{t("authHeroSubtitle")}</p>
        </div>
        <div className="auth-shell">
          <div className="auth-card auth-card--tech">
            <div className="auth-brand">
              <span className="auth-brand-mark" aria-hidden />
              <div className="auth-brand-text">
                <span className="auth-brand-name">Ride Lanka</span>
                <span className="auth-brand-tagline">{t("authBrandTagline")}</span>
              </div>
            </div>
            <div className="auth-tabs-pill" role="tablist" aria-label={t("authTablistAria")}>
              <button
                type="button"
                role="tab"
                id="auth-tab-login"
                aria-selected={activeTab === "login"}
                aria-controls="tab-login"
                className={`auth-tab-pill ${activeTab === "login" ? "active" : ""}`}
                onClick={() => switchTab("login")}
                onKeyDown={(e) => onTabKey(e, "login")}
              >
                {t("authSignInTab")}
              </button>
              <button
                type="button"
                role="tab"
                id="auth-tab-signup"
                aria-selected={activeTab === "signup"}
                aria-controls="tab-signup"
                className={`auth-tab-pill ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => switchTab("signup")}
                onKeyDown={(e) => onTabKey(e, "signup")}
              >
                {t("authCreateAccountTab")}
              </button>
            </div>
            {activeTab === "login" ? (
              <LoginForm onSignIn={onSignIn} />
            ) : (
              <SignUpForm onSignUp={onSignUp} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
