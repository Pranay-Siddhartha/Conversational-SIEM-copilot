"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { Shield, AlertTriangle, Globe, Users, TrendingUp } from "lucide-react";
import { getStats, getRiskScore } from "@/lib/api";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ff0000",
  high: "#ff0055",
  medium: "#ffb800",
  low: "#00ff66",
  info: "#00a3ff",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getRiskScore()])
      .then(([s, r]) => { setStats(s); setRisk(r); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!stats || stats.total_events === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <Shield size={64} style={{ color: "var(--accent-primary)", margin: "0 auto 20px" }} />
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Welcome to SIEM Copilot</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
          Upload security logs to get started with AI-powered threat analysis
        </p>
        <a href="/upload" className="btn btn-primary">
          Upload Logs
        </a>
      </div>
    );
  }

  const severityData = stats.severity_distribution
    ? Object.entries(stats.severity_distribution).map(([name, value]) => ({
        name,
        value: value as number,
        fill: SEVERITY_COLORS[name] || "#64748b",
      }))
    : [];

  return (
    <div>
      <div className="page-header">
        <h1>🛡️ Security Dashboard</h1>
        <p>Real-time overview of your security posture</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card indigo">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-value">{stats.total_events}</div>
              <div className="stat-label">Total Events</div>
            </div>
            <TrendingUp size={24} style={{ color: "var(--accent-primary)" }} />
          </div>
        </div>
        <div className="stat-card red">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-value" style={{ color: "var(--danger)" }}>{stats.suspicious_events}</div>
              <div className="stat-label">Suspicious Events</div>
            </div>
            <AlertTriangle size={24} style={{ color: "var(--danger)" }} />
          </div>
        </div>
        <div className="stat-card green">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-value" style={{ color: "var(--success)" }}>{stats.unique_ips}</div>
              <div className="stat-label">Unique IPs</div>
            </div>
            <Globe size={24} style={{ color: "var(--success)" }} />
          </div>
        </div>
        <div className="stat-card amber">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-value" style={{ color: "var(--warning)" }}>{stats.unique_users}</div>
              <div className="stat-label">Unique Users</div>
            </div>
            <Users size={24} style={{ color: "var(--warning)" }} />
          </div>
        </div>
      </div>

      {/* Risk Score + Severity Pie */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Risk Score</h3>
          </div>
          {risk && (
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <div className={`risk-circle ${risk.severity}`}>
                <span className="score">{Math.round(risk.overall_score)}</span>
                <span className="label">{risk.severity}</span>
              </div>
              <div style={{ flex: 1 }}>
                {risk.factors?.map((f: any, i: number) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{f.factor}</span>
                      <span style={{ fontSize: 12, color: "var(--accent-secondary)" }}>+{f.impact}</span>
                    </div>
                    <div style={{ height: 4, background: "var(--bg-secondary)", borderRadius: 2 }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(f.impact * 4, 100)}%`,
                        background: "linear-gradient(90deg, var(--accent-primary), var(--danger))",
                        borderRadius: 2,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Severity Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                dataKey="value"
                stroke="none"
              >
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1a1f35", border: "1px solid #2a3050", borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginTop: 16 }}>
            {severityData.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: d.fill }} />
                <span style={{ fontSize: 13, color: "var(--text-muted)", textTransform: "capitalize" }}>
                  {d.name}: {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top IPs + Failed Login Trend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔴 Top Source IPs</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stats.top_source_ips?.slice(0, 10)} layout="vertical">
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis dataKey="ip" type="category" stroke="#64748b" fontSize={11} width={110} />
              <Tooltip
                contentStyle={{ background: "#1a1f35", border: "1px solid #2a3050", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                {stats.top_source_ips?.map((entry: any, i: number) => (
                  <Cell
                    key={i}
                    fill={SEVERITY_COLORS[entry.severity] || "#6366f1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 Failed Login Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={stats.failed_login_trend}>
              <XAxis
                dataKey="time"
                stroke="#64748b"
                fontSize={10}
                tickFormatter={(v: string) => v.split(" ")[1] || v}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#1a1f35", border: "1px solid #2a3050", borderRadius: 8, fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: "#ef4444", r: 5 }}
                activeDot={{ r: 8, fill: "#f87171" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
