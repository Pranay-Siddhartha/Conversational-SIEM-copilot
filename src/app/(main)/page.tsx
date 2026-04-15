"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Globe, Users, TrendingUp, Zap } from "lucide-react";
import { getStats, getRiskScore } from "@/lib/api";
import { StatSkeleton, Skeleton } from "@/components/Skeleton";
import { AlertBanner } from "@/components/AlertBanner";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ff0000",
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
  info: "#0ea5e9",
};

const containerVars = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getStats(), getRiskScore()])
      .then(([s, r]) => { setStats(s); setRisk(r); })
      .catch((err) => {
        console.error("Dashboard data load failure", err);
        setError("Unable to synchronize with SIEM backend. Retrying automatically...");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 p-8">
        <div className="page-header">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => <StatSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Skeleton className="h-64 w-full" />
           <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center px-4">
        <AlertTriangle size={64} className="text-[var(--danger)] mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">Core Service Unavailable</h2>
        <AlertBanner type="error" message={error} />
        <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
          Attempt Manual Reconnect
        </button>
      </div>
    );
  }

  if (!stats || stats.total_events === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 px-4"
      >
        <div className="relative inline-block mb-8">
            <Shield size={80} className="text-[var(--accent-primary)] opacity-20" />
            <Zap size={40} className="text-[var(--accent-primary)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-3xl font-bold mb-3">Initialize SIEM Operations</h2>
        <p className="text-[var(--text-muted)] max-w-md mx-auto mb-10 text-lg">
          No datasets detected in the current SOC environment. Connect a log source to activate AI threat detection.
        </p>
        <div className="flex justify-center gap-4">
            <a href="/upload" className="btn btn-primary px-8 py-3">
              Deploy Logs
            </a>
            <a href="/chat" className="btn btn-outline px-8 py-3">
              Launch Copilot
            </a>
        </div>
      </motion.div>
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
    <motion.div 
      variants={containerVars}
      initial="hidden"
      animate="visible"
      className="max-w-[1400px] mx-auto"
    >
      <div className="mb-12">
        <motion.h1 
          variants={itemVars} 
          className="text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-2"
        >
          🛡️ SOC Overview
        </motion.h1>
        <motion.p 
          variants={itemVars} 
          className="text-lg text-[var(--text-muted)] max-w-2xl"
        >
          Real-time telemetry and AI-driven incident analysis across your global infrastructure.
        </motion.p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid mb-12">
        <motion.div variants={itemVars} className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value text-[var(--accent-primary)]">
                {stats.total_events?.toLocaleString()}
              </div>
              <div className="stat-label">Total Logs Ingested</div>
            </div>
            <div className="p-3 bg-[rgba(0,243,255,0.05)] rounded-xl">
              <TrendingUp size={24} className="text-[var(--accent-primary)]" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-[rgba(255,255,255,0.03)] rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-[var(--accent-primary)] rounded-full opacity-50" />
          </div>
        </motion.div>
        
        <motion.div variants={itemVars} className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value text-[var(--danger)]">{stats.suspicious_events}</div>
              <div className="stat-label">Security Anomalies</div>
            </div>
            <div className="p-3 bg-[rgba(239,68,68,0.05)] rounded-xl">
              <AlertTriangle size={24} className="text-[var(--danger)]" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-[rgba(255,255,255,0.03)] rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-[var(--danger)] rounded-full opacity-50" />
          </div>
        </motion.div>

        <motion.div variants={itemVars} className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value text-[var(--success)]">{stats.unique_ips}</div>
              <div className="stat-label">Unique Sources</div>
            </div>
            <div className="p-3 bg-[rgba(16,185,129,0.05)] rounded-xl">
              <Globe size={24} className="text-[var(--success)]" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-[rgba(255,255,255,0.03)] rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-[var(--success)] rounded-full opacity-50" />
          </div>
        </motion.div>

        <motion.div variants={itemVars} className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value text-[var(--warning)]">{stats.unique_users}</div>
              <div className="stat-label">Active Identities</div>
            </div>
            <div className="p-3 bg-[rgba(245,158,11,0.05)] rounded-xl">
              <Users size={24} className="text-[var(--warning)]" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-[rgba(255,255,255,0.03)] rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-[var(--warning)] rounded-full opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <motion.div variants={itemVars} className="card">
          <div className="card-header border-b border-[var(--border-color)] pb-6 mb-8">
            <h3 className="card-title flex items-center gap-3">
                <Zap size={22} className="text-[var(--accent-primary)]" />
                Aggregated Risk Profile
            </h3>
          </div>
          {risk && (
            <div className="flex flex-col xl:flex-row items-center gap-12">
              <div className={`risk-circle ${risk.severity} shrink-0`}>
                <span className="score">{Math.round(risk.overall_score)}</span>
                <span className="label">Index</span>
              </div>
              <div className="flex-1 w-full space-y-12">
                {risk.factors?.map((f: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-2.5 px-1">
                      <span className="text-[var(--text-secondary)] font-semibold uppercase tracking-widest opacity-80">{f.factor}</span>
                      <span className="text-[var(--accent-primary)] font-bold">+{f.impact}</span>
                    </div>
                    <div className="h-2 w-full bg-[rgba(255,255,255,0.02)] rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(f.impact * 4, 100)}%` }}
                        transition={{ duration: 1.8, ease: "circOut", delay: 0.8 + (i * 0.15) }}
                        className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVars} className="card">
          <div className="card-header border-b border-[var(--border-color)] pb-6 mb-2">
            <h3 className="card-title">Threat Distribution Matrix</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="55%"
                outerRadius={90}
                innerRadius={65}
                dataKey="value"
                stroke="none"
                paddingAngle={4}
              >
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "rgba(2, 4, 8, 0.98)", border: "1px solid var(--border-color)", borderRadius: 12, fontSize: 13, backdropFilter: 'blur(12px)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 pt-4 border-t border-[var(--border-color)]">
            {severityData.map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill, boxShadow: `0 0 10px ${d.fill}40` }} />
                <span className="text-xs text-[var(--text-muted)] font-medium capitalize">
                  {d.name}: <span className="text-[var(--text-primary)] ml-1">{d.value}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Hostile Infra + Access Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div variants={itemVars} className="card">
          <div className="card-header border-b border-[var(--border-color)] pb-6 mb-8">
            <h3 className="card-title">Infiltration Sources (Top IPs)</h3>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={stats.top_source_ips?.slice(0, 8)} layout="vertical" margin={{ left: -10, right: 30 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="ip" type="category" stroke="var(--text-muted)" fontSize={12} width={130} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ background: "rgba(2, 4, 8, 0.98)", border: "1px solid var(--border-color)", borderRadius: 12, fontSize: 13, backdropFilter: 'blur(12px)' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                {stats.top_source_ips?.map((entry: any, i: number) => (
                  <Cell
                    key={i}
                    fill={SEVERITY_COLORS[entry.severity] || "var(--accent-secondary)"}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVars} className="card">
          <div className="card-header border-b border-[var(--border-color)] pb-6 mb-8">
            <h3 className="card-title">Anomalous Access Pulse</h3>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={stats.failed_login_trend}>
              <XAxis
                dataKey="time"
                stroke="var(--text-muted)"
                fontSize={11}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: string) => v.split(" ")[1] || v}
              />
              <YAxis stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "rgba(2, 4, 8, 0.98)", border: "1px solid var(--border-color)", borderRadius: 12, fontSize: 13, backdropFilter: 'blur(12px)' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--danger)"
                strokeWidth={4}
                dot={{ fill: "var(--danger)", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 7, fill: "#fff", stroke: "var(--danger)", strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}
