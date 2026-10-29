"use client";
// ============================================================================
// SECTION: IMPORTS
// ============================================================================
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// ============================================================================
// SECTION: SETTINGS ROW (label + value on the left, optional action on the right)
// ============================================================================
export function SettingsRow({ label, value, description, action }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--color-ink)]">{label}</p>
        {value && (
          <p className="mt-0.5 break-all text-sm text-[var(--color-muted)]">{value}</p>
        )}
        {description && (
          <p className="mt-0.5 text-xs text-[var(--color-subtle)]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ============================================================================
// SECTION: SETTINGS LINK ROW (whole row is a navigation link)
// ============================================================================
export function SettingsLinkRow({ href, icon: Icon, label, description }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-accent)] sm:px-6"
    >
      {Icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-glow)] text-[var(--color-accent)]">
          <Icon size={18} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[var(--color-ink)]">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-[var(--color-subtle)]">{description}</span>
        )}
      </span>
      <ChevronRight size={16} className="shrink-0 text-[var(--color-subtle)]" />
    </Link>
  );
}
