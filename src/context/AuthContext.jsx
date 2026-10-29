"use client";
// ============================================================================
// SECTION: AUTH CONTEXT
// ============================================================================
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { tokenStore } from "@/lib/tokenStore";
import { getMe, login as loginApi, register as registerApi } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | anonymous
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
    setRole(null);
    setProfile(null);
    setProfileError(null);
    setStatus("anonymous");
  }, []);

  const loadProfile = useCallback(async (jwt) => {
    try {
      const res = await getMe(jwt);
      const data = res?.data || res?.profile || res;
      setProfile(data);
      setProfileError(null);
      return data;
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        // ADMIN or others without profile - not an auth failure
        setProfile(null);
        setProfileError(err.message);
        return null;
      }
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        return null;
      }
      setProfileError(err.message);
      return null;
    }
  }, [clearSession]);

  const bootstrap = useCallback(async () => {
    const stored = tokenStore.get();
    if (!stored) {
      setStatus("anonymous");
      return;
    }
    setToken(stored);
    // Try to decode role from token for routing hint if possible (minimal)
    try {
      const payload = JSON.parse(atob(stored.split(".")[1]));
      if (payload?.role) setRole(payload.role);
    } catch {}
    // For ADMIN, don't rely on /me; for others refresh profile
    try {
      const payload = JSON.parse(atob(stored.split(".")[1]));
      if (payload?.role === "ADMIN") {
        setUser({ id: payload.sub, role: "ADMIN" });
        setRole("ADMIN");
        setStatus("authenticated");
        return;
      }
    } catch {}
    // Try to get user from stored? We'll call /me for STUDENT/EMPLOYER
    try {
      const res = await getMe(stored);
      const data = res?.data || res?.profile || res;
      const u = data?.user || data;
      if (u?.role) {
        setUser(u);
        setRole(u.role);
      }
      setProfile(data);
      setStatus("authenticated");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        return;
      }
      // Even if /me fails for non-401, if we have token maybe still authenticated as role from token
      try {
        const payload = JSON.parse(atob(stored.split(".")[1]));
        if (payload?.role) {
          setRole(payload.role);
          setUser({ id: payload.sub, role: payload.role });
          setStatus("authenticated");
          return;
        }
      } catch {}
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email, password) => {
    const res = await loginApi(email, password);
    const jwt = res?.token || res?.accessToken;
    const usr = res?.user || res?.data?.user;
    if (!jwt) throw new ApiError("Login failed - no token returned");
    tokenStore.set(jwt);
    setToken(jwt);
    if (usr?.role) {
      setUser(usr);
      setRole(usr.role);
    } else {
      try {
        const payload = JSON.parse(atob(jwt.split(".")[1]));
        if (payload?.role) {
          setRole(payload.role);
          setUser({ id: payload.sub, role: payload.role });
        }
      } catch {}
    }
    setStatus("authenticated");
    // Try to load profile if not admin
    if ((usr?.role || role) !== "ADMIN") {
      try {
        await loadProfile(jwt);
      } catch {}
    }
    return res;
  }, [loadProfile, role]);

  const register = useCallback(async (name, email, password, role) => {
    const res = await registerApi(name, email, password, role);
    const jwt = res?.token || res?.accessToken;
    const usr = res?.user || res?.data?.user;
    if (jwt) {
      tokenStore.set(jwt);
      setToken(jwt);
      if (usr?.role) {
        setUser(usr);
        setRole(usr.role);
      }
      setStatus("authenticated");
      if ((usr?.role) !== "ADMIN") {
        try {
          await loadProfile(jwt);
        } catch {}
      }
    }
    return res;
  }, [loadProfile]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const jwt = tokenStore.get() || token;
    if (!jwt) return;
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      if (payload?.role === "ADMIN") {
        setRole("ADMIN");
        setUser({ id: payload.sub, role: "ADMIN" });
        setStatus("authenticated");
        return;
      }
    } catch {}
    await loadProfile(jwt);
  }, [token, loadProfile]);

  const value = {
    token,
    user,
    role,
    profile,
    profileError,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    login,
    register,
    logout,
    refreshUser,
    loadProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
