"use client";

// ============================================================================
// SECTION: LAYOUT - BOTTOM NAV
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
  LogIn,
  UserPlus,
} from "lucide-react";

const guestNav = [
  { href: "/", label: "Jobs", icon: Briefcase },
  { href: "/login", label: "Sign in", icon: LogIn },
  { href: "/register", label: "Register", icon: UserPlus },
];

const studentNav = [
  { href: "/student/jobs", label: "Jobs", icon: Briefcase },
  { href: "/student/applications", label: "Applied", icon: FileText },
  { href: "/student/saved", label: "Saved", icon: Bookmark },
  { href: "/student/profile", label: "Profile", icon: User },
  { href: "/student/settings", label: "Settings", icon: Settings },
];

const employerNav = [
  { href: "/employer", label: "Overview", icon: LayoutDashboard },
  { href: "/employer/jobs/new", label: "Create", icon: PlusCircle },
  { href: "/employer/jobs", label: "Listings", icon: Briefcase },
  { href: "/employer/profile", label: "Profile", icon: User },
  { href: "/employer/settings", label: "Settings", icon: Settings },
];

// The old "More" tab duplicated /admin/users (and lit up twice), so it's gone.
const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/employers", label: "Employers", icon: ShieldCheck },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

const GRID = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

// Pick the single best match so nested routes don't light up two tabs
// (e.g. /employer/jobs/new matches both "Create" and "Listings").
function activeHref(nav, pathname) {
  let best = null;
  for (const item of nav) {
    const match =
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(item.href + "/");
    if (match && (!best || item.href.length > best.length)) best = item.href;
  }
  return best;
}

export function BottomNav({ role }) {
  const pathname = usePathname();
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
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-ink)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className={clsx("grid", GRID[nav.length] || "grid-cols-5")}>
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.href === current;

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 py-2 text-[10px] transition-colors duration-150",
                active
                  ? "font-extrabold text-[var(--color-ink)]"
                  : "font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]",
              )}
            >
              <span
                className={clsx(
                  "flex h-7 w-12 items-center justify-center rounded-[4px] transition-colors duration-150",
                  active
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-transparent",
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden="true"
                />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}