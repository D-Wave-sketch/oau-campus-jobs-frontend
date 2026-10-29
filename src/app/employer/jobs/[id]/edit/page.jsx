"use client";
// ============================================================================
// SECTION: EMPLOYER - EDIT JOB
// ============================================================================
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { JobForm } from "@/components/employer/JobForm";
import { getJobById, updateJob } from "@/lib/endpoints";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wake, setWake] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getJobById(id);
      setJob(res?.job || res?.data || res);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(err.message || "Failed to load job");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [id]);

  const handleSubmit = async (data) => {
    setError("");
    setSaving(true);
    try {
      await updateJob(id, data);
      router.push("/employer/jobs");
    } catch (err) {
      setSaving(false);
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 400 && err.message.includes("Closed")) {
          setError("Closed jobs cannot be edited.");
        }
      } else {
        setError(err.message || "Failed to update job");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!job) return <ErrorState message="Job not found" />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-ink)] tracking-tight">Edit job</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Update your job listing details</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/employer/jobs">Back to listings</Link>
        </Button>
      </div>
      {wake && <div className="text-xs text-[var(--color-muted)]">Waking up the server, this can take up to a minute</div>}
      <JobForm job={job} onSubmit={handleSubmit} loading={saving} mode="edit" />
    </div>
  );
}
