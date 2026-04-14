const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

export async function uploadLog(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/logs/upload`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function getEvents(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_BASE}/api/logs/events${query}`);
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/api/logs/stats`);
  return res.json();
}

export async function sendChat(message: string) {
  const res = await fetch(`${API_BASE}/api/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context_limit: 200 }),
  });
  return res.json();
}

export async function getTimeline() {
  const res = await fetch(`${API_BASE}/api/analysis/timeline`);
  return res.json();
}

export async function getPredictions() {
  const res = await fetch(`${API_BASE}/api/analysis/predictions`);
  return res.json();
}

export async function getAttackChains() {
  const res = await fetch(`${API_BASE}/api/analysis/chains`);
  return res.json();
}

export async function getRiskScore() {
  const res = await fetch(`${API_BASE}/api/analysis/risk-score`);
  return res.json();
}

export async function getThreats() {
  const res = await fetch(`${API_BASE}/api/analysis/threats`);
  return res.json();
}

export async function generateReport(title?: string) {
  const res = await fetch(`${API_BASE}/api/reports/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title || "Incident Report" }),
  });
  return res.json();
}

export async function getReports() {
  const res = await fetch(`${API_BASE}/api/reports/`);
  return res.json();
}

export async function clearLogs() {
  const res = await fetch(`${API_BASE}/api/logs/clear`, { method: "DELETE" });
  return res.json();
}
