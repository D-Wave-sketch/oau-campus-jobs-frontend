"use client";
// ============================================================================
// SECTION: STUDENT - SAVED JOBS
// ============================================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSavedJobs, unsaveJob } from "@/lib/endpoints";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";
import { Bookmark } from "lucide-react";

export default function SavedJobsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wake, setWake] = useState(false);
  const [toast, setToast] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    const wakeTimer = setTimeout(() => setWake(true), 4000);
    try {
      const res = await getSavedJobs();
      const arr = res?.savedJobs || res?.data || res || [];
      setSaved(Array.isArray(arr) ? arr : []);
      clearTimeout(wakeTimer);
      setWake(false);
    } catch (err) {
      clearTimeout(wakeTimer);
      setWake(false);
      if (err instanceof ApiError) setError(err.message);
      else setError(err.message || "Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await unsaveJob(jobId);
      setSaved((prev) => prev.filter((s) => (s.jobId || s.job?.id) !== jobId));
      setToast("Removed from saved");
      setTimeout(() => setToast(""), 2000);
    } catch (err) {
      if (err instanceof ApiError) setToast(err.message);
      else setToast("Failed to update");
      setTimeout(() => setToast(""), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-ink)] tracking-tight">Saved jobs</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Jobs you bookmarked for later</p>
      </div>
      {wake && <div className="text-xs text-[var(--color-muted)]">Waking up the server, this can take up to a minute</div>}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : saved.length === 0 ? (
        <EmptyState title="No saved jobs yet" description="Browse jobs and save opportunities" actionLabel="Browse jobs" onAction={() => router.push("/student/jobs")} icon={Bookmark} />
      ) : (
        <div className="flex flex-col gap-2">
          {saved.map((s) => {
            const job = s.job || s;
            const jid = job.id || s.jobId;
            return (
              <Card key={s.id || jid} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/student/jobs/${jid}`} className="text-sm font-medium text-[var(--color-accent)] hover:underline">
                      {job.title}
                    </Link>
                    <div className="mt-1 text-xs text-[var(--color-muted)]">
                      {job.category}{job.category && job.location ? " • " : ""}{job.location}
                      {job.compensation ? ` • ${job.compensation}` : ""}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleUnsave(jid)}>Unsave</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm shadow-[var(--shadow)]">
          {toast}
        </div>
      )}
    </div>
  );
}
