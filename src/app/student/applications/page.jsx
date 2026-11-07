"use client";
// ============================================================================
// SECTION: STUDENT - MY APPLICATIONS
// ============================================================================
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyApplications } from "@/lib/endpoints";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/jobs/StatusBadge";
import { SkeletonCard } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";
import { FileText, MapPin, CalendarDays, ArrowUpRight, Loader2 } from "lucide-react";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "";

const statusLabel = (s) => String(s || "unknown").replace(/_/g, " ").toLowerCase();

export default function MyApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wake, setWake] = useState(false);
  const [status, setStatus] = useState("All");

  const load = async () => {
    setLoading(true);
    setError("");
    const wakeTimer = setTimeout(() => setWake(true), 4000);
    try {
      const res = await getMyApplications();
      const arr = res?.applications || res?.data || res || [];
      setApps(Array.isArray(arr) ? arr : []);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(err.message || "Failed to load applications");
    } finally {
      clearTimeout(wakeTimer);
      setWake(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  // Newest first
  const sorted = useMemo(
    () =>
      [...apps].sort(
        (a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime()
      ),
    [apps]
  );

  // Status tabs with counts, derived from the data
  const tabs = useMemo(() => {
    const counts = new Map();
    apps.forEach((a) => counts.set(a.status, (counts.get(a.status) || 0) + 1));
    return [
      { key: "All", label: "All", count: apps.length },
      ...Array.from(counts.entries()).map(([key, count]) => ({
        key,
        label: statusLabel(key),
        count,
      })),
    ];
  }, [apps]);

  // If the active status disappears (e.g. after a reload), fall back to All
  const activeStatus = tabs.some((t) => t.key === status) ? status : "All";
  const visible = activeStatus === "All" ? sorted : sorted.filter((a) => a.status === activeStatus);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 border-b-2 border-[var(--color-ink)] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white shadow-[var(--shadow)]">
            <FileText size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-none tracking-tight text-[var(--color-ink)]">
              My applications
            </h1>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              Every application and where it stands.
            </p>
          </div>
        </div>
        {!loading && !error && apps.length > 0 && (
          <span className="shrink-0 rounded-full bg-[var(--color-ink)] px-3 py-1 text-xs font-bold text-[var(--color-surface)]">
            {apps.length} total
          </span>
        )}
      </div>

      {wake && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-muted)]"
        >
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          Waking up the server, this can take up to a minute.
        </div>
      )}

      {/* Status tabs */}
      {!loading && !error && tabs.length > 2 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {tabs.map((t) => {
            const active = t.key === activeStatus;
            return (
              <button
                key={String(t.key)}
                type="button"
                onClick={() => setStatus(t.key)}
                aria-pressed={active}
                className={`rounded-full border-2 px-3 py-1 text-xs font-bold capitalize transition-colors ${
                  active
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]"
                }`}
              >
                {t.label} <span className="opacity-70">{t.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : apps.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse jobs and apply to get started."
          actionLabel="Browse jobs"
          onAction={() => router.push("/student/jobs")}
          icon={FileText}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((app) => (
            <li key={app.id}>
              <Card className="group relative overflow-hidden border-2 border-[var(--color-border)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {app.job?.category && (
                      <span className="mb-2 inline-block rounded-md bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-accent)]">
                        {app.job.category}
                      </span>
                    )}
                    <h2 className="text-base font-bold leading-snug text-[var(--color-ink)]">
                      <Link
                        href={`/student/jobs/${app.jobId}`}
                        className="inline-flex items-start gap-1 after:absolute after:inset-0 after:content-[''] hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[var(--color-accent)]"
                      >
                        <span>{app.job?.title || "Job"}</span>
                        <ArrowUpRight
                          size={16}
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                        />
                      </Link>
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-muted)]">
                      {app.job?.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={13} aria-hidden="true" />
                          {app.job.location}
                        </span>
                      )}
                      {app.appliedAt && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={13} aria-hidden="true" />
                          Applied {fmtDate(app.appliedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}