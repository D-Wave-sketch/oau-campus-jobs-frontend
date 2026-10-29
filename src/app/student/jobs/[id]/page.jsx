"use client";
// ============================================================================
// SECTION: STUDENT - JOB DETAIL PAGE
// ============================================================================
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobById, getMyApplications, saveJob, unsaveJob, applyToJob, reportJob } from "@/lib/endpoints";
import { JobDetail } from "@/components/jobs/JobDetail";
import { ApplyModal } from "@/components/jobs/ApplyModal";
import { ReportModal } from "@/components/jobs/ReportModal";
import { LoadingState } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");

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
    (async () => {
      try {
        const a = await getMyApplications();
        const arr = a?.applications || a?.data || a || [];
        if (arr.some((x) => Number(x.jobId) === id)) setApplied(true);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleSave = async () => {
    const was = saved;
    setSaved(!was);
    try {
      if (was) await unsaveJob(id);
      else await saveJob(id);
      setToast(was ? "Removed from saved" : "Saved job");
      setTimeout(() => setToast(""), 2000);
    } catch (err) {
      setSaved(was);
      if (err instanceof ApiError) setToast(err.message);
      else setToast("Failed to update");
      setTimeout(() => setToast(""), 2500);
    }
  };

  const handleApply = async (cover) => {
    setActionLoading(true);
    try {
      await applyToJob(id, cover);
      setApplied(true);
      setApplyOpen(false);
      router.push("/student/applications");
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async (reason) => {
    setActionLoading(true);
    try {
      await reportJob(id, reason);
      setReportOpen(false);
      setToast("Report submitted");
      setTimeout(() => setToast(""), 2000);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading job..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft size={16} /> Back
      </Button>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <JobDetail
          job={job}
          onApply={() => setApplyOpen(true)}
          onSave={toggleSave}
          onReport={() => setReportOpen(true)}
          saved={saved}
          applied={applied}
          disabled={actionLoading}
        />
      </div>
      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} onSubmit={handleApply} loading={actionLoading} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} onSubmit={handleReport} loading={actionLoading} />
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-[var(--color-ink)] px-3 py-2 text-sm text-white">
          {toast}
        </div>
      )}
    </div>
  );
}
