"use client";

// ============================================================================
// SECTION: LAYOUT - COLLAPSIBLE SIDEBAR
// ============================================================================
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Briefcase,
  FileText,
  Bookmark,
  User,
  Settings,
  LayoutDashboard,
  PlusCircle,
  Users,
  Flag,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  LogIn,
  UserPlus,
  GraduationCap,
  Building2,
  Sparkles,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";

const guestNav = [
  { href: "/", label: "Browse Jobs", icon: Briefcase },
  { href: "/login", label: "Sign in", icon: LogIn },
  { href: "/register", label: "Create Account", icon: UserPlus },
  { href: "/register?role=employer", label: "For Employers", icon: Building2 },
];

const studentNav = [
  { href: "/student/jobs", label: "Browse Jobs", icon: Briefcase },
  { href: "/student/applications", label: "My Applications", icon: FileText },
  { href: "/student/saved", label: "Saved Jobs", icon: Bookmark },
  { href: "/student/profile", label: "Profile", icon: User },
  { href: "/student/settings", label: "Settings", icon: Settings },
];

const employerNav = [
  { href: "/employer", label: "Overview", icon: LayoutDashboard },
  { href: "/employer/jobs/new", label: "Create Job", icon: PlusCircle },
  { href: "/employer/jobs", label: "My Listings", icon: Briefcase },
  { href: "/employer/profile", label: "Profile", icon: User },
  { href: "/employer/settings", label: "Settings", icon: Settings },
];

const adminNav = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/employers", label: "Employers", icon: ShieldCheck },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

export function Sidebar({ role }) {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();
  const { user, isAuthenticated, logout } = useAuth();

  const nav =
    role === "ADMIN"
      ? adminNav
      : role === "EMPLOYER"
      ? employerNav
      : role === "STUDENT"
      ? studentNav
      : guestNav;

  return (
    <aside
      className={clsx(
        "hidden lg:flex flex-col shrink-0 select-none",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64",
        "bg-transparent text-[var(--color-ink)]"
      )}
    >
      {/* Sidebar Header: Logo & Collapse Trigger */}
      <div className="flex h-16 items-center justify-between px-3.5">
        <Link
          href="/"
          className={clsx(
            "flex items-center gap-2.5 overflow-hidden transition-all duration-200",
            collapsed ? "justify-center w-full" : "px-1.5"
          )}
          title="OAU Campus Jobs"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white shadow-sm font-black tracking-tighter text-sm">
            OAU
          </div>

          {!collapsed && (
            <div className="flex flex-col truncate leading-tight">
              <span className="font-bold text-sm tracking-tight text-[var(--color-ink)] truncate">
                Campus Jobs
              </span>
              <span className="text-[11px] font-mono text-[var(--color-muted)] flex items-center gap-1">
                {role === "STUDENT" && (
                  <>
                    <GraduationCap size={12} className="text-[var(--color-accent)]" />
                    Student
                  </>
                )}
                {role === "EMPLOYER" && (
                  <>
                    <Building2 size={12} className="text-[var(--color-accent)]" />
                    Employer
                  </>
                )}
                {role === "ADMIN" && (
                  <>
                    <ShieldCheck size={12} className="text-[var(--color-accent)]" />
                    Admin
                  </>
                )}
                {(!role || role === "GUEST") && (
                  <>
                    <Sparkles size={12} className="text-[var(--color-accent)]" />
                    Great Ife
                  </>
                )}
              </span>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)] transition-colors"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <div key={item.href + item.label} className="relative group">
              <Link
                href={item.href}
                className={clsx(
                  "flex items-center rounded-xl py-2.5 transition-all duration-200",
                  collapsed ? "justify-center px-2" : "gap-3 px-3",
                  active
                    ? "bg-[var(--color-surface)] text-[var(--color-ink)] font-semibold shadow-sm border border-[var(--color-border)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-surface)]/70 hover:text-[var(--color-ink)]"
                )}
              >
                <Icon
                  size={19}
                  className={clsx(
                    "shrink-0 transition-colors",
                    active
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-muted)] group-hover:text-[var(--color-ink)]"
                  )}
                />

                {!collapsed && (
                  <span className="truncate text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>

              {/* Tooltip in collapsed mode */}
              {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 z-50 hidden rounded-md bg-[var(--color-ink)] px-2.5 py-1 text-xs font-medium text-white shadow-lg group-hover:block whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer: User profile or Guest Auth buttons */}
      <div className="p-3 border-t border-[var(--color-border)]/50 space-y-2">
        {collapsed ? (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            className="flex h-10 w-full items-center justify-center rounded-xl text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)] transition-colors"
            title="Expand sidebar"
          >
            <PanelLeft size={18} />
          </button>
        ) : isAuthenticated && user ? (
          <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface)]/60 p-2 border border-[var(--color-border)]/40">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-glow)] text-[var(--color-accent)] text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col truncate">
                <span className="truncate text-xs font-semibold text-[var(--color-ink)]">
                  {user?.name || "My Account"}
                </span>
                <span className="truncate text-[10px] text-[var(--color-muted)]">
                  {user?.email || "Signed in"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Log out"
              className="p-1.5 text-[var(--color-muted)] hover:text-red-600 transition-colors rounded-lg"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-2 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <LogIn size={14} />
              <span>Sign in</span>
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-2)] transition-colors shadow-sm"
            >
              <UserPlus size={14} />
              <span>Create Account</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
