"use client";
import { Shield } from "lucide-react";

export default function DocsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(5,7,10,0.85)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <a href="/login" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
          <Shield size={24} style={{ color: "var(--accent-primary)" }} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "1px" }}>SIEM Copilot</span>
        </a>
        <div style={{ display: "flex", gap: 24, fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>
          <a href="/features" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Features</a>
          <a href="/architecture" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Architecture</a>
          <a href="/docs" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Documentation</a>
        </div>
      </nav>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "64px 32px 48px" }}>
        <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 16 }}>Documentation</h1>
        <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          Quick-start guide to get SIEM Copilot running and analyzing your first logs.
        </p>
      </div>

      {/* Docs Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px 80px" }}>

        {/* Getting Started */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20, color: "var(--accent-primary)" }}>Getting Started</h2>

          <div style={{ padding: 24, background: "rgba(0,0,0,0.3)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1px" }}>1. Start the Backend</h4>
            <code style={{ display: "block", background: "rgba(0,243,255,0.06)", padding: 16, borderRadius: 4, fontSize: 14, color: "var(--accent-primary)", lineHeight: 1.8 }}>
              cd backend<br />
              pip install -r requirements.txt<br />
              python -m uvicorn app.main:app --reload
            </code>
          </div>

          <div style={{ padding: 24, background: "rgba(0,0,0,0.3)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1px" }}>2. Start the Frontend</h4>
            <code style={{ display: "block", background: "rgba(0,243,255,0.06)", padding: 16, borderRadius: 4, fontSize: 14, color: "var(--accent-primary)", lineHeight: 1.8 }}>
              cd frontend<br />
              npm install<br />
              npm run dev
            </code>
          </div>

          <div style={{ padding: 24, background: "rgba(0,0,0,0.3)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)" }}>
            <h4 style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1px" }}>3. Environment Variables</h4>
            <code style={{ display: "block", background: "rgba(0,243,255,0.06)", padding: 16, borderRadius: 4, fontSize: 14, color: "var(--accent-primary)", lineHeight: 1.8 }}>
              GROQ_API_KEY=your_groq_api_key<br />
              GOOGLE_API_KEY=your_google_api_key
            </code>
          </div>
        </section>

        {/* Usage */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20, color: "var(--accent-primary)" }}>Usage Guide</h2>

          {[
            { step: "Upload Logs", desc: "Navigate to Upload Logs from the sidebar. Drag and drop your .log, .csv, .json, or .txt files. The system auto-detects the format and parses events." },
            { step: "View Dashboard", desc: "The Security Dashboard displays real-time metrics: total events, suspicious activity count, risk score with factor breakdown, severity distribution, top source IPs, and login trends." },
            { step: "Investigate via Chat", desc: "Use the Investigation Chat to ask natural language questions about your data. The AI has full context of your uploaded logs and detected threats." },
            { step: "Review Attack Timeline", desc: "The Attack Timeline groups events into distinct attack chains by threat actor IP. Each chain includes an AI-generated narrative and next-move prediction." },
            { step: "Generate Reports", desc: "Export comprehensive security reports with executive summaries, technical breakdowns, and recommended remediation steps." },
          ].map((item, i) => (
            <div key={i} style={{
              padding: "20px 24px", marginBottom: 12,
              background: "rgba(10,12,18,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4,
              display: "flex", gap: 16, alignItems: "flex-start",
            }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, minWidth: 28, borderRadius: 4,
                background: "rgba(0,243,255,0.1)", color: "var(--accent-primary)",
                fontSize: 13, fontWeight: 700,
              }}>
                {i + 1}
              </span>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>{item.step}</h4>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* API Reference */}
        <section>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20, color: "var(--accent-primary)" }}>API Endpoints</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", color: "var(--accent-primary)", fontWeight: 600 }}>Method</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", color: "var(--accent-primary)", fontWeight: 600 }}>Endpoint</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", color: "var(--accent-primary)", fontWeight: 600 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["POST", "/api/upload", "Upload and parse a log file"],
                  ["GET", "/api/dashboard", "Retrieve dashboard metrics and risk score"],
                  ["POST", "/api/chat", "Send a natural language query to the AI"],
                  ["GET", "/api/timeline", "Get attack chains and event timeline"],
                  ["GET", "/api/report", "Generate a comprehensive security report"],
                  ["DELETE", "/api/clear", "Clear all stored logs and reset the database"],
                ].map(([method, endpoint, desc], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600,
                        background: method === "POST" ? "rgba(0,243,255,0.1)" : method === "GET" ? "rgba(0,255,102,0.1)" : "rgba(255,0,85,0.1)",
                        color: method === "POST" ? "var(--accent-primary)" : method === "GET" ? "var(--success)" : "var(--danger)",
                      }}>
                        {method}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", color: "var(--text-primary)", fontFamily: "monospace" }}>{endpoint}</td>
                    <td style={{ padding: "10px 16px", color: "var(--text-secondary)" }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
