"use client";
import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { uploadLog, clearLogs } from "@/lib/api";

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [dragover, setDragover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

const handleFile = async (file: File) => {
  setUploading(true);
  setError("");
  setResult(null);

  try {
    const data = await uploadLog(file);
    setResult(data);
  } catch (e) {
    setError(
      e instanceof Error
        ? e.message
        : "Failed to upload log file."
    );
  } finally {
    setUploading(false);
  }
};

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClear = async () => {
    try {
      await clearLogs();
      setResult(null);
      setError("");
    } catch {
      setError("Failed to clear logs.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>📤 Upload Security Logs</h1>
        <p>Upload auth logs, firewall logs, CSV, or JSON files for analysis</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragover ? "dragover" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
        onDragLeave={() => setDragover(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          style={{ display: "none" }}
          accept=".log,.csv,.json,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {uploading ? (
          <>
            <div className="spinner" style={{ margin: "0 auto", width: 32, height: 32 }} />
            <h3 style={{ marginTop: 16 }}>Parsing & Storing Events...</h3>
          </>
        ) : (
          <>
            <Upload size={48} style={{ color: "var(--accent-primary)", margin: "0 auto" }} />
            <h3>Drop your log file here or click to browse</h3>
            <p>Supported formats: auth logs, firewall logs, CSV, JSON</p>
          </>
        )}
        <div className="format-badges">
          <span className="format-badge">.log</span>
          <span className="format-badge">.csv</span>
          <span className="format-badge">.json</span>
          <span className="format-badge">.txt</span>
        </div>
      </div>

      {/* Success Result */}
      {result && (
        <div className="card" style={{ marginTop: 24, borderColor: "var(--success)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <CheckCircle size={24} style={{ color: "var(--success)" }} />
            <h3 style={{ color: "var(--success)" }}>Upload Successful!</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div className="stat-card indigo">
              <div className="stat-value">{result.events_count}</div>
              <div className="stat-label">Events Parsed</div>
            </div>
            <div className="stat-card green">
              <div className="stat-value" style={{ fontSize: 20, textTransform: "uppercase" }}>
                {result.log_source}
              </div>
              <div className="stat-label">Source Type</div>
            </div>
            <div className="stat-card amber">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={20} style={{ color: "var(--warning)" }} />
                <span style={{ fontSize: 14 }}>{result.message}</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <a href="/" className="btn btn-primary">View Dashboard</a>
            <a href="/chat" className="btn btn-outline">Start Investigation</a>
            <a href="/timeline" className="btn btn-outline">View Timeline</a>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{ marginTop: 24, borderColor: "var(--danger)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AlertCircle size={24} style={{ color: "var(--danger)" }} />
            <p style={{ color: "#fca5a5" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn btn-danger" onClick={handleClear}>
          Clear All Logs
        </button>
        
        <div style={{ borderLeft: "1px solid var(--border-color)", height: 24, margin: "0 8px", display: "none" }} className="md-divider" />
        
        <a href="/sample_auth.log" download className="btn btn-primary" title="Download a sample log to test the system">
          <FileText size={16} /> Download Sample Log
        </a>

        <div style={{ 
          display: "flex", alignItems: "center", gap: 6, fontSize: 12, 
          color: "var(--success)", background: "rgba(0, 255, 102, 0.08)", 
          padding: "6px 12px", borderRadius: 4, border: "1px solid rgba(0, 255, 102, 0.2)" 
        }}>
          <CheckCircle size={14} /> Safe, synthetic data strictly for demo purposes
        </div>
      </div>


    </div>
  );
}
