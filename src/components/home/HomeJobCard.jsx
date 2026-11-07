"use client";
// ============================================================================
// SECTION: HOME JOB CARD (left feed item)
// ============================================================================
import { MapPin } from "lucide-react";
import { getEmployerName, isJobOpen, deadlineLabel } from "@/lib/jobFormat";

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
        "grid w-full grid-cols-2 items-center gap-x-3 gap-y-1.5 border-l-2 px-3 py-2.5 text-left transition-colors duration-100 sm:grid-cols-[minmax(76px,0.65fr)_minmax(92px,0.75fr)_minmax(110px,0.85fr)_minmax(140px,1.45fr)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-[var(--color-ink)]",
        selected
          ? "border-l-[var(--color-brand)] bg-[#E7EFE9]"
          : "border-l-transparent hover:border-l-[var(--color-brand)] hover:bg-[var(--color-surface-2)]",
      ].join(" ")}
    >
      <span className="min-w-0 font-mono text-[11px] font-semibold leading-tight text-[var(--color-brand)]">
        {job.compensation || "Unpaid"}
      </span>
      <span className="min-w-0 truncate font-mono text-[10px] leading-tight text-[var(--color-muted)]">
        {open ? closes || "Open until filled" : "Closed"}
      </span>
      <span className="col-span-2 flex min-w-0 items-center gap-1 truncate text-[11px] text-[var(--color-muted)] sm:col-span-1">
        <MapPin size={11} className="shrink-0" />
        {job.location || "OAU campus"}
      </span>
      <span className="col-span-2 min-w-0 sm:col-span-1">
        <span className="block truncate text-[13px] font-bold leading-tight text-[var(--color-ink)]">
          {job.title}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-[var(--color-muted)]">
          {[employer, job.category].filter(Boolean).join(" / ") ||
            "Campus opportunity"}
        </span>
      </span>
    </button>
  );
}
