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

const adminNav = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/employers", label: "Employers", icon: ShieldCheck },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/users", label: "More", icon: Users },
];

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)] lg:hidden">
      <div
        className={clsx(
          "grid",
          nav.length === 3 ? "grid-cols-3" : "grid-cols-5"
        )}
      >
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 py-2 text-xs",
                active ? "text-[var(--color-accent)] font-semibold" : "text-[var(--color-muted)]"
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
