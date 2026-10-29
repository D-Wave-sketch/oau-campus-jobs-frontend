"use client";
// ============================================================================
// SECTION: UI BUTTON
// ============================================================================
import { clsx } from "clsx";

export function Button({ children, className = "", variant = "primary", size = "md", disabled = false, type = "button", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    primary: "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-2)] shadow-sm",
    apply: "bg-[var(--color-apply)] text-white hover:bg-[var(--color-apply-hover)] shadow-sm font-semibold",
    brand: "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-2)] shadow-sm font-semibold",
    secondary: "bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)]",
    ghost: "text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]",
    danger: "bg-[var(--color-danger)] text-white hover:opacity-90 shadow-sm",
    outline: "border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)]",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-sm",
  };
  return (
    <button type={type} disabled={disabled} className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
