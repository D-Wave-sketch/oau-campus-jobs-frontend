"use client";
// ============================================================================
// SECTION: SETTINGS SECTION
// A titled card whose children are rows separated by hairlines.
// ============================================================================
export function SettingsSection({ title, description, children }) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-[var(--color-ink)]">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">{description}</p>
        )}
      </div>
      <div className="divide-y divide-[var(--color-border)]">{children}</div>
    </section>
  );
}
