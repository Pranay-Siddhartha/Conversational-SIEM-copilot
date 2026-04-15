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
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-[1400px] mx-auto"
    >
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-4">
            <Clock className="text-[var(--accent-primary)]" size={32} />
            Multi-Incident Timeline
        </h1>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl">Investigate simultaneous attack chains and synthesized thread actor narratives.</p>
      </div>

      {/* Incident Switcher */}
      <div className="mb-12">
        <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">
          Active Attack Chains ({chains.length})
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {chains.map((chain, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`flex flex-col items-start gap-2 p-5 rounded-2xl border transition-all duration-300 min-w-[240px] text-left ${
                selectedIndex === i 
                ? "bg-[rgba(0,243,255,0.08)] border-[var(--accent-primary)] shadow-[0_0_20px_rgba(0,243,255,0.05)]" 
                : "bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[rgba(0,243,255,0.3)] hover:bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`font-bold text-sm tracking-tight ${selectedIndex === i ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                  {chain.incident_name}
                </span>
                <span className={`badge ${chain.severity}`}>{chain.severity}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
                <Activity size={12} className="opacity-70" /> {chain.source_ip}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1 opacity-70">
                {chain.primary_attack_type}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          {/* Prediction Card */}
          {prediction && prediction.predicted_next_move && prediction.predicted_next_move !== "Unknown" && (
            <div className="prediction-card">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Zap size={24} className="text-[var(--accent-primary)]" />
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                        Strategic Prediction
                    </h3>
                  </div>
                  <span className={`badge ${prediction.confidence === "high" ? "critical" : prediction.confidence === "medium" ? "medium" : "low"}`}>
                    {prediction.confidence} Confidence
                  </span>
                </div>
                
                <div className="mb-6 p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl">
                    <p className="text-xl font-bold text-[var(--accent-primary)] mb-2">
                    {prediction.predicted_next_move}
                    </p>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                    {prediction.reasoning}
                    </p>
                </div>

                {prediction.recommended_actions?.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[var(--warning)] uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} /> Immediate Mitigations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {prediction.recommended_actions.map((a: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.1)] rounded-xl text-sm text-[var(--text-secondary)]">
                          <Activity size={14} className="text-[var(--warning)] shrink-0" />
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Narrative */}
          {activeChain?.ai_narrative && (
            <div className="card">
              <div className="card-header border-b border-[var(--border-color)] pb-6 mb-8">
                <h3 className="card-title flex items-center gap-3">
                  <ShieldAlert size={22} className="text-[var(--danger)]" />
                  Synthesis & Narrative
                </h3>
              </div>
              <div className="prose prose-invert max-w-none prose-sm opacity-90 leading-relaxed text-[var(--text-secondary)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeChain.ai_narrative}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Sidebar Column */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">
            Event Sequence
          </h3>
          {activeChain?.timeline?.length > 0 ? (
            <div className="timeline">
              {activeChain.timeline.map((e: any, i: number) => (
                <div key={i} className="timeline-event">
                  <div className={`timeline-dot ${e.severity}`} />
                  <div className="timeline-content">
                    <div className="flex justify-between items-center mb-3">
                      <span className="timeline-time flex items-center gap-1.5">
                        <Clock size={12} />
                        {e.timestamp}
                      </span>
                      <span className={`badge ${e.severity} text-[8px] py-1`}>{e.severity}</span>
                    </div>
                    <p className="timeline-desc text-sm font-medium">{e.event}</p>
                    {e.details && (
                      <div className="mt-4 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[11px] text-[var(--text-muted)] font-mono overflow-hidden">
                        {e.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-[var(--border-color)] rounded-3xl opacity-50">
                <p className="text-sm text-[var(--text-muted)]">No telemetry sequence available.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
    </div>
  );
}
