/**
 * SIEM Copilot Frontend API Client
 * Standardized to communicate with the hardened FastAPI/Vercel backend.
 */

const BASE_URL = "/api";

/**
 * Helper for making JSON requests.
 */
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

// --- LOGS ---
export async function uploadLog(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/logs/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Upload failed: ${errorBody}`);
  }

  return response.json();
}
export async function getStats() {
  return apiFetch("/logs/stats");
}

export async function clearLogs() {
  return apiFetch("/logs/clear", { method: "DELETE" });
}

// --- ANALYSIS ---

export async function getRiskScore() {
  return apiFetch("/analysis/risk-score");
}

export async function getAttackChains() {
  return apiFetch("/analysis/chains");
}

export async function getPredictions() {
  return apiFetch("/analysis/predictions");
}

// --- CHAT ---

export async function sendChat(message: string, contextLimit: number = 30) {
  return apiFetch("/chat/", {
    method: "POST",
    body: JSON.stringify({ message, context_limit: contextLimit }),
  });
}

// --- REPORTS ---

export async function generateReport(title: string = "Security Incident Report") {
  return apiFetch("/reports/generate", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function getReports() {
  return apiFetch("/reports/");
}

export async function getReport(id: number) {
  return apiFetch(`/reports/${id}`);
}
