"use client";

// ============================================================================
// SECTION: UI STATES - EMPTY STATE
// ============================================================================
import { clsx } from "clsx";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={clsx("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] text-[var(--color-muted)] mb-3 border border-[var(--color-border)]">
          {typeof Icon === "function" ? <Icon size={22} /> : Icon}
        </div>
      )}
      {title && (
        <h3 className="font-bold text-base text-[var(--color-ink)] tracking-tight">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-xs text-[var(--color-muted)] mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}