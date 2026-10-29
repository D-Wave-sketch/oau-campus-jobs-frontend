// ============================================================================
// SECTION: ROLE REDIRECT HELPER
// ============================================================================
export function redirectByRole(role) {
  if (role === "ADMIN") return "/admin/users";
  if (role === "EMPLOYER") return "/employer";
  if (role === "STUDENT") return "/student/jobs";
  return "/";
}
