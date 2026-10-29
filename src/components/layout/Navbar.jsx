"use client";

// ============================================================================
// SECTION: LAYOUT - NAVBAR
// ============================================================================
import Link from "next/link";
import { Briefcase, Menu, PanelLeft } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/85 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/65">
      <div className="flex items-center justify-between px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle for Dashboard Pages (Desktop) */}
          {isAuthenticated && role && (
            <button
              type="button"
              onClick={toggleSidebar}
              title="Toggle sidebar"
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors"
            >
              <PanelLeft size={18} />
            </button>
          )}

          <Link href={homeHref} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-ink)] text-white">
              <Briefcase size={14} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight text-[var(--color-ink)]">
                OAU Campus Jobs
              </div>
            </div>
          </Link>
        </div>

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

        <button
          className="md:hidden p-1.5"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <Menu size={18} />
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--color-border)] md:hidden">
          <div className="flex flex-col px-4 py-1.5">
            {!isAuthenticated && (
              <>
                <Link href="/login" className="px-2 py-1.5 text-sm">
                  Sign in
                </Link>
                <Link href="/register" className="px-2 py-1.5 text-sm">
                  Get started
                </Link>
              </>
            )}
            {isAuthenticated && (
              <>
                <Link href={homeHref} className="px-2 py-1.5 text-sm">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-2 py-1.5 text-left text-sm"
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
