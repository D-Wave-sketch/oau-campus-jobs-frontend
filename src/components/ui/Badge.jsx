"use client";
// ============================================================================
// SECTION: UI BADGE
// ============================================================================
import { clsx } from "clsx";

const sizes = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

const styles = {
  default: "bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-border)]",
  neutral: "bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-border)]",
  success: `bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]`,
  warning: "bg-amber-50 text-amber-800 border border-amber-100",
  danger: "bg-rose-50 text-rose-700 border border-rose-100",
  info: "bg-blue-50 text-blue-700 border border-blue-100",
};

export function Badge({ children, variant = "default", size = "md", className = "" }) {
  return (
    <span className={clsx("inline-flex items-center rounded-md border", styles[variant] || styles.default, sizes[size], className)}>
      {children}
    </span>
  );
}
