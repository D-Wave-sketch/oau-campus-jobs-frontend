"use client";
// ============================================================================
// SECTION: EMPLOYER - MY LISTINGS
// ============================================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyJobs, closeJob, deleteJob } from "@/lib/endpoints";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";
import Link from "next/link";

export default function MyListingsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wake, setWake] = useState(false);
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(null); // { job, action: 'close' | 'delete' }

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

  const handleClose = (job) => {
    setConfirm({ job, action: "close" });
  };

  const handleDelete = (job) => {
    setConfirm({ job, action: "delete" });
  };

  const cancelConfirm = () => setConfirm(null);

  const executeConfirm = async () => {
    if (!confirm) return;
    const { job, action } = confirm;
    try {
      if (action === "close") {
        await closeJob(job.id);
        setToast(`"${job.title}" closed`);
      } else {
        await deleteJob(job.id);
        setToast(`"${job.title}" deleted`);
      }
      setConfirm(null);
      setTimeout(() => setToast(""), 2000);
      load();
    } catch (err) {
      setConfirm(null);
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 409 && action === "delete") {
          // Backend blocks delete when applications exist; offer close instead
          setError(err.message + " Close the job instead.");
        }
      } else {
        setError(err.message || "Action failed");
      }
    }
  };

  const handleCloseJob = async (job) => {
    try {
      await closeJob(job.id);
      setToast(`"${job.title}" closed`);
      setTimeout(() => setToast(""), 2000);
      load();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(err.message || "Failed to close job");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-ink)] tracking-tight">My listings</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Manage your published job opportunities</p>
        </div>
        <Button asChild>
          <Link href="/employer/jobs/new">Post a job</Link>
        </Button>
      </div>
      {wake && <div className="text-xs text-[var(--color-muted)]">Waking up the server, this can take up to a minute</div>}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : jobs.length === 0 ? (
        <EmptyState title="No listings yet" description="Post your first job to start receiving applications" actionLabel="Post a job" onAction={() => router.push("/employer/jobs/new")} icon={<span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)]"><span className="text-[var(--color-accent)] font-bold text-xs">+</span></span>} />
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job) => (
            <Card key={job.id} className="p-4 hover:border-[var(--color-border-strong)] transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <Link href={`/employer/jobs/${job.id}/edit`} className="text-sm font-medium text-[var(--color-accent)] hover:underline">
                    {job.title}
                  </Link>
                  <div className="mt-1 text-xs text-[var(--color-muted)]">{job.category} • {job.location}</div>
                </div>
                <Badge variant={job.status === "OPEN" ? "success" : "neutral"} size="sm">
                  {job.status === "OPEN" ? "Open" : "Closed"}
                </Badge>
              </div>
              <div className="mb-3 text-xs text-[var(--color-muted)]">{job.compensation ? job.compensation + " • " : ""}{job.employmentType.replace("_", " ").toLowerCase()}</div>
              <div className="text-xs text-[var(--color-muted)] mb-3">
                {job._count?.applications ?? 0} application{job._count?.applications !== 1 ? "s" : ""}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => handleCloseJob(job)} disabled={job.status === "CLOSED"}>
                  {job.status === "CLOSED" ? "Closed" : "Close job"}
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/employer/jobs/${job.id}/applicants`}>Applicants</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(job)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm shadow-[var(--shadow)]">
          {toast}
        </div>
      )}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cancelConfirm} aria-hidden="true" />
          <Card className="w-full max-w-md p-6">
            <h3 className="text-base font-bold text-[var(--color-ink)]">
              {confirm.action === "close" ? "Close this job?" : "Delete this job?"}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {confirm.action === "close"
                ? `Students will no longer be able to apply to "${confirm.job.title}".`
                : `This will permanently remove "${confirm.job.title}". This cannot be undone.`}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={cancelConfirm}>Cancel</Button>
              <Button
                variant={confirm.action === "delete" ? "danger" : "primary"}
                onClick={executeConfirm}
                disabled={confirm.action === "close" ? confirm.job.status === "CLOSED" : false}
              >
                {confirm.action === "close" ? (confirm.job.status === "CLOSED" ? "Already closed" : "Close job") : "Delete job"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
