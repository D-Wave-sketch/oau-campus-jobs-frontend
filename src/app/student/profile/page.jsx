"use client";
// ============================================================================
// SECTION: IMPORTS
// ============================================================================
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateStudentProfile } from "@/lib/endpoints";
import { getProfileCompleteness } from "@/lib/profileCompleteness";
import { ProfileHeader } from "./ProfileHeader";
import { StudentProfileView } from "./StudentProfileView";
import { StudentProfileForm } from "./StudentProfileForm";

// ============================================================================
// SECTION: LOADING SKELETON
// ============================================================================
function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden="true">
      <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--color-surface-3)]" />
      <div className="h-32 rounded-[var(--radius-lg)] bg-[var(--color-surface-3)]" />
      <div className="h-24 rounded-[var(--radius-lg)] bg-[var(--color-surface-3)]" />
    </div>
  );
}

// ============================================================================
// SECTION: PAGE
// ============================================================================
export default function StudentProfilePage() {
  const { user, profile, status, refreshUser } = useAuth();

  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // --------------------------------------------------------------------------
  // DERIVED: GET /api/users/me wraps the profile as { data: StudentProfile }
  // --------------------------------------------------------------------------
  const p = profile?.data || profile || null;
  const account = {
    name: user?.name || p?.user?.name || "",
    email: user?.email || p?.user?.email || "",
  };
  const completeness = getProfileCompleteness(p);

  // --------------------------------------------------------------------------
  // EFFECT: hide the success message after a few seconds
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 4000);
    return () => clearTimeout(t);
  }, [saved]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  const startEditing = () => {
    setSaved(false);
    setFormError("");
    setFieldErrors({});
    setEditing(true);
  };

  const cancelEditing = () => {
    setFormError("");
    setFieldErrors({});
    setEditing(false);
  };

  // PATCH /api/users/me/student (department, level, skills, cvUrl)
  const handleSave = async (values) => {
    setSaving(true);
    setFormError("");
    setFieldErrors({});
    try {
      await updateStudentProfile(values);
      await refreshUser();
      setEditing(false);
      setSaved(true);
    } catch (err) {
      const fields = err?.fieldErrors || {};
      setFieldErrors(fields);
      setFormError(
        Object.keys(fields).length > 0
          ? "Please fix the highlighted fields."
          : err?.message || "Could not save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================================
  // SECTION: RENDER
  // ==========================================================================
  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Loading */}
      {(status === "loading" || !p) && <ProfileSkeleton />}

      {/* Loaded */}
      {status !== "loading" && p && (
        <div className="space-y-4">
          <ProfileHeader
            name={account.name}
            email={account.email}
            roleLabel="Student"
            completeness={completeness}
            editing={editing}
            onEdit={startEditing}
          />

          {saved && (
            <div
              role="status"
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-ink)]"
            >
              Profile saved.
            </div>
          )}

          {formError && (
            <div
              role="alert"
              className="rounded-[var(--radius-lg)] border border-[var(--color-danger)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-danger)]"
            >
              {formError}
            </div>
          )}

          {editing ? (
            <StudentProfileForm
              initial={p}
              saving={saving}
              fieldErrors={fieldErrors}
              onSubmit={handleSave}
              onCancel={cancelEditing}
            />
          ) : (
            <StudentProfileView profile={p} account={account} onEdit={startEditing} />
          )}
        </div>
      )}
    </div>
  );
}