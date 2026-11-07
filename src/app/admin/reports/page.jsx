"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { adminListReports, adminReviewReport, adminModerateJob } from "@/lib/endpoints";
import { Flag, CheckCircle2, XCircle, RefreshCw, Eye, Lock } from "lucide-react";

export default function AdminReportsPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminListReports(token);
      const list = Array.isArray(res?.data) ? res.data : [];
      setReports(list);
      if (selectedReport) {
        const updated = list.find((r) => r.id === selectedReport.id);
        setSelectedReport(updated || null);
      }
    } catch (err) {
      setError(err?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReports();
  }, [token]);

  const handleReview = async (reportId, status) => {
    setProcessingId(reportId);
    setError("");
    setActionMessage("");
    try {
      const res = await adminReviewReport(reportId, status, token);
      const updated = res?.data;
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, ...(updated || {}), status } : r))
      );
      if (selectedReport?.id === reportId) {
        setSelectedReport((prev) => ({ ...prev, ...(updated || {}), status }));
      }
      setActionMessage(res?.message || `Report marked as ${status}.`);
    } catch (err) {
      setError(err?.message || "Failed to review report.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCloseReportedJob = async (jobId) => {
    setProcessingId(`job-${jobId}`);
    setError("");
    setActionMessage("");
    try {
      await adminModerateJob(jobId, "CLOSED", token);
      setReports((prev) =>
        prev.map((r) =>
          r.jobId === jobId && r.job ? { ...r, job: { ...r.job, status: "CLOSED" } } : r
        )
      );
      if (selectedReport?.jobId === jobId) {
        setSelectedReport((prev) => ({
          ...prev,
          job: { ...prev.job, status: "CLOSED" },
        }));
      }
      setActionMessage("Reported job has been CLOSED via moderation.");
    } catch (err) {
      setError(err?.message || "Could not close reported job.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <Flag size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
              Reports Management
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Inspect job reports and mark them as `REVIEWED` or `DISMISSED`.
            </p>
          </div>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--color-ink)] hover:opacity-80 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {actionMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-700">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[var(--color-border)] p-12 text-center text-sm text-[var(--color-muted)]">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 p-12 text-center">
          <Flag size={32} className="mx-auto text-[var(--color-accent)] opacity-75 mb-2" />
          <p className="text-base font-semibold text-[var(--color-ink)]">Zero reports</p>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            No job reports have been submitted.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            {reports.map((report) => {
              const isSelected = selectedReport?.id === report.id;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-[var(--color-accent)] bg-[var(--color-surface-2)] shadow-sm"
                      : "border-[var(--color-border)] bg-[var(--color-surface-2)]/40 hover:border-[var(--color-accent)]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[var(--color-ink)]">
                          {report.job?.title || `Job #${report.jobId}`}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            report.status === "PENDING"
                              ? "bg-amber-500/15 text-amber-600"
                              : report.status === "REVIEWED"
                              ? "bg-emerald-500/15 text-emerald-600"
                              : "bg-zinc-500/15 text-[var(--color-muted)]"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-ink)]/90 line-clamp-1">
                        Reason: {report.reason}
                      </p>
                      <p className="text-[11px] text-[var(--color-muted)]">
                        Reported by {report.reporter?.name} ({report.reporter?.email})
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(report);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink)]"
                    >
                      <Eye size={13} />
                      Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5">
            {selectedReport ? (
              <div className="sticky top-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 p-5 space-y-4">
                <div>
                  <span className="text-[11px] font-mono uppercase text-[var(--color-muted)]">
                    Report #{selectedReport.id} • Status: {selectedReport.status}
                  </span>
                  <h2 className="text-lg font-bold text-[var(--color-ink)] mt-1">
                    {selectedReport.job?.title || `Job #${selectedReport.jobId}`}
                  </h2>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    Submitted by {selectedReport.reporter?.name} ({selectedReport.reporter?.email})
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase text-[var(--color-muted)]">
                      Reason
                    </span>
                    <p className="text-sm font-medium text-[var(--color-ink)] mt-0.5">
                      {selectedReport.reason}
                    </p>
                  </div>
                  {selectedReport.description && (
                    <div className="pt-2 border-t border-[var(--color-border)]/60">
                      <span className="text-[11px] font-semibold uppercase text-[var(--color-muted)]">
                        Additional Details
                      </span>
                      <p className="text-xs text-[var(--color-ink)] mt-0.5 whitespace-pre-line">
                        {selectedReport.description}
                      </p>
                    </div>
                  )}
                </div>

                {selectedReport.status === "PENDING" ? (
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      disabled={processingId === selectedReport.id}
                      onClick={() => handleReview(selectedReport.id, "REVIEWED")}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} />
                      Mark REVIEWED
                    </button>
                    <button
                      disabled={processingId === selectedReport.id}
                      onClick={() => handleReview(selectedReport.id, "DISMISSED")}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      Dismiss
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center text-xs text-[var(--color-muted)]">
                    This report has already been finalized ({selectedReport.status}).
                  </div>
                )}

                {selectedReport.job?.status === "OPEN" && (
                  <div className="pt-2 border-t border-[var(--color-border)]/60">
                    <button
                      disabled={processingId === `job-${selectedReport.jobId}`}
                      onClick={() => handleCloseReportedJob(selectedReport.jobId)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition"
                    >
                      <Lock size={14} />
                      Close Reported Job Listing ({selectedReport.job.title})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-xs text-[var(--color-muted)]">
                Select a report from the list to inspect the reason and process it.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}