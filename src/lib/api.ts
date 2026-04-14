const API_BASE = process.env.NODE_ENV === "development" ? "http://localhost:8000" : "";

/**
 * Centralized API fetch utility for SIEM Copilot.
 * Uses relative routes in production and localhost in development.
 */
export async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_BASE}/api${path}`;
  
  const headers = new Headers(options?.headers);
  
  // Automatically set Content-Type if body is present and not FormData
  if (options?.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${res.statusText}`);
  }

  return res.json();
}

/**
 * High-level API functions for SIEM dashboard components.
 */

export async function uploadLog(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/logs/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getEvents(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch(`/logs/events${query}`);
}

export async function getStats() {
  return apiFetch("/logs/stats");
}

export async function sendChat(message: string) {
  return apiFetch("/chat/", {
    method: "POST",
    body: JSON.stringify({ message, context_limit: 200 }),
  });
}

export async function getTimeline() {
  return apiFetch("/analysis/timeline");
}

export async function getPredictions() {
  return apiFetch("/analysis/predictions");
}

export async function getAttackChains() {
  return apiFetch("/analysis/chains");
}

export async function getRiskScore() {
  return apiFetch("/analysis/risk-score");
}

export async function getThreats() {
  return apiFetch("/analysis/threats");
}

export async function generateReport(title?: string) {
  return apiFetch("/reports/generate", {
    method: "POST",
    body: JSON.stringify({ title: title || "Incident Report" }),
  });
}

export async function getReports() {
  return apiFetch("/reports/");
}

export async function clearLogs() {
  return apiFetch("/logs/clear", { method: "DELETE" });
}
