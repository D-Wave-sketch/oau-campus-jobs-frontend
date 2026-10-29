"use client";
// ============================================================================
// SECTION: IMPORTS
// ============================================================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, FileText, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/profileCompleteness";
import { SettingsSection } from "./SettingsSection";
import { SettingsRow, SettingsLinkRow } from "./SettingsRow";

// ============================================================================
// SECTION: HELPERS
// ============================================================================
function formatMemberSince(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

// ============================================================================
// SECTION: PAGE
// Only real settings are shown. The backend has no change-password or
// notification endpoints, so those are deliberately not faked here.
// ============================================================================
export default function StudentSettingsPage() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  // --------------------------------------------------------------------------
  // DERIVED
  // --------------------------------------------------------------------------
  const p = profile?.data || profile || null;
  const name = user?.name || p?.user?.name || "";
  const email = user?.email || p?.user?.email || "";
  const memberSince = formatMemberSince(user?.createdAt || p?.user?.createdAt);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  };

  // ==========================================================================
  // SECTION: RENDER
  // ==========================================================================
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      {/* Page heading */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Manage your account and session.
        </p>
      </header>

      {/* Account */}
      <SettingsSection title="Account" description="Your sign-in details.">
        <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-base font-bold text-white"
            aria-hidden="true"
          >
            {getInitials(name || email)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
              {name || "Student"}
            </p>
            <p className="truncate text-sm text-[var(--color-muted)]">{email}</p>
          </div>
        </div>
        <SettingsRow label="Account type" value="Student" />
        {memberSince && <SettingsRow label="Member since" value={memberSince} />}
      </SettingsSection>

      {/* Shortcuts */}
      <SettingsSection title="Your activity">
        <SettingsLinkRow
          href="/student/profile"
          icon={UserRound}
          label="Edit profile"
          description="Department, level, skills and CV link"
        />
        <SettingsLinkRow
          href="/student/applications"
          icon={FileText}
          label="My applications"
          description="Track the status of every application"
        />
        <SettingsLinkRow
          href="/student/saved"
          icon={Bookmark}
          label="Saved jobs"
          description="Jobs you bookmarked for later"
        />
      </SettingsSection>

      {/* Security and session */}
      <SettingsSection title="Security" description="How your session works.">
        <SettingsRow
          label="Password"
          description="Changing your password isn't available yet."
        />
        <SettingsRow
          label="Session length"
          description="For security you are signed out automatically after 24 hours."
        />
        <SettingsRow
          label="Sign out"
          description="End your session on this device."
          action={
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--color-danger)] px-5 text-sm font-semibold text-[var(--color-danger)] transition-colors hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-danger)] disabled:opacity-60 sm:w-auto"
            >
              <LogOut size={14} />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          }
        />
      </SettingsSection>
    </div>
  );
}