// ============================================================================
// SECTION: API ENDPOINTS
// ============================================================================
import { apiFetch } from "./api";

const withApi = (path) => (path.startsWith("/api") ? path : `/api${path.startsWith("/") ? path : `/${path}`}`);
const withRoot = (path) => path;

export const health = () => apiFetch("/health", { auth: false, timeout: 60000 });

export const login = (email, password) =>
  apiFetch(withApi("/auth/login"), { method: "POST", body: { email, password }, auth: false });

export const register = (name, email, password, role) =>
  apiFetch(withApi("/auth/register"), { method: "POST", body: { name, email, password, role }, auth: false });

export const getMe = (token) =>
  apiFetch(withApi("/users/me"), { method: "GET", token });

export const updateStudentProfile = (data, token) =>
  apiFetch(withApi("/users/me/student"), { method: "PATCH", body: data, token });

export const updateEmployerProfile = (data, token) =>
  apiFetch(withApi("/users/me/employer"), { method: "PATCH", body: data, token });

export const listJobs = (params = {}, token) => {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.location) query.set("location", params.location);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch(withApi(`/jobs${qs ? `?${qs}` : ""}`), { method: "GET", token, auth: !!token });
};

export const getJobById = (id, token) =>
  apiFetch(withApi(`/jobs/${id}`), { method: "GET", token, auth: !!token });

export const getMyJobs = (token) =>
  apiFetch(withApi("/jobs/mine"), { method: "GET", token });

export const createJob = (data, token) =>
  apiFetch(withApi("/jobs"), { method: "POST", body: data, token });

export const updateJob = (id, data, token) =>
  apiFetch(withApi(`/jobs/${id}`), { method: "PATCH", body: data, token });

export const closeJob = (id, token) =>
  apiFetch(withApi(`/jobs/${id}/close`), { method: "PATCH", token });

export const deleteJob = (id, token) =>
  apiFetch(withApi(`/jobs/${id}`), { method: "DELETE", token });

export const getSavedJobs = (token) =>
  apiFetch(withApi("/jobs/saved"), { method: "GET", token });

export const saveJob = (id, token) =>
  apiFetch(withApi(`/jobs/${id}/save`), { method: "POST", token });

export const unsaveJob = (id, token) =>
  apiFetch(withApi(`/jobs/${id}/save`), { method: "DELETE", token });

export const reportJob = (id, reason, token) =>
  apiFetch(withApi(`/jobs/${id}/report`), { method: "POST", body: { reason }, token });

export const applyToJob = (jobId, coverMessage, token) =>
  apiFetch(withApi("/applications"), { method: "POST", body: { jobId, coverMessage: coverMessage || undefined }, token });

export const getMyApplications = (token) =>
  apiFetch(withApi("/applications/mine"), { method: "GET", token });

export const getJobApplications = (jobId, token) =>
  apiFetch(withApi(`/applications/job/${jobId}`), { method: "GET", token });

export const updateApplicationStatus = (applicationId, status, token) =>
  apiFetch(withApi(`/applications/${applicationId}/status`), { method: "PATCH", body: { status }, token });

export const adminListUsers = (token) =>
  apiFetch(withApi("/admin/users"), { method: "GET", token });

export const adminUpdateUserRole = (id, role, token) =>
  apiFetch(withApi(`/admin/users/${id}/role`), { method: "PATCH", body: { role }, token });

export const adminListPendingEmployers = (token) =>
  apiFetch(withApi("/admin/employers/pending"), { method: "GET", token });

export const adminVerifyEmployer = (employerProfileId, status, token) =>
  apiFetch(withApi(`/admin/employers/${employerProfileId}/verification`), { method: "PATCH", body: { status }, token });

export const adminListJobs = (token) =>
  apiFetch(withApi("/admin/jobs"), { method: "GET", token });

export const adminModerateJob = (id, status, token) =>
  apiFetch(withApi(`/admin/jobs/${id}/moderation`), { method: "PATCH", body: { status }, token });

export const adminListReports = (token) =>
  apiFetch(withApi("/admin/reports"), { method: "GET", token });

export const adminReviewReport = (id, status, token) =>
  apiFetch(withApi(`/admin/reports/${id}/review`), { method: "PATCH", body: { status }, token });
