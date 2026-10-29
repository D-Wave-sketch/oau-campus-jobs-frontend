"use client";
// ============================================================================
// SECTION: IMPORTS
// ============================================================================
import { MapPin, Clock } from "lucide-react";
import {
  getEmployerName,
  isJobOpen,
  deadlineLabel,
} from "@/lib/jobFormat";

// ============================================================================
// SECTION: HOME JOB CARD (left feed item)
// One real <button> so it is keyboard accessible. No nested interactive items.
// ============================================================================
export function HomeJobCard({ job, selected, onSelect }) {
  const employer = getEmployerName(job);
  const open = isJobOpen(job);
  const closes = deadlineLabel(job.deadline);

  return (
    <button
      type="button"
      onClick={() => onSelect(job.id)}
      aria-pressed={selected}
      className={[
        "w-full rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-4 text-left",
        "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-[var(--color-accent)]",
        selected
          ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]"
          : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
      ].join(" ")}
    >
      {/* Title */}
      <h3 className="text-[15px] font-semibold leading-snug text-[var(--color-ink)]">
        {job.title}
      </h3>

      {/* Employer + location */}
      <div className="mt-1 space-y-0.5 text-sm text-[var(--color-muted)]">
        {employer && <p className="truncate">{employer}</p>}
        {job.location && (
          <p className="flex items-center gap-1 truncate">
            <MapPin size={13} className="shrink-0" />
            {job.location}
          </p>
        )}
      </div>

      {/* Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {job.compensation && (
          <span className="rounded-md bg-[var(--color-accent-glow)] px-2 py-1 text-xs font-semibold text-[var(--color-accent)]">
            {job.compensation}
          </span>
        )}
        {job.category && (
          <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-1 text-xs text-[var(--color-muted)]">
            {job.category}
          </span>
        )}
        {!open && (
          <span className="rounded-md bg-[var(--color-surface-3)] px-2 py-1 text-xs font-medium text-[var(--color-muted)]">
            Closed
          </span>
        )}
      </div>

      {/* Deadline (real data only) */}
      {open && closes && (
        <p className="mt-3 flex items-center gap-1 text-xs text-[var(--color-subtle)]">
          <Clock size={12} />
          {closes}
        </p>
      )}
    </button>
  );
}
