"use client";

// ============================================================================
// SECTION: IMPORTS
// ============================================================================
import Link from "next/link";
import { Banknote, CalendarClock, MapPin, Tag, Building2, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getEmployerName,
  isJobOpen,
  formatDate,
  deadlineLabel,
} from "@/lib/jobFormat";

// ============================================================================
// SECTION: HOME JOB DETAIL (CENTERED, FITTED & BALANCED)
// ============================================================================
export function HomeJobDetail({ job, showStickyCta = false }) {
  const { status, role } = useAuth();

  const employer = getEmployerName(job);
  const open = isJobOpen(job);
  const jobPath = `/student/jobs/${job.id}`;
  const isStudent = status === "authenticated" && role === "STUDENT";
  const applyHref = isStudent
    ? jobPath
    : `/login?next=${encodeURIComponent(jobPath)}`;

  const applyButton = open ? (
    <Link
      href={applyHref}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-apply)] px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--color-apply-hover)] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-apply)]"
    >
      Apply now
    </Link>
  ) : (
    <span className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] px-6 text-sm font-semibold text-[var(--color-muted)]">
      Applications closed
    </span>
  );

  const facts = [
    { icon: Banknote, label: "Compensation", value: job.compensation },
    { icon: Tag, label: "Category", value: job.category },
    { icon: MapPin, label: "Location", value: job.location },
    {
      icon: CalendarClock,
      label: "Deadline",
      value: job.deadline
        ? `${formatDate(job.deadline)}${
            deadlineLabel(job.deadline) && open
              ? ` (${deadlineLabel(job.deadline).toLowerCase()})`
              : ""
          }`
        : "",
    },
  ].filter((f) => f.value);

  return (
    <article className="h-full overflow-y-auto">
      <div className="mx-auto max-w-xl p-5 sm:p-7 space-y-6">
        {/* Header */}
        <header className="space-y-3 pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between gap-2">
            {open ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Opening
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Applications Closed
              </span>
            )}

            {job.deadline && (
              <span className="text-xs text-[var(--color-subtle)]">
                Deadline: {formatDate(job.deadline)}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold leading-tight text-[var(--color-ink)]">
              {job.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
              {employer && (
                <span className="flex items-center gap-1.5 font-medium text-[var(--color-ink)]">
                  <Building2 size={14} className="text-[var(--color-accent)] shrink-0" />
                  {employer}
                </span>
              )}
              {employer && job.location && <span>•</span>}
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-[var(--color-subtle)] shrink-0" />
                  {job.location}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {applyButton}
            {!isStudent && open && (
              <p className="text-xs text-[var(--color-subtle)]">
                Sign in with your student account to apply.
              </p>
            )}
          </div>
        </header>

        {/* Job facts chips */}
        {facts.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-subtle)]">
              Key Information
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {facts.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 p-3"
                >
                  <Icon size={16} className="text-[var(--color-accent)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[var(--color-subtle)] truncate">{label}</p>
                    <p className="text-xs font-semibold text-[var(--color-ink)] truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Description */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-subtle)]">
            Full job description
          </h3>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/40 p-4 sm:p-5 text-sm leading-relaxed text-[var(--color-ink)] whitespace-pre-line">
            {job.description || "No description provided."}
          </div>
        </section>

        {/* Footer info */}
        <div className="rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] p-3 text-xs text-[var(--color-muted)] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Briefcase size={14} className="text-[var(--color-accent)]" />
            Verified Campus Opportunity
          </span>
          <span className="font-medium text-[var(--color-ink)]">{employer}</span>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {showStickyCta && open && (
        <div className="sticky bottom-0 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 p-4 backdrop-blur-sm lg:hidden">
          {applyButton}
        </div>
      )}
    </article>
  );
}
