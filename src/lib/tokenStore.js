// ============================================================================
// SECTION: TOKEN STORE
// ============================================================================
const TOKEN_KEY = "oau_campus_jobs_token";

export const tokenStore = {
  get() {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    if (typeof window === "undefined") return;
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {}
  },
  clear() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};
