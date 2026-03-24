"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isAdminEmail } from "@/lib/adminAuth";
import { useSettings } from "@/context/SettingsContext";

function IconMail() {
  return (
    <svg className="auth-input-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6zm0 0 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="auth-input-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 10V7a4 4 0 118 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LoginForm({ onSignIn }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t } = useSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn() {
    if (!email || !password) {
      setError(t("loginErrorEmpty"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const signedInUser = await signIn(email, password);
      if (isAdminEmail(signedInUser?.email)) {
        router.push("/admin");
        return;
      }
      onSignIn();
    } catch (e) {
      setError(e.message || t("loginErrorFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="tab-login" className="auth-form" role="tabpanel" aria-labelledby="auth-tab-login">
      <div className="auth-form-head">
        <h3>{t("loginWelcomeBack")}</h3>
        <p className="subtitle">{t("loginSubtitle")}</p>
      </div>
      {error ? (
        <div className="auth-alert" role="alert">
          <span className="auth-alert-dot" aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}
      <div className="form-group auth-field">
        <label htmlFor="login-email">{t("loginEmailLabel")}</label>
        <div className="auth-input-shell">
          <span className="auth-input-icon">
            <IconMail />
          </span>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group auth-field">
        <label htmlFor="login-password">{t("loginPasswordLabel")}</label>
        <div className="auth-input-shell">
          <span className="auth-input-icon">
            <IconLock />
          </span>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="forgot-link-wrap">
        <button type="button" className="forgot-link">
          {t("loginForgotPassword")}
        </button>
      </div>
      <button className="btn-teal btn-teal-glow" onClick={handleSignIn} disabled={loading}>
        {loading ? t("loginSigningIn") : t("loginSignIn")}
      </button>
    </div>
  );
}
