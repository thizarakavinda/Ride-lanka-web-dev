"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import { useSettings } from "@/context/SettingsContext";
import logoPng from "@/components/assets/logo.png";

export default function AuthScreen({ active, onSignIn, onSignUp, onBack, guideIntent = false }) {
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
      
      <button 
        type="button" 
        className="auth-back-btn" 
        onClick={onBack}
        aria-label="Back to splash"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>{t("Back") || "Back"}</span>
      </button>

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
            {guideIntent ? (
              <div className="auth-guide-banner" role="status">
                {t("authGuideBanner")}
              </div>
            ) : null}
            <div className="auth-brand">
              <span className="auth-brand-mark" aria-hidden="true">
                <img src={logoPng?.src || logoPng} alt="" />
              </span>
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
