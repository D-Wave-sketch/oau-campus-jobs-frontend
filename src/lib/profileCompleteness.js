// ============================================================================
// SECTION: PROFILE COMPLETENESS
// Derived only from fields the backend actually stores for a student profile.
// ============================================================================

const FIELDS = [
  { key: "department", label: "department", filled: (p) => Boolean(p?.department?.trim?.()) },
  { key: "level", label: "level", filled: (p) => Boolean(String(p?.level ?? "").trim()) },
  { key: "skills", label: "skills", filled: (p) => Array.isArray(p?.skills) && p.skills.length > 0 },
  { key: "cvUrl", label: "CV link", filled: (p) => Boolean(p?.cvUrl?.trim?.()) },
];

export function getProfileCompleteness(profile) {
  const done = FIELDS.filter((f) => f.filled(profile));
  const missing = FIELDS.filter((f) => !f.filled(profile)).map((f) => f.label);
  return {
    percent: Math.round((done.length / FIELDS.length) * 100),
    missing,
  };
}

// "300" -> "300 Level"; anything else is shown exactly as stored.
export function formatLevel(level) {
  const value = String(level ?? "").trim();
  if (!value) return "";
  return /^\d{3}$/.test(value) ? `${value} Level` : value;
}

export function getInitials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
