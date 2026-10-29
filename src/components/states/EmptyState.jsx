// ============================================================================
// SECTION: STATES - EMPTY
// ============================================================================
import { Button } from "@/components/ui/Button";

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          <Icon size={20} />
        </div>
      )}
      <div>
        <h3 className="text-base font-semibold text-[var(--color-ink)]">{title}</h3>
        {description && <p className="mt-1 text-sm text-[var(--color-muted)] max-w-md">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
