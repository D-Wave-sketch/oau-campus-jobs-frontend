"use client";

// ============================================================================
// SECTION: LAYOUT - NAVBAR
// ============================================================================
import Link from "next/link";
import { Briefcase, Menu, X, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { useState } from "react";

export function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [open, setOpen] = useState(false);

  const homeHref =
    role === "ADMIN"
      ? "/admin/users"
      : role === "EMPLOYER"
        ? "/employer"
        : role === "STUDENT"
          ? "/student/jobs"
          : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-ink)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle (authenticated, desktop) */}
          {isAuthenticated && role && (
            <button
              type="button"
              onClick={toggleSidebar}
              title="Toggle sidebar"
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors duration-150"
            >
              <PanelLeft size={17} />
            </button>
          )}

          <Link href={homeHref} className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-[var(--color-brand)] text-white text-[10px] font-bold tracking-tight shrink-0 transition-colors duration-150 group-hover:bg-[var(--color-brand-2)]">
              OAU
            </div>
            <span className="text-sm font-bold text-[var(--color-ink)]">
              OAU Campus Jobs
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {!isAuthenticated && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
          {isAuthenticated && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={homeHref}>Dashboard</Link>
              </Button>
              <Button variant="secondary" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <button
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-[4px] text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors duration-150"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-[var(--color-border)] md:hidden bg-[var(--color-surface)]">
          <div className="flex flex-col px-4 py-2 gap-0.5">
            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium text-[var(--color-ink)] rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 text-sm font-medium text-[var(--color-ink)] rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Get started
                </Link>
              </>
            )}
            {isAuthenticated && (
              <>
                <Link
                  href={homeHref}
                  className="px-3 py-2 text-sm font-medium text-[var(--color-ink)] rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm font-medium text-[var(--color-muted)] rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
