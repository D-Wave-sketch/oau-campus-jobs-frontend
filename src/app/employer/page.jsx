"use client";
// ============================================================================
// SECTION: EMPLOYER - OVERVIEW
// ============================================================================
import { useEffect, useState } from "react";
import { getMyJobs } from "@/lib/endpoints";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";
import { Briefcase, FileText } from "lucide-react";
import Link from "next/link";

export default function EmployerOverviewPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wake, setWake] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    const wakeTimer = setTimeout(() => setWake(true), 4000);
    try {
      const res = await getMyJobs();
      const arr = res?.jobs || res?.data || res || [];
      setJobs(Array.isArray(arr) ? arr : []);
      clearTimeout(wakeTimer);
      setWake(false);
    } catch (err) {
      clearTimeout(wakeTimer);
      setWake(false);
      if (err instanceof ApiError) setError(err.message);
      else setError(err.message || "Failed to load your listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const totalApplications = jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-ink)] tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Your job listings and applications at a glance</p>
      </div>
      {wake && <div className="text-xs text-[var(--color-muted)]">Waking up the server, this can take up to a minute</div>}
      {loading ? (
        <div className="grid gap-3 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-[var(--color-muted)]">
              <Briefcase size={16} />
              <span>Live listings</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-[var(--color-ink)]">{jobs.length}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-[var(--color-muted)]">
              <FileText size={16} />
              <span>Total applications</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-[var(--color-ink)]">{totalApplications}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-[var(--color-muted)]">
              <span>Open listings</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-[var(--color-ink)]">{jobs.filter((j) => j.status === "OPEN").length}</div>
          </Card>
        </div>
      )}
      {jobs.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold text-[var(--color-ink)] uppercase tracking-wider mb-3">Recent listings</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.slice(0, 6).map((job) => (
              <Card key={job.id} className="p-4 hover:border-[var(--color-border-strong)] transition-colors">
                <div className="text-sm font-medium">{job.title}</div>
                <div className="mt-1 text-xs text-[var(--color-muted)]">{job.category} • {job.location}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-[10px] font-medium rounded-md px-2 py-0.5 ${
                    job.status === "OPEN"
                      ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                      : "bg-[var(--color-surface-3)] text-[var(--color-muted)]"
                  }`}>
                    {job.status === "OPEN" ? "Open" : "Closed"}
                  </span>
                  <span className="text-[10px] text-[var(--color-muted)]">{jCount(job)} applications</span>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Link href="/employer/jobs" className="text-sm text-[var(--color-accent)] font-medium">View all listings</Link>
          </div>
        </section>
      )}
    </div>
  );
}

function jCount(job) {
  return job._count?.applications ?? 0;
}
