"use client";
// ============================================================================
// SECTION: EMPLOYER - SETTINGS
// ============================================================================
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function EmployerSettingsPage() {
  const { user, logout } = useAuth();
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-ink)] tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Account settings</p>
      </div>
      <Card className="p-4">
        <div className="text-sm"><span className="text-[var(--color-muted)]">Email:</span> {user?.email}</div>
        <div className="mt-4">
          <Button variant="danger" onClick={logout}>Log out</Button>
        </div>
      </Card>
    </div>
  );
}
