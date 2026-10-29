"use client";
// ============================================================================
// SECTION: IMPORTS
// ============================================================================
import { useState } from "react";
import { X } from "lucide-react";

// ============================================================================
// SECTION: SKILLS INPUT
// Free-text tags. Enter or comma adds, Backspace on empty removes the last.
// No hardcoded suggestion list: students type their own skills.
// ============================================================================
export function SkillsInput({ id, value, onChange, describedBy, invalid }) {
  const [draft, setDraft] = useState("");

  const addSkill = (raw) => {
    const skill = raw.trim().replace(/\s+/g, " ");
    if (!skill) return;
    const exists = value.some((s) => s.toLowerCase() === skill.toLowerCase());
    if (!exists) onChange([...value, skill]);
    setDraft("");
  };

  const removeSkill = (skill) => onChange(value.filter((s) => s !== skill));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className={[
        "flex flex-wrap items-center gap-2 rounded-xl border bg-[var(--color-surface)] px-3 py-2",
        "focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent)]",
        invalid ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]",
      ].join(" ")}
    >
      {value.map((skill) => (
        <span
          key={skill}
          className="inline-flex items-center gap-1 rounded-md bg-[var(--color-accent-glow)] py-1 pl-2.5 pr-1 text-sm font-medium text-[var(--color-accent)]"
        >
          {skill}
          <button
            type="button"
            onClick={() => removeSkill(skill)}
            aria-label={`Remove ${skill}`}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-[var(--color-surface-3)]"
          >
            <X size={12} />
          </button>
        </span>
      ))}

      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addSkill(draft)}
        placeholder={value.length === 0 ? "Type a skill and press Enter" : "Add another"}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="min-w-[140px] flex-1 bg-transparent py-1 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:outline-none"
      />
    </div>
  );
}
