"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { adminListJobs, adminModerateJob } from "@/lib/endpoints";
import { Briefcase, RefreshCw, Eye, Lock, Unlock } from "lucide-react";

export default function AdminJobsPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminListJobs(token);
      const list = Array.isArray(res?.data) ? res.data : [];
      setJobs(list);
      if (selectedJob) {
        const updated = list.find((j) => j.id === selectedJob.id);
        setSelectedJob(updated || null);
      }
    } catch (err) {
      setError(err?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchJobs();
  }, [token]);

  const handleModerate = async (jobId, status) => {
    setProcessingId(jobId);
    setError("");
    setActionMessage("");
    try {
      const res = await adminModerateJob(jobId, status, token);
      const updatedJob = res?.data;
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, ...(updatedJob || {}), status } : j))
      );
      if (selectedJob?.id === jobId) {
        setSelectedJob((prev) => ({ ...prev, ...(updatedJob || {}), status }));
      }
      setActionMessage(res?.message || `Job status updated to ${status}.`);
    } catch (err) {
      setError(err?.message || "Failed to moderate job.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <Briefcase size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
              Job Moderation
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Review all campus job listings and open (`OPEN`) or close (`CLOSED`) jobs through moderation.
            </p>
          </div>
        </div>

        <button
          onClick={fetchJobs}
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
          Loading job listings...
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 p-12 text-center text-sm text-[var(--color-muted)]">
          No job listings found on the platform.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            {jobs.map((job) => {
              const orgName =
                job.employer?.employerProfile?.organizationName ||
                job.employer?.name ||
                "Campus Employer";
              const isSelected = selectedJob?.id === job.id;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-[var(--color-accent)] bg-[var(--color-surface-2)] shadow-sm"
                      : "border-[var(--color-border)] bg-[var(--color-surface-2)]/40 hover:border-[var(--color-accent)]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[var(--color-ink)]">{job.title}</h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            job.status === "OPEN"
                              ? "bg-emerald-500/15 text-emerald-600"
                              : "bg-zinc-500/15 text-[var(--color-muted)]"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-muted)]">
                        {orgName} • {job.location || "OAU Campus"}
                      </p>
                      <p className="text-[11px] font-mono text-[var(--color-muted)]">
                        Applications: {job._count?.applications ?? 0} • Reports: {job._count?.reports ?? 0}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
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
            {selectedJob ? (
              <div className="sticky top-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 p-5 space-y-4">
                <div>
                  <span className="text-[11px] font-mono uppercase text-[var(--color-muted)]">
                    Review Job Listing #{selectedJob.id}
                  </span>
                  <h2 className="text-xl font-bold text-[var(--color-ink)] mt-1">
                    {selectedJob.title}
                  </h2>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    Posted by{" "}
                    <span className="font-semibold text-[var(--color-ink)]">
                      {selectedJob.employer?.employerProfile?.organizationName ||
                        selectedJob.employer?.name}
                    </span>{" "}
                    ({selectedJob.employer?.employerProfile?.verificationStatus || "EMPLOYER"})
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5">
                    <span className="text-[10px] uppercase text-[var(--color-muted)]">Status</span>
                    <p className="font-bold text-[var(--color-ink)] mt-0.5">{selectedJob.status}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5">
                    <span className="text-[10px] uppercase text-[var(--color-muted)]">Activity</span>
                    <p className="font-bold text-[var(--color-ink)] mt-0.5">
                      {selectedJob._count?.applications ?? 0} Apps / {selectedJob._count?.reports ?? 0} Reports
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
                  <span className="text-[11px] font-semibold uppercase text-[var(--color-muted)]">
                    Listing Description
                  </span>
                  <p className="text-sm text-[var(--color-ink)] mt-1 whitespace-pre-line">
                    {selectedJob.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={processingId === selectedJob.id || selectedJob.status === "OPEN"}
                    onClick={() => handleModerate(selectedJob.id, "OPEN")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-40"
                  >
                    <Unlock size={15} />
                    Open Job (OPEN)
                  </button>
                  <button
                    disabled={processingId === selectedJob.id || selectedJob.status === "CLOSED"}
                    onClick={() => handleModerate(selectedJob.id, "CLOSED")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition disabled:opacity-40"
                  >
                    <Lock size={15} />
                    Close Job (CLOSED)
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-xs text-[var(--color-muted)]">
                Select a job listing on the left to review its details and open or close it through moderation.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}