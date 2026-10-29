"use client";

// ============================================================================
// SECTION: JOBS - JOB DETAIL (CENTERED, FITTED & BALANCED)
// ============================================================================
import {
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  Bookmark,
  Flag,
  CheckCircle2,
  Clock,
  Banknote,
  Tag,
} from "lucide-react";

export function JobDetail({
  job,
  onApply,
  onSave,
  onReport,
  saved,
  applied,
  disabled,
}) {
  if (!job) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center text-[var(--color-muted)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-subtle)] shadow-inner">
          <Briefcase size={24} />
        </div>
        <div>
          <p className="text-base font-semibold text-[var(--color-ink)]">
            Select a job to view details
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)] max-w-xs leading-relaxed">
            Choose an opportunity from the list on the left to read full responsibilities and submit your application.
          </p>
        </div>
      </div>
    );
  }

  const emp =
    job.employer?.organizationName ||
    job.employer?.name ||
    job.employerName ||
    "Campus Employer";
  const closed = job.status === "CLOSED";

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Scrollable Center-Fitted Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-xl space-y-6">
          {/* Header Row: Single Status Indicator & Metadata */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              {closed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                  Applications Closed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Opening
                </span>
              )}

              {job.deadline && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
                  <Clock size={12} className="text-[var(--color-subtle)]" />
                  Deadline: {new Date(job.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>

            {/* Title & Employer */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] leading-snug">
                {job.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
                <span className="flex items-center gap-1.5 font-medium text-[var(--color-ink)]">
                  <Building2 size={14} className="text-[var(--color-accent)] shrink-0" />
                  {emp}
                </span>
                {job.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-[var(--color-subtle)] shrink-0" />
                      {job.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Key Info Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {job.category && (
              <span className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)]">
                <Tag size={12} className="text-[var(--color-subtle)]" />
                {job.category}
              </span>
            )}

            {job.employmentType && (
              <span className="inline-flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)]">
                <Briefcase size={12} className="text-[var(--color-subtle)]" />
                {job.employmentType.replace("_", " ")}
              </span>
            )}

            {job.compensation && (
              <span className="inline-flex items-center gap-1 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-1.5 text-xs font-semibold text-amber-900">
                <Banknote size={13} className="text-amber-700" />
                {job.compensation}
              </span>
            )}
          </div>

          {/* Job Description Card */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-subtle)]">
              Role Description &amp; Details
            </h3>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/40 p-4 sm:p-5 text-sm text-[var(--color-ink)] leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {/* Posted By Information */}
          <div className="rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] p-3 text-xs text-[var(--color-muted)] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Briefcase size={14} className="text-[var(--color-accent)]" />
              Verified Obafemi Awolowo University Campus Listing
            </span>
            <span className="font-medium text-[var(--color-ink)]">{emp}</span>
          </div>
        </div>
      </div>

      {/* Centered Fitted Bottom Action Bar */}
      <div className="sticky bottom-0 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-5 py-4 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          {applied ? (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 py-2.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 size={16} />
              <span>Application Submitted</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onApply}
              disabled={disabled || closed}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-apply)] py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--color-apply-hover)] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {closed ? "Applications Closed" : "Apply now"}
            </button>
          )}

          <button
            type="button"
            onClick={onSave}
            title={saved ? "Remove from saved" : "Save job"}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <Bookmark
              size={15}
              className={
                saved
                  ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
                  : "text-[var(--color-muted)]"
              }
            />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>

          <button
            type="button"
            onClick={onReport}
            title="Report this job posting"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-muted)] hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Flag size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
