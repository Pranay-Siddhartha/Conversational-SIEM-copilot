"use client";
import { useEffect, useState } from "react";
import { Clock, AlertTriangle, Zap, ShieldAlert } from "lucide-react";
import { getTimeline, getPredictions } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTimeline(), getPredictions()])
      .then(([t, p]) => { setTimeline(t); setPrediction(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Generating attack timeline...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>🕐 Attack Story Timeline</h1>
        <p>Visual narrative of suspicious activity and attack progression</p>
      </div>

      {/* Prediction Card */}
      {prediction && prediction.predicted_next_move && prediction.predicted_next_move !== "No data available for prediction." && (
        <div className="prediction-card" style={{ marginBottom: 28 }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Zap size={20} style={{ color: "var(--accent-secondary)" }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--accent-secondary)" }}>
                🔮 Predicted Next Attacker Move
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
                  ⚡ Recommended Actions:
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
      {timeline?.ai_narrative && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div className="card-header">
            <h3 className="card-title">
              <ShieldAlert size={18} style={{ display: "inline", marginRight: 8, color: "var(--danger)" }} />
              AI Attack Narrative
            </h3>
            {timeline.overall_severity && (
              <span className={`badge ${timeline.overall_severity}`}>
                {timeline.overall_severity}
              </span>
            )}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-secondary)" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{timeline.ai_narrative}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Timeline */}
      {timeline?.events?.length > 0 ? (
        <div className="timeline">
          {timeline.events.map((e: any, i: number) => (
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
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <AlertTriangle size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
          <p>No suspicious events detected. Upload logs to generate a timeline.</p>
        </div>
      )}
    </div>
  );
}
