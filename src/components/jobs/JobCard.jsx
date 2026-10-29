"use client";
// ============================================================================
// SECTION: JOBS - JOB CARD
// ============================================================================
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

function daysUntil(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline).getTime();
  const now = Date.now();
  const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  return days;
}

export function JobCard({ job, selected, onSelect, saved, onToggleSave, applied }) {
  const emp = job.employer?.name || job.employer?.organizationName || "";
  const remaining = daysUntil(job.deadline);
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-[var(--radius-lg)] border p-3 transition-colors ${
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-glow)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          {remaining !== null && remaining > 0 && (
            <div className="text-[var(--color-muted)] text-[10px] font-medium tracking-wider">{remaining}d left</div>
          )}
          <div className="mt-0.5 text-sm font-semibold text-[var(--color-ink)]">{job.title}</div>
          <div className="mt-0.5 text-xs text-[var(--color-muted)]">{emp}</div>
        </div>
        {onToggleSave && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(job);
            }}
            aria-label={saved ? "Unsave job" : "Save job"}
          >
            {saved ? <BookmarkCheck size={14} className="text-[var(--color-accent)]" /> : <Bookmark size={14} />}
          </Button>
        )}
      </div>
      <div className="mt-2 text-xs text-[var(--color-muted)]">
        {job.location}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {job.category && <Badge variant="neutral" size="sm">{job.category}</Badge>}
        {job.employmentType && <Badge variant="neutral" size="sm">{job.employmentType.replace("_", " ").toLowerCase()}</Badge>}
        {job.compensation && <span className="rounded-sm bg-[var(--color-surface-3)] px-2 py-0.5 text-[var(--color-muted)] text-xs">{job.compensation}</span>}
      </div>
    </button>
  );
}
