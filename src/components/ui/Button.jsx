"use client";
// ============================================================================
// SECTION: UI BUTTON
// ============================================================================
import { clsx } from "clsx";
import { Children, cloneElement, isValidElement } from "react";

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  asChild = false,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]";

  const variants = {
    primary:   "bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] shadow-[var(--shadow-xs)]",
    apply:     "bg-[var(--color-apply)] text-white hover:bg-[var(--color-accent-2)] hover:text-[var(--color-accent-foreground)] shadow-[var(--shadow-xs)] font-semibold",
    brand:     "bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] shadow-[var(--shadow-xs)] font-semibold",
    secondary: "bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border-strong)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] hover:border-[var(--color-accent)]",
    ghost:     "text-[var(--color-muted)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]",
    danger:    "bg-[var(--color-danger)] text-white hover:opacity-90 shadow-[var(--shadow-xs)]",
    outline:   "border border-[var(--color-border-strong)] text-[var(--color-ink)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] hover:border-[var(--color-accent)]",
  };

  const sizes = {
    sm: "h-8 px-3 text-[12px]",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-sm",
  };

  const mergedClass = clsx(base, variants[variant], sizes[size], className);

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: clsx(mergedClass, children.props.className),
      "data-ui-button": "",
      "data-variant": variant,
      ...props,
    });
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={mergedClass}
      data-ui-button=""
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  );
}
