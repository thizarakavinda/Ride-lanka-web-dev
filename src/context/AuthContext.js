"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { saveUserProfile, refreshRecommendations } from "@/lib/api";
import {
  ADMIN_EMAIL,
  isDevAdminSessionStored,
  persistDevAdminSession,
  clearDevAdminSession,
} from "@/lib/adminAuth";

const AuthContext = createContext(null);

function createDevAdminUser() {
  return {
    uid: "ride-lanka-admin",
    email: ADMIN_EMAIL,
    displayName: "Administrator",
    isDevAdmin: true,
    getIdToken: async () => "dev-admin-token",
  };
}

function toFriendlyAuthError(error, mode) {
  const code = error?.code || "";

  if (code === "auth/invalid-credential") {
    if (mode === "signIn") {
      return new Error("Invalid email or password. If this is a new account, use Create Account first.");
    }
    return new Error("Authentication failed. Please verify your Firebase project settings and try again.");
  }

  if (code === "auth/email-already-in-use") {
    return new Error("This email is already registered. Try signing in instead.");
  }

  if (code === "auth/weak-password") {
    return new Error("Password is too weak. Use at least 6 characters.");
  }

  if (code === "auth/invalid-email") {
    return new Error("Please enter a valid email address.");
  }

  return new Error(error?.message || "Authentication failed. Please try again.");
}

async function getUserAccountStatus(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return "active";
    const data = snap.data() || {};
    const raw = data.status || data.accountStatus || "active";
    const status = String(raw).trim().toLowerCase();
    if (status === "blocked") return "blocked";
    if (status === "suspended") return "suspended";
    return "active";
  } catch (e) {
    console.warn("Could not read user status from Firestore:", e);
    return "active";
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore demo admin before paint so /admin never briefly sees user=null (avoids false redirect)
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!isDevAdminSessionStored()) return;
    setUser(createDevAdminUser());
    setToken(null);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const accountStatus = await getUserAccountStatus(firebaseUser.uid);
        if (accountStatus === "suspended" || accountStatus === "blocked") {
          await signOut(auth);
          setUser(null);
          setToken(null);
          setLoading(false);
          return;
        }
        clearDevAdminSession();
        const idToken = await firebaseUser.getIdToken();
        setUser(firebaseUser);
        setToken(idToken);
      } else {
        if (isDevAdminSessionStored()) {
          setUser(createDevAdminUser());
          setToken(null);
        } else {
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const t = await user.getIdToken(true);
      setToken(t);
    }, 55 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  async function signIn(email, password) {
    const e = (email || "").trim().toLowerCase();
    // Patched demo admin: same auth UI, no Firebase user required
    const pass = typeof password === "string" ? password.trim() : password;
    if (e === ADMIN_EMAIL.toLowerCase() && pass === "admin123") {
      persistDevAdminSession();
      const adminUser = createDevAdminUser();
      setUser(adminUser);
      setToken(null);
      return adminUser;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const accountStatus = await getUserAccountStatus(cred.user.uid);
      if (accountStatus === "suspended" || accountStatus === "blocked") {
        await signOut(auth);
        throw new Error(
          accountStatus === "blocked"
            ? "This account is blocked. Please contact support."
            : "This account is suspended. Please contact support."
        );
      }
      clearDevAdminSession();
      const idToken = await cred.user.getIdToken();
      setUser(cred.user);
      setToken(idToken);
      return cred.user;
    } catch (error) {
      throw toFriendlyAuthError(error, "signIn");
    }
  }

  async function signUp(email, password, name, interests) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      setUser(cred.user);
      setToken(idToken);

      await saveUserProfile(idToken, { name, interests });

      try {
        await refreshRecommendations(idToken);
      } catch (e) {
        console.warn("[signUp] Could not pre-fetch recommendations:", e);
      }

      return cred.user;
    } catch (error) {
      throw toFriendlyAuthError(error, "signUp");
    }
  }

  async function logOut() {
    clearDevAdminSession();
    await signOut(auth);
    setUser(null);
    setToken(null);
  }

  async function updateUserEmail(newEmail) {
    if (user?.isDevAdmin) throw new Error("Cannot change email for demo admin.");
    if (!auth.currentUser) throw new Error("No user logged in");
    await updateEmail(auth.currentUser, newEmail);
    setUser({...auth.currentUser});
  }

  async function updateUserPassword(newPassword) {
    if (user?.isDevAdmin) throw new Error("Cannot change password for demo admin.");
    if (!auth.currentUser) throw new Error("No user logged in");
    await updatePassword(auth.currentUser, newPassword);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, logOut, updateUserEmail, updateUserPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
