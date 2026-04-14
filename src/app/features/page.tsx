"use client";
import { Shield, Brain, BarChart3, MessageSquare, Upload, AlertTriangle, Zap } from "lucide-react";

const features = [
  {
    icon: <Brain size={28} style={{ color: "var(--accent-primary)" }} />,
    title: "AI-Powered Log Analysis",
    description: "Automatically parse and analyze authentication logs, firewall logs, CSV, and JSON formats. Our AI engine identifies patterns, anomalies, and indicators of compromise in seconds — not hours.",
  },
  {
    icon: <MessageSquare size={28} style={{ color: "var(--accent-secondary)" }} />,
    title: "Conversational Investigation",
    description: "Chat directly with your security data using natural language. Ask questions like 'Which IPs attempted brute force attacks?' and get instant, contextual responses backed by your actual log data.",
  },
  {
    icon: <AlertTriangle size={28} style={{ color: "var(--warning)" }} />,
    title: "Advanced Risk Scoring Engine",
    description: "Our extensible, rule-based risk engine evaluates failed logins, brute force patterns, privilege escalation, data exfiltration, impossible travel, and more — producing a 0–100 threat score with detailed factor breakdowns.",
  },
  {
    icon: <BarChart3 size={28} style={{ color: "var(--success)" }} />,
    title: "Real-Time Security Dashboard",
    description: "Visualize your security posture at a glance with interactive charts showing severity distributions, top source IPs, failed login trends, and per-user activity breakdowns.",
  },
  {
    icon: <Zap size={28} style={{ color: "var(--danger)" }} />,
    title: "Attack Chain Detection",
    description: "Automatically group suspicious events by threat actor IP to form distinct attack chains. Each chain gets its own AI-generated narrative, timeline, and next-move prediction.",
  },
  {
    icon: <Upload size={28} style={{ color: "var(--accent-primary)" }} />,
    title: "Multi-Format Log Ingestion",
    description: "Upload auth logs, firewall exports, structured CSVs, or raw JSON. The parser auto-detects the format, extracts fields, and normalizes everything into a unified event schema.",
  },
];

export default function FeaturesPage() {
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
          <a href="/features" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Features</a>
          <a href="/architecture" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Architecture</a>
          <a href="/docs" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Documentation</a>
        </div>
      </nav>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "64px 32px 40px" }}>
        <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 16 }}>Features</h1>
        <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          Everything you need to detect, investigate, and respond to security threats — powered by AI.
        </p>
      </div>

      {/* Feature Grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24,
        maxWidth: 1100, margin: "0 auto", padding: "0 32px 80px",
      }}>
        {features.map((f, i) => (
          <div key={i} style={{
            padding: 32,
            background: "rgba(10,12,18,0.5)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 4,
            transition: "border-color 0.2s ease",
          }}>
            <div style={{ marginBottom: 16 }}>{f.icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
