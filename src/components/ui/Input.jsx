"use client";
// ============================================================================
// SECTION: UI INPUT
// ============================================================================
import { clsx } from "clsx";
import { forwardRef } from "react";

export const Input = forwardRef(function Input({ className = "", label, error, id, ...props }, ref) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[var(--color-ink)]">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={clsx(
          "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-0 focus-visible:border-[var(--color-accent)]",
          error && "border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
});
