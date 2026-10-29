// ============================================================================
// SECTION: STATES - ERROR
// ============================================================================
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-[var(--color-danger)]">
        <AlertTriangle size={20} />
      </div>
      <div>
        <h3 className="text-base font-semibold text-[var(--color-ink)]">{title}</h3>
        {message && <p className="mt-1 text-sm text-[var(--color-muted)] max-w-md">{message}</p>}
      </div>
      {onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
