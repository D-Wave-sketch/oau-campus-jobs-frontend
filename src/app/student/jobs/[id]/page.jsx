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
import { ArrowLeft, Bookmark, Flag, CheckCircle2 } from "lucide-react";

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
    <div className="w-full min-h-full flex flex-col bg-[var(--color-surface)]">
      {/* Top Header Bar — Back button strictly on the LEFT */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-md sm:px-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg py-1 pr-3 text-sm font-bold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors text-left"
        >
          <ArrowLeft size={18} />
          <span>Back to jobs</span>
        </button>

        <div className="flex items-center gap-1.5 sm:hidden">
          <button
            type="button"
            onClick={toggleSave}
            aria-label={saved ? "Remove from saved" : "Save job"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors"
          >
            <Bookmark
              size={18}
              className={
                saved
                  ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
                  : ""
              }
            />
          </button>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            aria-label="Report job"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Flag size={17} />
          </button>
        </div>
      </div>

      {/* Job Details — natural scrolling, generous spacing, ample bottom clearance */}
      <div className="flex-1 px-4 py-6 sm:px-8 sm:py-8 pb-44 lg:pb-12">
        <div className="max-w-3xl mx-auto">
          <JobDetail job={job} fullPage hideActions />
        </div>
      </div>

      {/* Permanently Fixed Apply Bar on Mobile (Anchored above BottomNav) / Footer Bar on Desktop */}
      <div className="fixed bottom-[56px] left-0 right-0 z-30 border-t-2 border-[var(--color-ink)] bg-[var(--color-surface)] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:static lg:bottom-auto lg:border-t lg:bg-[var(--color-surface)] lg:p-4">
        <div className="flex items-center gap-2.5 max-w-3xl mx-auto">
          {applied ? (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-[4px] border border-emerald-200 bg-emerald-50/90 py-2.5 text-xs sm:text-sm font-semibold text-emerald-800">
              <CheckCircle2 size={16} />
              <span>Application Submitted</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setApplyOpen(true)}
              disabled={actionLoading || job?.status === "CLOSED"}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-[4px] bg-[var(--color-apply)] py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-[var(--color-apply-hover)] disabled:opacity-50 disabled:pointer-events-none"
            >
              {job?.status === "CLOSED" ? "Applications Closed" : "Apply now"}
            </button>
          )}

          <button
            type="button"
            onClick={toggleSave}
            title={saved ? "Remove from saved" : "Save job"}
            className="inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <Bookmark
              size={16}
              className={
                saved
                  ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
                  : "text-[var(--color-muted)]"
              }
            />
            <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
          </button>

          <button
            type="button"
            onClick={() => setReportOpen(true)}
            title="Report this job posting"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-[var(--color-border)] text-[var(--color-muted)] hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Flag size={16} />
          </button>
        </div>
      </div>

      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSubmit={handleApply}
        loading={actionLoading}
      />
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
        loading={actionLoading}
      />

      {toast && (
        <div className="fixed bottom-36 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-ink)] px-4 py-2.5 text-sm font-medium text-[var(--color-surface)] shadow-[var(--shadow)]">
          {toast}
        </div>
      )}
    </div>
  );
}
