"use client";
// ============================================================================
// SECTION: UI CARD
// ============================================================================
import { clsx } from "clsx";

export function Card({ children, className = "" }) {
  return (
    <div className={clsx("rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_1px_1px_rgba(0,0,0,0.02)]", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={clsx("flex flex-col gap-1 px-5 py-4", className)}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={clsx("text-base font-semibold tracking-tight text-[var(--color-ink)]", className)}>{children}</h3>;
}

export function CardDescription({ children, className = "" }) {
  return <p className={clsx("text-sm text-[var(--color-muted)]", className)}>{children}</p>;
}

export function CardContent({ children, className = "" }) {
  return <div className={clsx("px-5 pb-4", className)}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return <div className={clsx("flex items-center gap-2 px-5 py-4 border-t border-[var(--color-border)]", className)}>{children}</div>;
}
