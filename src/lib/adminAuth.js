//Demo credentials
 //   admin@gmail.com / admin123
export const ADMIN_EMAIL = "admin@gmail.com";

/** Stored in sessionStorage + localStorage so restore survives reload / odd browser rules */
export const ADMIN_SESSION_KEY = "ride_lanka_admin_session";

export function isAdminEmail(email) {
  if (!email || typeof email !== "string") return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function isDevAdminSessionStored() {
  if (typeof window === "undefined") return false;
  try {
    return (
      sessionStorage.getItem(ADMIN_SESSION_KEY) === "1" ||
      localStorage.getItem(ADMIN_SESSION_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function persistDevAdminSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    localStorage.setItem(ADMIN_SESSION_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearDevAdminSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
