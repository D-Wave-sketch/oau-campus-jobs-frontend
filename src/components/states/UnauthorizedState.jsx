// ============================================================================
// SECTION: STATES - UNAUTHORIZED
// ============================================================================
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function UnauthorizedState({ message = "You don't have permission to view this page." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
        <ShieldAlert size={22} />
      </div>
      <div>
        <h3 className="text-base font-semibold text-[var(--color-ink)]">Unauthorized</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)] max-w-md">{message}</p>
      </div>
      <Button asChild>
        <Link href="/login">Go to login</Link>
      </Button>
    </div>
  );
}
