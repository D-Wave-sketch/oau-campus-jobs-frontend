"use client";

// ============================================================================
// SECTION: SIDEBAR CONTEXT
// ============================================================================
import { createContext, useContext, useEffect, useState } from "react";

const SidebarContext = createContext({
  collapsed: false,
  toggleSidebar: () => {},
  setCollapsed: () => {},
});

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsedState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("oau_sidebar_collapsed");
      if (saved !== null) {
        setCollapsedState(saved === "true");
      }
    } catch {}
    setMounted(true);
  }, []);

  const setCollapsed = (val) => {
    setCollapsedState(val);
    try {
      localStorage.setItem("oau_sidebar_collapsed", String(val));
    } catch {}
  };

  const toggleSidebar = () => {
    setCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("oau_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ collapsed: mounted ? collapsed : false, toggleSidebar, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}
