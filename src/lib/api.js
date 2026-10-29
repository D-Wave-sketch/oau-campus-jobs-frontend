// ============================================================================
// SECTION: API CLIENT
// ============================================================================
import { tokenStore } from "./tokenStore";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://oau-campus-jobs.onrender.com";
const BASE_URL = RAW_BASE.replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status = 500, fieldErrors = {}, payload = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.payload = payload;
  }
}

function mapFieldErrors(payload) {
  if (!payload) return {};
  if (Array.isArray(payload.errors)) {
    const map = {};
    for (const err of payload.errors) {
      if (err && err.field) {
        map[err.field] = err.message;
      }
    }
    return map;
  }
  return {};
}

export async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    body,
    token,
    headers: customHeaders = {},
    timeout = 45000,
    auth = true,
  } = options;

  const url = path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = { ...customHeaders };

  if (body !== undefined && body !== null) {
    if (!(body instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }
  }

  const authToken = token !== undefined ? token : (auth ? tokenStore.get() : null);
  if (auth && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData ? body : body !== undefined && body !== null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";
    let payload = null;
    if (contentType.includes("application/json")) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        tokenStore.clear();
        if (typeof window !== "undefined") {
          const current = window.location.pathname + window.location.search;
          if (!current.startsWith("/login")) {
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = `/login?reason=expired&next=${encodeURIComponent(current)}`;
          }
        }
      }

      const message =
        payload?.message ||
        (response.status === 403
          ? "You are not authorized to perform this action."
          : response.status === 401
          ? "Session expired. Please sign in again."
          : `Request failed with status ${response.status}`);

      const fieldErrors = mapFieldErrors(payload);
      throw new ApiError(message, response.status, fieldErrors, payload);
    }

    return payload;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") {
      throw new ApiError("The server is waking up, try again in a moment", 0);
    }
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }
}
