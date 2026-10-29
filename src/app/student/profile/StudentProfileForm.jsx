"use client";
// ============================================================================
// SECTION: IMPORTS
// ============================================================================
import { useId, useState } from "react";
import { SkillsInput } from "@/components/profile/SkillsInput";

// ============================================================================
// SECTION: HELPERS
// ============================================================================
const inputClass = (invalid) =>
  [
    "h-11 w-full rounded-xl border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-ink)]",
    "placeholder:text-[var(--color-subtle)] focus:outline-none",
    "focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]",
    invalid ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]",
  ].join(" ");

// Server field errors may be a string or an array of strings.
const firstMessage = (v) => (Array.isArray(v) ? v[0] : v) || "";

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-ink)]">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-[var(--color-danger)]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-[var(--color-subtle)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// ============================================================================
// SECTION: STUDENT PROFILE FORM
// Only the four fields the backend accepts: department, level, skills, cvUrl.
// ============================================================================
export function StudentProfileForm({ initial, saving, fieldErrors, onSubmit, onCancel }) {
  const uid = useId();
  const ids = {
    department: `${uid}-department`,
    level: `${uid}-level`,
    skills: `${uid}-skills`,
    cvUrl: `${uid}-cvUrl`,
  };

  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------
  const [department, setDepartment] = useState(initial.department || "");
  const [level, setLevel] = useState(String(initial.level ?? ""));
  const [skills, setSkills] = useState(Array.isArray(initial.skills) ? initial.skills : []);
  const [cvUrl, setCvUrl] = useState(initial.cvUrl || "");
  const [clientErrors, setClientErrors] = useState({});

  // --------------------------------------------------------------------------
  // DERIVED: client errors win, then server errors
  // --------------------------------------------------------------------------
  const errorFor = (key) => clientErrors[key] || firstMessage(fieldErrors?.[key]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    const next = {};
    const trimmedUrl = cvUrl.trim();
    if (trimmedUrl && !/^https?:\/\/\S+\.\S+/i.test(trimmedUrl)) {
      next.cvUrl = "Enter a full link starting with http:// or https://";
    }
    setClientErrors(next);
    if (Object.keys(next).length > 0) return;

    // Empty strings are omitted so the backend schema never sees them.
    const values = { skills };
    if (department.trim()) values.department = department.trim();
    if (level.trim()) values.level = level.trim();
    if (trimmedUrl) values.cvUrl = trimmedUrl;
    onSubmit(values);
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6"
    >
      <div>
        <h2 className="text-base font-semibold text-[var(--color-ink)]">Edit profile</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Keep these up to date so your applications are easy to review.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={ids.department} label="Department" error={errorFor("department")}>
          <input
            id={ids.department}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Computer Science"
            aria-invalid={Boolean(errorFor("department")) || undefined}
            aria-describedby={errorFor("department") ? `${ids.department}-error` : undefined}
            className={inputClass(Boolean(errorFor("department")))}
          />
        </Field>

        <Field id={ids.level} label="Level" error={errorFor("level")}>
          <input
            id={ids.level}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="e.g. 300"
            inputMode="numeric"
            aria-invalid={Boolean(errorFor("level")) || undefined}
            aria-describedby={errorFor("level") ? `${ids.level}-error` : undefined}
            className={inputClass(Boolean(errorFor("level")))}
          />
        </Field>
      </div>

      <Field
        id={ids.skills}
        label="Skills"
        hint="Press Enter or comma after each skill."
        error={errorFor("skills")}
      >
        <SkillsInput
          id={ids.skills}
          value={skills}
          onChange={setSkills}
          invalid={Boolean(errorFor("skills"))}
          describedBy={errorFor("skills") ? `${ids.skills}-error` : `${ids.skills}-hint`}
        />
      </Field>

      <Field
        id={ids.cvUrl}
        label="CV or portfolio link"
        hint="A public link, for example Google Drive, LinkedIn or a personal site."
        error={errorFor("cvUrl")}
      >
        <input
          id={ids.cvUrl}
          type="url"
          value={cvUrl}
          onChange={(e) => setCvUrl(e.target.value)}
          placeholder="https://"
          aria-invalid={Boolean(errorFor("cvUrl")) || undefined}
          aria-describedby={errorFor("cvUrl") ? `${ids.cvUrl}-error` : `${ids.cvUrl}-hint`}
          className={inputClass(Boolean(errorFor("cvUrl")))}
        />
      </Field>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border-strong)] px-6 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
