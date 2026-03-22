"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isAdminEmail } from "@/lib/adminAuth";

export default function LoginForm({ onSignIn }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn() {
    if (!email || !password) {
      setError("Please enter your email and password.");
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
      setError(e.message || "Sign in failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="tab-login" className="auth-form">
      <h3>Welcome back!</h3>
      <p className="subtitle">Sign in to continue your travel journey</p>
      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="forgot-link">Forgot password?</div>
      {error && <p style={{ color: "red", marginBottom: 8, fontSize: 13 }}>{error}</p>}
      <button className="btn-teal" onClick={handleSignIn} disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </div>
  );
}
