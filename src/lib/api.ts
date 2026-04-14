/**
 * SIEM Copilot Enterprise API Client
 * Production-ready bridge with exponential backoff retries and timeout protection.
 */

const BASE_URL =
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api`;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

/**
 * Enhanced fetch with retry logic and timeout protection.
 */
async function apiFetch(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s SaaS timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
        // SaaS Error Handling: Extract JSON error if possible
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.error || `Error ${response.status}`;
        
        // Retry logic for 5xx errors
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
            console.warn(`[API] Server error (${response.status}). Retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            return apiFetch(endpoint, options, retryCount + 1);
        }

        throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Request timed out after 30 seconds. Please try again.");
    }
    
    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.warn(`[API] Network error. Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        return apiFetch(endpoint, options, retryCount + 1);
    }
    
    throw error;
  }
}

// ── LOGS ──────────────────────────────────────────────────

export async function uploadLog(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/logs/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Upload failed. Verify file format.");
  }

  return response.json();
}

export async function getStats() {
  return apiFetch("/logs/stats");
}

export async function clearLogs() {
  return apiFetch("/logs/clear", { method: "DELETE" });
}

// ── ANALYSIS ──────────────────────────────────────────────

export async function getRiskScore() {
  return apiFetch("/analysis/risk-score");
}

export async function getAttackChains() {
  return apiFetch("/analysis/chains");
}

export async function getPredictions() {
  return apiFetch("/analysis/predictions");
}

// ── CHAT ──────────────────────────────────────────────────

export async function sendChat(message: string, contextLimit: number = 30) {
  return apiFetch("/chat/", {
    method: "POST",
    body: JSON.stringify({ message, context_limit: contextLimit }),
  });
}

// ── REPORTS ──────────────────────────────────────────────

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
