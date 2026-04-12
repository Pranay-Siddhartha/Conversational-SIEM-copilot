"use client";
import { useEffect, useState } from "react";
import { Clock, AlertTriangle, Zap, ShieldAlert, Activity } from "lucide-react";
import { getAttackChains } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TimelinePage() {
  const [chains, setChains] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAttackChains()
      .then((data) => {
        setChains(data.chains || []);
      })
      .catch((err) => console.error("Error fetching attack chains", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Analyzing multiple attack vectors...</p>
      </div>
    );
  }

  if (chains.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1>🕐 Multi-Incident Dashboard</h1>
          <p>Investigate multiple simultaneous attack chains and thread actor narratives</p>
        </div>
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <AlertTriangle size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
          <p>No suspicious events detected. Upload logs to see attack chains.</p>
        </div>
      </div>
    );
  }

  const activeChain = chains[selectedIndex];
  const prediction = activeChain?.prediction;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1>🕐 Multi-Incident Dashboard</h1>
        <p>Investigate multiple simultaneous attack chains and thread actor narratives</p>
      </div>

      {/* Incident Switcher */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 12, fontWeight: 600 }}>
          Active Attack Chains ({chains.length})
        </h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {chains.map((chain, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              style={{
                background: selectedIndex === i ? "var(--bg-card-hover)" : "var(--bg-card)",
                border: `1px solid ${selectedIndex === i ? "var(--accent-primary)" : "var(--border-color)"}`,
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 4,
                minWidth: 200,
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: selectedIndex === i ? "var(--accent-primary)" : "var(--text-primary)" }}>
                  {chain.incident_name}
                </span>
                <span className={`badge ${chain.severity}`} style={{ padding: "2px 6px", fontSize: 10 }}>
                  {chain.severity}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                <Activity size={12} /> {chain.source_ip}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {chain.primary_attack_type}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Prediction Card */}
      {prediction && prediction.predicted_next_move && prediction.predicted_next_move !== "Unknown" && (
        <div className="prediction-card" style={{ marginBottom: 28 }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Zap size={20} style={{ color: "var(--accent-secondary)" }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--accent-secondary)" }}>
                🔮 Predicted Next Move for {activeChain.incident_name}
              </h3>
              <span className={`badge ${prediction.confidence === "high" ? "critical" : prediction.confidence === "medium" ? "medium" : "low"}`}>
                {prediction.confidence} confidence
              </span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 10, color: "var(--text-primary)" }}>
              {prediction.predicted_next_move}
            </p>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
              {prediction.reasoning}
            </p>
            {prediction.recommended_actions?.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--warning)", marginBottom: 8 }}>
                  ⚡ Recommended Mitigations:
                </h4>
                <ul style={{ paddingLeft: 20 }}>
                  {prediction.recommended_actions.map((a: string, i: number) => (
                    <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Narrative */}
      {activeChain?.ai_narrative && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div className="card-header">
            <h3 className="card-title">
              <ShieldAlert size={18} style={{ display: "inline", marginRight: 8, color: "var(--danger)" }} />
              Attack Chain Narrative
            </h3>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-secondary)" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeChain.ai_narrative}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Timeline */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
        Chain Events Log
      </h3>
      {activeChain?.timeline?.length > 0 ? (
        <div className="timeline">
          {activeChain.timeline.map((e: any, i: number) => (
            <div key={i} className="timeline-event">
              <div className={`timeline-dot ${e.severity}`} />
              <div className="timeline-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span className="timeline-time">
                    <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
                    {e.timestamp}
                  </span>
                  <span className={`badge ${e.severity}`}>{e.severity}</span>
                </div>
                <p className="timeline-desc">{e.event}</p>
                {e.details && (
                  <p style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 6,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: "var(--bg-secondary)",
                    padding: "8px 12px",
                    borderRadius: 6,
                    overflowX: "auto",
                  }}>
                    {e.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)" }}>No log events in this chain.</p>
      )}
    </div>
  );
}
