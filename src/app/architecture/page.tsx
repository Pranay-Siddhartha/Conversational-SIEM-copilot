"use client";
import { Shield } from "lucide-react";

export default function ArchitecturePage() {
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
          <a href="/architecture" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Architecture</a>
          <a href="/docs" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Documentation</a>
        </div>
      </nav>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "64px 32px 48px" }}>
        <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 16 }}>System Architecture</h1>
        <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          A modern, decoupled stack built for speed, extensibility, and real-time threat intelligence.
        </p>
      </div>

      {/* Architecture Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px 80px" }}>

        {/* Stack Overview */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 48 }}>
          <div style={{
            padding: 32, background: "rgba(10,12,18,0.5)", border: "1px solid rgba(0,243,255,0.12)", borderRadius: 4,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--accent-primary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>Frontend</h3>
            <ul style={{ listStyle: "none", padding: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 2 }}>
              <li>▸ Next.js 16 (React 19)</li>
              <li>▸ Framer Motion Animations</li>
              <li>▸ Recharts Data Visualizations</li>
              <li>▸ Lucide React Icon System</li>
              <li>▸ Real-time WebSocket Updates</li>
            </ul>
          </div>
          <div style={{
            padding: 32, background: "rgba(10,12,18,0.5)", border: "1px solid rgba(123,97,255,0.12)", borderRadius: 4,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--accent-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>Backend</h3>
            <ul style={{ listStyle: "none", padding: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 2 }}>
              <li>▸ FastAPI (Python 3.11+)</li>
              <li>▸ SQLAlchemy ORM + SQLite</li>
              <li>▸ Groq / Google AI Integration</li>
              <li>▸ Rule-Based Risk Scoring Engine</li>
              <li>▸ Multi-Format Log Parser</li>
            </ul>
          </div>
        </div>

        {/* Data Flow */}
        <div style={{
          padding: 32, background: "rgba(10,12,18,0.5)",
          border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: 48,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: "var(--text-primary)" }}>Data Flow Pipeline</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {["Log Upload", "→", "Format Detection", "→", "Event Parsing", "→", "Threat Detection", "→", "Risk Scoring", "→", "AI Analysis", "→", "Dashboard"].map((step, i) => (
              step === "→" ? (
                <span key={i} style={{ color: "var(--accent-primary)", fontSize: 20 }}>→</span>
              ) : (
                <span key={i} style={{
                  padding: "8px 16px", background: "rgba(0,243,255,0.08)",
                  border: "1px solid rgba(0,243,255,0.15)", borderRadius: 4,
                  fontSize: 13, fontWeight: 500, color: "var(--text-primary)",
                }}>
                  {step}
                </span>
              )
            ))}
          </div>
        </div>

        {/* Security Model */}
        <div style={{
          padding: 32, background: "rgba(10,12,18,0.5)",
          border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "var(--text-primary)" }}>Risk Scoring Architecture</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 16 }}>
            The risk engine uses an extensible, object-oriented rule system. Each threat type (brute force, privilege escalation,
            impossible travel, data exfiltration, etc.) is implemented as an independent <code style={{ background: "rgba(0,243,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>RiskRule</code> class
            that evaluates events and returns weighted impact scores. Rules are dynamically registered, making the engine fully pluggable.
          </p>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }}>
            The aggregated score (0–100) maps to severity bands: <span style={{ color: "var(--success)" }}>Low (0–24)</span>,{" "}
            <span style={{ color: "var(--warning)" }}>Medium (25–49)</span>,{" "}
            <span style={{ color: "var(--danger)" }}>High (50–74)</span>,{" "}
            <span style={{ color: "var(--critical)" }}>Critical (75–100)</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
