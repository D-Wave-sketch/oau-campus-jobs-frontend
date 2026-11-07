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
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/employers", label: "Employers", icon: ShieldCheck },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

// Pick the single best match so nested routes don't light up two items
// (e.g. /employer/jobs/new matches both "Create Job" and "My Listings").
// Query strings are ignored for matching.
function activeHref(nav, pathname) {
  let best = null;
  for (const item of nav) {
    const base = item.href.split("?")[0];
    const match =
      base === "/"
        ? pathname === "/"
        : pathname === base || pathname.startsWith(base + "/");
    if (match && (!best || base.length > best.base.length))
      best = { base, href: item.href, label: item.label };
  }
  return best ? best.href + "|" + best.label : null;
}

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

  const current = activeHref(nav, pathname);

  return (
    <aside
      className={clsx(
        "hidden lg:flex flex-col shrink-0 select-none",
        "transition-all duration-300 ease-in-out motion-reduce:transition-none",
        collapsed ? "w-[72px]" : "w-64",
        "bg-transparent text-[var(--color-ink)]",
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-[60px] items-center justify-between px-3.5 border-b-2 border-[var(--color-ink)]">
        <Link
          href="/"
          className={clsx(
            "flex items-center gap-2.5 overflow-hidden transition-all duration-200",
            collapsed ? "justify-center w-full" : "px-1",
          )}
          title="OAU Campus Jobs"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] bg-[var(--color-accent)] text-white text-[11px] font-extrabold tracking-tight font-[family-name:var(--font-poppins)]">
            OAU
          </div>

          {!collapsed && (
            <div className="flex flex-col truncate leading-tight">
              <span className="font-extrabold text-[15px] tracking-tight text-[var(--color-ink)] truncate font-[family-name:var(--font-poppins)]">
                Campus Jobs
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)] flex items-center gap-1">
                {role === "STUDENT" && (
                  <>
                    <GraduationCap size={11} aria-hidden="true" />
                    Student
                  </>
                )}
                {role === "EMPLOYER" && (
                  <>
                    <Building2 size={11} aria-hidden="true" />
                    Employer
                  </>
                )}
                {role === "ADMIN" && (
                  <>
                    <ShieldCheck size={11} aria-hidden="true" />
                    Admin
                  </>
                )}
                {(!role || role === "GUEST") && (
                  <>
                    <GraduationCap size={11} aria-hidden="true" />
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
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors duration-150"
          >
            <PanelLeftClose size={17} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav
        aria-label="Main"
        className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto overflow-x-hidden"
      >
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" || item.href === "/admin" || item.href === "/employer"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <div key={item.href + item.label} className="relative group">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={clsx(
                  "flex items-center rounded-[4px] py-2.5 transition-colors duration-150",
                  collapsed ? "justify-center px-2" : "gap-3 px-3",
                  active
                    ? "bg-[var(--color-accent)] text-white font-bold"
                    : "font-semibold text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]",
                )}
              >
                <Icon size={18} aria-hidden="true" className="shrink-0" />

                {!collapsed && (
                  <span className="truncate text-sm">{item.label}</span>
                )}
              </Link>

              {/* Tooltip in collapsed mode (hover and keyboard focus) */}
              {collapsed && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 z-50 hidden rounded-md bg-[var(--color-ink)] px-2.5 py-1.5 text-xs font-semibold text-white shadow-md group-hover:block group-focus-within:block whitespace-nowrap"
                >
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-2.5 border-t-2 border-[var(--color-ink)] space-y-1.5">
        {collapsed ? (
          <>
            {isAuthenticated && user && (
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                title="Log out"
                className="flex h-9 w-full items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-red-600 transition-colors duration-150"
              >
                <LogOut size={17} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="flex h-9 w-full items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors duration-150"
              title="Expand sidebar"
            >
              <PanelLeft size={17} aria-hidden="true" />
            </button>
          </>
        ) : isAuthenticated && user ? (
          <div className="flex items-center justify-between rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-surface-2)] p-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-white text-xs font-extrabold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col truncate">
                <span className="truncate text-[13px] font-bold text-[var(--color-ink)]">
                  {user?.name || "My Account"}
                </span>
                <span className="truncate text-[11px] text-[var(--color-muted)]">
                  {user?.email || "Signed in"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              aria-label="Log out"
              title="Log out"
              className="p-2 text-[var(--color-muted)] hover:text-red-600 transition-colors rounded-md hover:bg-[var(--color-surface)]"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] py-2.5 text-[13px] font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <LogIn size={14} aria-hidden="true" />
              <span>Sign in</span>
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-ink)] py-2.5 text-[13px] font-bold text-white hover:bg-[var(--color-ink-2)] transition-colors"
            >
              <UserPlus size={14} aria-hidden="true" />
              <span>Create Account</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}