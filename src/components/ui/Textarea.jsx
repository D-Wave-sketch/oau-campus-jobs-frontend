"use client";
// ============================================================================
// SECTION: UI TEXTAREA
// ============================================================================
import { clsx } from "clsx";
import { forwardRef } from "react";

export const Textarea = forwardRef(function Textarea({ className = "", label, error, id, ...props }, ref) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        className={clsx(
          "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
          error && "border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
});
