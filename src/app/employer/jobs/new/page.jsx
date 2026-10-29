"use client";
// ============================================================================
// SECTION: EMPLOYER - CREATE JOB
// ============================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobForm } from "@/components/employer/JobForm";
import { createJob } from "@/lib/endpoints";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wake, setWake] = useState(false);

  const handleSubmit = async (data) => {
    setError("");
    setLoading(true);
    const wakeTimer = setTimeout(() => setWake(true), 4000);
    try {
      await createJob(data);
      clearTimeout(wakeTimer);
      setWake(false);
      router.push("/employer/jobs");
    } catch (err) {
      clearTimeout(wakeTimer);
      setWake(false);
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 403) {
          setError("Your employer account must be verified before posting jobs.");
        }
      } else {
        setError(err.message || "Failed to publish job");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-ink)] tracking-tight">Create a job</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Publish a new opportunity for OAU students</p>
      </div>
      {wake && <div className="text-xs text-[var(--color-muted)]">Waking up the server, this can take up to a minute</div>}
      <JobForm job={{}} onSubmit={handleSubmit} loading={loading} mode="create" />
    </div>
  );
}
