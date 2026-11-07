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
  hideActions = false,
  fullPage = false,
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
            Choose an opportunity from the list on the left to read full
            responsibilities and submit your application.
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
    <div
      className={
        fullPage
          ? "flex flex-1 flex-col w-full bg-[var(--color-surface)]"
          : "flex h-full min-h-0 flex-col overflow-hidden"
      }
    >
      <div
        className={
          fullPage
            ? "flex-1 space-y-6"
            : "flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-5 py-5 sm:px-6 sm:py-5"
        }
      >
        <div
          className={
            fullPage
              ? "space-y-6"
              : "detail-preview-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto pr-2"
          }
        >
          {/* Header Row: Single Status Indicator & Metadata */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              {closed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                  Applications Closed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Opening
                </span>
              )}

              {job.deadline && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] font-mono">
                  <Clock size={13} className="text-[var(--color-subtle)]" />
                  Deadline:{" "}
                  {new Date(job.deadline).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            {/* Title & Employer */}
            <div className="space-y-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] leading-snug tracking-tight font-[family-name:var(--font-poppins)]">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2.5 text-sm text-[var(--color-muted)]">
                <span className="flex items-center gap-1.5 font-bold text-[var(--color-ink)]">
                  <Building2
                    size={15}
                    className="text-[var(--color-accent)] shrink-0"
                  />
                  {emp}
                </span>
                {job.location && (
                  <>
                    <span className="text-[var(--color-subtle)]">•</span>
                    <span className="flex items-center gap-1 text-[var(--color-muted)]">
                      <MapPin
                        size={14}
                        className="text-[var(--color-subtle)] shrink-0"
                      />
                      {job.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Key Info Chips */}
          <div className="flex shrink-0 flex-wrap items-center gap-2.5 py-4 border-y border-[var(--color-border)]">
            {job.category && (
              <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)]">
                <Tag size={13} className="text-[var(--color-subtle)]" />
                {job.category}
              </span>
            )}

            {job.employmentType && (
              <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)]">
                <Briefcase size={13} className="text-[var(--color-subtle)]" />
                {job.employmentType.replace("_", " ")}
              </span>
            )}

            {job.compensation && (
              <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900">
                <Banknote size={14} className="text-amber-700" />
                {job.compensation}
              </span>
            )}
          </div>

          {/* Job Description (Clean, Open Typography — No Boxed Borders) */}
          <div className="min-h-0 space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] font-mono">
              Role Description &amp; Details
            </h3>
            <div className="text-[15px] sm:text-base text-[var(--color-ink)] leading-relaxed whitespace-pre-wrap font-normal">
              {job.description || "No description provided."}
            </div>
          </div>

          {/* Posted By Information */}
          <div className="border-t border-[var(--color-border)] pt-5 text-xs text-[var(--color-muted)] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Briefcase size={14} className="text-[var(--color-accent)]" />
              Verified Obafemi Awolowo University Campus Listing
            </span>
            <span className="font-semibold text-[var(--color-ink)]">{emp}</span>
          </div>
        </div>
      </div>

      {/* Centered Fitted Bottom Action Bar */}
      {!hideActions && (
        <div
          className={
            fullPage
              ? "sticky bottom-14 lg:bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md px-4 py-3 sm:px-6 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]"
              : "shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
          }
        >
          <div className="flex items-center gap-2.5">
            {applied ? (
              <div className="flex flex-1 items-center justify-center gap-2 rounded-[4px] border border-emerald-200 bg-emerald-50/90 py-2.5 text-xs sm:text-sm font-semibold text-emerald-800">
                <CheckCircle2 size={16} />
                <span>Application Submitted</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onApply}
                disabled={disabled || closed}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-[4px] bg-[var(--color-apply)] py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-[var(--color-apply-hover)] disabled:opacity-50 disabled:pointer-events-none"
              >
                {closed ? "Applications Closed" : "Apply now"}
              </button>
            )}

            <button
              type="button"
              onClick={onSave}
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
              onClick={onReport}
              title="Report this job posting"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-[var(--color-border)] text-[var(--color-muted)] hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Flag size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
