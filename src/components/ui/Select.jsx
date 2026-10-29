"use client";
// ============================================================================
// SECTION: UI SELECT
// ============================================================================
import { clsx } from "clsx";
import { forwardRef } from "react";

export const Select = forwardRef(function Select({ className = "", label, error, id, children, ...props }, ref) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={clsx(
          "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
          error && "border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
});
