// ============================================================================
// SECTION: STATES - LOADING
// ============================================================================
export function LoadingState({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
      <p className="text-xs text-[var(--color-muted)]">{message}</p>
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-[var(--color-surface-2)] ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <Skeleton className="h-4 w-2/3 mb-2" />
      <Skeleton className="h-3 w-1/3 mb-3" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-4/5 mb-3" />
      <Skeleton className="h-8 w-24" />
    </div>
  );
}
