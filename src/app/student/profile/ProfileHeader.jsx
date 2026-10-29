"use client";
// ============================================================================
// SECTION: IMPORTS
// ============================================================================
import { Pencil } from "lucide-react";
import { getInitials } from "@/lib/profileCompleteness";

// ============================================================================
// SECTION: PROFILE HEADER
// Identity card: avatar, name, email, role, completeness meter, edit action.
// ============================================================================
export function ProfileHeader({ name, email, roleLabel, completeness, editing, onEdit }) {
  const { percent, missing } = completeness;

  const helper =
    percent === 100
      ? "Your profile is complete."
      : `Next: add your ${missing[0]}${missing.length > 1 ? ` (${missing.length} items left)` : ""}.`;

  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Accent band */}
      <div className="h-20 bg-[var(--color-accent-glow)] sm:h-24" aria-hidden="true" />

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        {/* Avatar + action row */}
        <div className="-mt-10 flex items-end justify-between gap-3 sm:-mt-12">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[var(--color-surface)] bg-[var(--color-accent)] text-2xl font-bold text-white sm:h-24 sm:w-24 sm:text-3xl"
            aria-hidden="true"
          >
            {getInitials(name)}
          </div>

          {!editing && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--color-border-strong)] px-4 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              <Pencil size={14} />
              Edit profile
            </button>
          )}
        </div>

        {/* Identity */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
              {name || "Your profile"}
            </h1>
            {roleLabel && (
              <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--color-muted)]">
                {roleLabel}
              </span>
            )}
          </div>
          {email && (
            <p className="mt-0.5 break-all text-sm text-[var(--color-muted)]">{email}</p>
          )}
        </div>

        {/* Completeness */}
        <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[var(--color-ink)]">Profile completeness</span>
            <span className="font-mono text-xs text-[var(--color-muted)]">{percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completeness"
            className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-surface-3)]"
          >
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">{helper}</p>
        </div>
      </div>
    </section>
  );
}
