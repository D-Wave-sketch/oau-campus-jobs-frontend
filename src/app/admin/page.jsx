"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  adminListUsers,
  adminListPendingEmployers,
  adminListJobs,
  adminListReports,
} from "@/lib/endpoints";
import {
  Users,
  ShieldCheck,
  Briefcase,
  Flag,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({
    totalUsers: 0,
    students: 0,
    employers: 0,
    pendingEmployers: 0,
    totalJobs: 0,
    openJobs: 0,
    closedJobs: 0,
    totalReports: 0,
    pendingReports: 0,
  });

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, pendingEmpRes, jobsRes, reportsRes] = await Promise.all([
        adminListUsers(token),
        adminListPendingEmployers(token),
        adminListJobs(token),
        adminListReports(token),
      ]);

      const users = usersRes?.data || [];
      const pendingEmployers = pendingEmpRes?.data || [];
      const jobs = jobsRes?.data || [];
      const reports = reportsRes?.data || [];

      setCounts({
        totalUsers: users.length,
        students: users.filter((u) => u.role === "STUDENT").length,
        employers: users.filter((u) => u.role === "EMPLOYER").length,
        pendingEmployers: pendingEmployers.length,
        totalJobs: jobs.length,
        openJobs: jobs.filter((j) => j.status === "OPEN").length,
        closedJobs: jobs.filter((j) => j.status === "CLOSED").length,
        totalReports: reports.length,
        pendingReports: reports.filter((r) => r.status === "PENDING").length,
      });
    } catch (err) {
      setError(err?.message || "Failed to load dashboard data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadDashboardData();
  }, [token]);

  const cards = [
    {
      title: "User Management",
      href: "/admin/users",
      icon: Users,
      primaryStat: counts.totalUsers,
      primaryLabel: "Total Users",
      subtext: `${counts.students} Students • ${counts.employers} Employers`,
      description: "View accounts and switch user roles between Student and Employer.",
    },
    {
      title: "Employer Verification",
      href: "/admin/employers",
      icon: ShieldCheck,
      primaryStat: counts.pendingEmployers,
      primaryLabel: "Awaiting Verification",
      subtext: "Pending organization reviews",
      description: "Review pending employer profiles and verify or reject organizations.",
    },
    {
      title: "Job Moderation",
      href: "/admin/jobs",
      icon: Briefcase,
      primaryStat: counts.totalJobs,
      primaryLabel: "Total Listings",
      subtext: `${counts.openJobs} Open • ${counts.closedJobs} Closed`,
      description: "Inspect campus job postings and open or close listings via moderation.",
    },
    {
      title: "Reports Management",
      href: "/admin/reports",
      icon: Flag,
      primaryStat: counts.pendingReports,
      primaryLabel: "Pending Reports",
      subtext: `${counts.totalReports} Total Submitted`,
      description: "Review flagged job reports and mark them as reviewed or dismissed.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Signed in as <span className="font-semibold text-[var(--color-ink)]">{user?.name || user?.email || "Administrator"}</span>. Select a module below to perform authorized actions.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--color-ink)] hover:opacity-80 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Counts
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/40 p-5 hover:border-[var(--color-accent)] transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      <Icon size={20} />
                    </div>
                    <h2 className="text-base font-bold text-[var(--color-ink)]">
                      {card.title}
                    </h2>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-[var(--color-muted)] group-hover:translate-x-1 group-hover:text-[var(--color-accent)] transition-transform"
                  />
                </div>

                <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--color-border)]/60 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-[var(--color-ink)]">
                    {loading ? "—" : card.primaryStat}
                  </span>
                  <span className="ml-2 text-xs font-medium text-[var(--color-muted)]">
                    {card.primaryLabel}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[var(--color-muted)]">
                  {loading ? "Loading..." : card.subtext}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}