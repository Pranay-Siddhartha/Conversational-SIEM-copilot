"use client";
import { useState } from "react";
import { FileText, Download, Loader } from "lucide-react";
import { generateReport, getReports } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pastReports, setPastReports] = useState<any[]>([]);
  const [showPast, setShowPast] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateReport("Security Incident Report");
      setReport(data);
    } catch {
      setReport({ content: "⚠️ Error generating report. Make sure the backend is running." });
    }
    setLoading(false);
  };

  const loadPastReports = async () => {
    const data = await getReports();
    setPastReports(Array.isArray(data) ? data : []);
    setShowPast(true);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && report) {
      printWindow.document.write(`
        <html><head><title>${report.title || "Incident Report"}</title>
        <style>body{font-family:Arial,sans-serif;padding:40px;line-height:1.8;color:#1a1a1a}
        h1{color:#4338ca}h2{color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px}
        table{width:100%;border-collapse:collapse;margin:12px 0}th,td{padding:10px;border:1px solid #d1d5db;text-align:left}
        th{background:#f1f5f9}ul{padding-left:24px}code{background:#f1f5f9;padding:2px 6px;border-radius:3px}
        </style></head><body>${report.content}</body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>📝 Incident Reports</h1>
        <p>Generate comprehensive AI-powered security incident reports</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader size={16} className="spinner" /> : <FileText size={16} />}
          {loading ? "Generating..." : "Generate Report"}
        </button>
        <button className="btn btn-outline" onClick={loadPastReports}>
          Past Reports
        </button>
        {report && (
          <button className="btn btn-outline" onClick={handlePrint}>
            <Download size={16} />
            Print / Save PDF
          </button>
        )}
      </div>

      {/* Past Reports List */}
      {showPast && pastReports.length > 0 && !report && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="card-title" style={{ marginBottom: 16 }}>Previous Reports</h3>
          {pastReports.map((r) => (
            <div
              key={r.id}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-color)",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onClick={() => setReport(r)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 500 }}>{r.title}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Content */}
      {report && (
        <div className="report-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.content}</ReactMarkdown>
        </div>
      )}

      {!report && !loading && !showPast && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
          <FileText size={64} style={{ margin: "0 auto 20px", opacity: 0.3 }} />
          <h3 style={{ fontSize: 18, marginBottom: 8, color: "var(--text-secondary)" }}>No Report Generated Yet</h3>
          <p>Click &quot;Generate Report&quot; to create a comprehensive incident report from your uploaded logs.</p>
        </div>
      )}
    </div>
  );
}
