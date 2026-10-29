"use client";
// ============================================================================
// SECTION: EMPLOYER - JOB APPLICANTS
// ============================================================================
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobById, getJobApplications, updateApplicationStatus } from "@/lib/endpoints";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState, SkeletonCard } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";
import Link from "next/link";

const STATUS_ACTIONS = {
  PENDING: [
    { label: "Shortlist", status: "SHORTLISTED", variant: "outline" },
    { label: "Accept", status: "ACCEPTED", variant: "primary" },
    { label: "Reject", status: "REJECTED", variant: "danger" },
  ],
  SHORTLISTED: [
    { label: "Accept", status: "ACCEPTED", variant: "primary" },
    { label: "Reject", status: "REJECTED", variant: "danger" },
  ],
  ACCEPTED: [],
  REJECTED: [],
};

export default function JobApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wake, setWake] = useState(false);
  const [saving, setSaving] = useState(new Set());

  const load = async () => {
    setLoading(true);
    setError("");
    const wakeTimer = setTimeout(() => setWake(true), 4000);
    try {
      const [jobRes, appsRes] = await Promise.all([
        getJobById(id),
        getJobApplications(id),
      ]);
      setJob(jobRes?.job || jobRes?.data || jobRes);
      const arr = appsRes?.applications || appsRes?.data || appsRes || [];
      setApplicants(Array.isArray(arr) ? arr : []);
      clearTimeout(wakeTimer);
      setWake(false);
    } catch (err) {
      clearTimeout(wakeTimer);
      setWake(false);
      if (err instanceof ApiError) setError(err.message);
      else setError(err.message || "Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [id]);

  const isFinal = (status) => status === "ACCEPTED" || status === "REJECTED";

  const handleStatusChange = async (applicationId, status) => {
    setSaving((prev) => new Set([...prev, applicationId]));
    try {
      await updateApplicationStatus(applicationId, status);
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
      );
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(err.message || "Failed to update status");
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(applicationId);
        return next;
      });
    }
  };

  if (loading) return <LoadingState message="Loading…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!job) return <ErrorState message="Job not found" />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/employer/jobs" className="text-sm text-[var(--color-accent)] hover:underline">← Back to listings</Link>
          <h1 className="mt-1 text-lg font-bold text-[var(--color-ink)] tracking-tight">Applicants</h1>
          <p className="text-sm text-[var(--color-muted)]">{job.title}</p>
        </div>
      </div>
      {wake && <div className="text-xs text-[var(--color-muted)]">Waking up the server, this can take up to a minute</div>}
      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</div>}
      {applicants.length === 0 ? (
        <EmptyState title="No applicants yet" description="No one has applied to this job yet" icon={<span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)]"><span className="text-[var(--color-accent)] font-bold text-xs">📭</span></span>} />
      ) : (
        <div className="flex flex-col gap-2">
          {applicants.map((app) => {
            const actions = STATUS_ACTIONS[app.status] || [];
            const disabled = isFinal(app.status);
            return (
              <Card key={app.id} className="p-4 hover:border-[var(--color-border-strong)] transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm font-medium">{app.student?.name || "Applicant"}</div>
                    <div className="text-xs text-[var(--color-muted)]">{app.student?.email || ""}</div>
                  </div>
                  <Badge variant={app.status === "ACCEPTED" ? "success" : app.status === "REJECTED" ? "danger" : app.status === "SHORTLISTED" ? "info" : "warning"} size="sm">
                    {app.status}
                  </Badge>
                </div>
                {app.coverMessage && (
                  <div className="mt-2 text-xs text-[var(--color-muted)] whitespace-pre-wrap mb-3">{app.coverMessage}</div>
                )}
                <div className="flex flex-wrap gap-2">
                  {actions.map((action) => (
                    <Button
                      key={action.label}
                      variant={action.variant}
                      size="sm"
                      onClick={() => handleStatusChange(app.id, action.status)}
                      disabled={disabled || saving.has(app.id)}
                    >
                      {saving.has(app.id) ? "…" : action.label}
                    </Button>
                  ))}
                  {disabled && (
                    <Badge variant="neutral" size="sm">Final</Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
