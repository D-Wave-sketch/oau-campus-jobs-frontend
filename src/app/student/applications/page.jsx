"use client";
// ============================================================================
// SECTION: STUDENT - MY APPLICATIONS
// ============================================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyApplications } from "@/lib/endpoints";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/jobs/StatusBadge";
import { SkeletonCard } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";
import { FileText } from "lucide-react";

export default function MyApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wake, setWake] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    const wakeTimer = setTimeout(() => setWake(true), 4000);
    try {
      const res = await getMyApplications();
      const arr = res?.applications || res?.data || res || [];
      setApps(Array.isArray(arr) ? arr : []);
      clearTimeout(wakeTimer);
      setWake(false);
    } catch (err) {
      clearTimeout(wakeTimer);
      setWake(false);
      if (err instanceof ApiError) setError(err.message);
      else setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-ink)] tracking-tight">My applications</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Track the status of your applications</p>
      </div>
      {wake && <div className="text-xs text-[var(--color-muted)]">Waking up the server, this can take up to a minute</div>}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : apps.length === 0 ? (
        <EmptyState title="No applications yet" description="Browse jobs and apply to get started" actionLabel="Browse jobs" onAction={() => router.push("/student/jobs")} icon={FileText} />
      ) : (
        <div className="flex flex-col gap-2">
          {apps.map((app) => (
            <Card key={app.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link href={`/student/jobs/${app.jobId}`} className="text-sm font-medium text-[var(--color-accent)] hover:underline">
                    {app.job?.title || "Job"}
                  </Link>
                  <div className="mt-1 text-xs text-[var(--color-muted)]">
                    {app.job?.category}{app.job?.category && app.job?.location ? " • " : ""}{app.job?.location}
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-[var(--color-muted)]">
                <span>Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ""}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
