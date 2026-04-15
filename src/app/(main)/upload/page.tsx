"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle, AlertCircle, FileText, Database, ArrowRight, Activity } from "lucide-react";
import { uploadLog, clearLogs } from "@/lib/api";
import { AlertBanner } from "@/components/AlertBanner";

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
          : "System encountered an error during telemetry ingestion."
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
    if (!confirm("This will permanently purge all telemetry records from Supabase. Proceed?")) return;
    try {
      await clearLogs();
      setResult(null);
      setError("");
      alert("Telemetry storage purged successfully.");
    } catch {
      setError("Critical failure while attempting to purge logs.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-[1200px] mx-auto"
    >
      <div className="mb-12">
        <h1 className="text-4xl font-bold flex items-center gap-4 text-[var(--text-primary)] mb-2">
            <Database className="text-[var(--accent-primary)]" size={32} />
            Telemetry Ingestion
        </h1>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl">Deploy raw security logs to the AI-augmented SOC environment for real-time analysis.</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-8">
            <AlertBanner type="error" message={error} onClose={() => setError("")} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Zone */}
      <motion.div
        whileHover={{ scale: 1.002 }}
        whileTap={{ scale: 0.998 }}
        className={`upload-zone relative overflow-hidden bg-[rgba(0,243,255,0.02)] border-2 border-dashed ${dragover ? "dragover border-[var(--accent-primary)] bg-[rgba(0,243,255,0.05)]" : "border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:bg-[rgba(0,243,255,0.04)]"}`}
        style={{ borderRadius: '24px', padding: '64px' }}
        onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
        onDragLeave={() => setDragover(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[rgba(255,255,255,0.05)]">
            {uploading && (
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-[0_0_15px_var(--accent-primary)]"
                />
            )}
        </div>

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
          <div className="py-12">
            <div className="relative inline-block mb-6">
                <Activity className="animate-spin text-[var(--accent-primary)]" size={64} />
                <div className="absolute inset-0 bg-[var(--accent-primary)] opacity-20 blur-xl animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Synchronizing SOC Data...</h3>
            <p className="text-[var(--text-muted)] text-lg">Parsing headers, normalizing timestamps, and indexing records.</p>
          </div>
        ) : (
          <div className="py-12">
            <div className="p-6 bg-[rgba(0,243,255,0.03)] rounded-full inline-block mb-8 border border-[rgba(0,243,255,0.1)]">
                <Upload size={64} className="text-[var(--accent-primary)] opacity-90" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Transmit Telemetry Package</h3>
            <p className="text-[var(--text-muted)] text-lg mb-10 max-w-md mx-auto">Drop log bundle here or click to authenticate file selection via secure gateway.</p>
            <div className="flex justify-center gap-4">
              {['LOG', 'CSV', 'JSON'].map(ext => (
                <span key={ext} className="px-5 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-lg text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
                   {ext}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Success Result */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mt-16 border-[var(--success)] shadow-[0_20px_60px_rgba(16,185,129,0.05)] p-10"
          >
            <div className="flex items-center gap-6 mb-12">
              <div className="p-4 bg-[rgba(16,185,129,0.1)] rounded-2xl border border-[rgba(16,185,129,0.2)]">
                <CheckCircle size={32} className="text-[var(--success)]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[var(--success)]">Deployment Successful</h3>
                <p className="text-sm text-[var(--text-muted)] uppercase tracking-widest font-semibold mt-1">Telemetry Indexing Verified</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="stat-card bg-[rgba(0,243,255,0.02)] border-[rgba(0,243,255,0.08)]">
                <div className="stat-value text-4xl">{result.events_count?.toLocaleString()}</div>
                <div className="stat-label">Events Indexed</div>
              </div>
              <div className="stat-card bg-[rgba(139,92,246,0.02)] border-[rgba(139,92,246,0.08)]">
                <div className="stat-value text-2xl uppercase truncate text-[var(--accent-secondary)]">{result.log_source}</div>
                <div className="stat-label">Schema Detected</div>
              </div>
              <div className="stat-card bg-[rgba(245,158,11,0.02)] border-[rgba(245,158,11,0.08)] flex items-center gap-4">
                <Activity size={24} className="text-[var(--warning)] shrink-0" />
                <span className="text-sm font-semibold opacity-90">{result.message}</span>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-5 pt-10 border-t border-[var(--border-color)]">
              <a href="/" className="btn btn-primary px-8 py-3.5 text-base">
                SOC Dashboard <ArrowRight size={18} className="ml-1" />
              </a>
              <a href="/chat" className="btn btn-outline px-8 py-3.5 text-base">Investigate Alerts</a>
              <a href="/timeline" className="btn btn-outline px-8 py-3.5 text-base">Event Timeline</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auxiliary Actions */}
      <div className="mt-16 flex flex-wrap gap-8 items-center bg-[rgba(255,255,255,0.01)] p-8 rounded-[24px] border border-[var(--border-color)]">
        <button className="btn btn-danger px-8 py-3" onClick={handleClear}>
          Purge Telemetry Storage
        </button>
        
        <div className="h-8 w-px bg-[var(--border-color)] hidden md:block opacity-50" />
        
        <a href="/sample_auth.log" download className="text-sm flex items-center gap-2 text-[var(--accent-secondary)] hover:text-white transition-all hover:translate-x-1">
          <FileText size={18} /> Download Enterprise Sample Deck
        </a>

        <div className="ml-auto flex items-center gap-3 text-[10px] text-[var(--success)] font-bold tracking-[0.2em] bg-[rgba(16,185,129,0.05)] px-5 py-2.5 rounded-full border border-[rgba(16,185,129,0.2)] uppercase">
          <Activity size={14} className="animate-pulse" /> Live Ingestion Active
        </div>
      </div>
    </motion.div>
  );
}
