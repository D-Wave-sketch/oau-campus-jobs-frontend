// ============================================================================
// SECTION: JOB DISPLAY HELPERS
// Pure functions. No fetching. Used by the home page feed and preview panel.
// ============================================================================

// Employer name: the exact field depends on the backend response, so try the
// likely shapes and fall back to an empty string (callers hide empty values).
export function getEmployerName(job) {
  return (
    job?.employer?.organizationName ||
    job?.employerProfile?.organizationName ||
    job?.employer?.user?.name ||
    job?.employerName ||
    ""
  );
}

export function isJobOpen(job) {
  return String(job?.status || "OPEN").toUpperCase() === "OPEN";
}

export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Whole days until the deadline, or null when there is no usable deadline.
export function daysLeft(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function deadlineLabel(deadline) {
  const left = daysLeft(deadline);
  if (left === null) return "";
  if (left < 0) return "Deadline passed";
  if (left === 0) return "Closes today";
  if (left === 1) return "Closes tomorrow";
  return `Closes in ${left} days`;
}
