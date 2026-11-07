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

export function JobCard({
  job,
  selected,
  onSelect,
  saved,
  onToggleSave,
  applied,
}) {
  const emp = job.employer?.name || job.employer?.organizationName || "";
  const remaining = daysUntil(job.deadline);
  return (
    <article
      className={`w-full transition-colors
        px-4 py-3 lg:rounded-[var(--radius-lg)] lg:border lg:p-3
        ${
          selected
            ? "bg-[var(--color-accent-glow)] lg:border-[var(--color-accent)]"
            : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] lg:border-[var(--color-border)] lg:hover:border-[var(--color-border-strong)]"
        }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
        >
          <div>
            {remaining !== null && remaining > 0 && (
              <div className="text-[var(--color-muted)] text-[10px] font-medium tracking-wider">
                {remaining}d left
              </div>
            )}
            <div className="mt-0.5 text-sm font-semibold text-[var(--color-ink)]">
              {job.title}
            </div>
            <div className="mt-0.5 text-xs text-[var(--color-muted)]">
              {emp}
            </div>
          </div>
          <div className="mt-2 text-xs text-[var(--color-muted)]">
            {job.location}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {job.category && (
              <Badge variant="neutral" size="sm">
                {job.category}
              </Badge>
            )}
            {job.employmentType && (
              <Badge variant="neutral" size="sm">
                {job.employmentType.replace("_", " ").toLowerCase()}
              </Badge>
            )}
            {job.compensation && (
              <span className="rounded-sm bg-[var(--color-surface-3)] px-2 py-0.5 text-[var(--color-muted)] text-xs">
                {job.compensation}
              </span>
            )}
          </div>
        </button>
        {onToggleSave && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onToggleSave(job)}
            aria-label={saved ? "Unsave job" : "Save job"}
          >
            {saved ? (
              <BookmarkCheck size={14} className="text-[var(--color-accent)]" />
            ) : (
              <Bookmark size={14} />
            )}
          </Button>
        )}
      </div>
    </article>
  );
}
