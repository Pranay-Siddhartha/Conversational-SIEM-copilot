"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Terminal } from "lucide-react";
import RotatingText from "@/components/RotatingText";
import TextType from "@/components/TextType";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Strict Superuser enforcement for public demo
    if (username === "admin" && password === "root123") {
      localStorage.setItem("siem_username", "admin");
      router.push("/");
    } else {
      setError("Invalid credentials. Please use the public demo access credentials.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      color: "var(--text-primary)",
      overflowX: "hidden",
    }}>
      {/* ─── Top Navigation Bar ─── */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(5, 7, 10, 0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Shield size={24} style={{ color: "var(--accent-primary)" }} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "1px" }}>SIEM Copilot</span>
        </div>

        <div style={{ display: "flex", gap: 24, fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>
          <a href="/features" style={{ cursor: "pointer", color: "var(--text-muted)", textDecoration: "none" }}>Features</a>
          <a href="/architecture" style={{ cursor: "pointer", color: "var(--text-muted)", textDecoration: "none" }}>Architecture</a>
          <a href="/docs" style={{ cursor: "pointer", color: "var(--text-muted)", textDecoration: "none" }}>Documentation</a>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <main style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 32px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: 64,
          maxWidth: 1100,
          width: "100%",
          alignItems: "center",
        }}>

          {/* ── Left: Hero copy ── */}
          <div>
            <div style={{ marginBottom: 16, minHeight: 70 }}>
              <TextType
                texts={["Your SOC, Reinvented.", "AI-Powered Threat Intel.", "Defend Smarter."]}
                typingSpeed={75}
                deletingSpeed={50}
                pauseDuration={1500}
                showCursor
                cursorCharacter="_"
                cursorBlinkDuration={0.5}
                style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, color: "var(--text-primary)", whiteSpace: "nowrap" }}
              />
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 32, height: 40,
            }}>
              <span style={{
                color: "var(--text-muted)", fontSize: 14,
                textTransform: "uppercase", letterSpacing: "2px",
              }}>
                Built For
              </span>
              <RotatingText
                texts={["Modern SOCs", "Threat Hunters", "Log Analysis", "Rapid Response"]}
                style={{
                  padding: "6px 14px",
                  background: "linear-gradient(135deg, rgba(0,243,255,0.12), rgba(123,97,255,0.12))",
                  color: "var(--accent-primary)",
                  borderRadius: 4,
                  border: "1px solid rgba(0,243,255,0.2)",
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "1px",
                }}
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2500}
              />
            </div>

            <p style={{
              fontSize: 16, color: "var(--text-secondary)",
              lineHeight: 1.7, maxWidth: 480, marginBottom: 40,
            }}>
              Investigate incidents faster with AI-augmented analysis. Upload
              network logs, parse indicators of compromise, and generate
              defense strategies in real time.
            </p>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              color: "var(--success)",
              background: "rgba(0,255,102,0.08)", padding: "10px 16px",
              borderRadius: 4, border: "1px solid rgba(0,255,102,0.2)",
              fontSize: 12, fontWeight: 600, letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}>
              <span style={{
                width: 8, height: 8, background: "var(--success)",
                borderRadius: "50%", display: "inline-block",
                boxShadow: "0 0 8px var(--success)",
              }} />
              System Online
            </div>
          </div>

          {/* ── Right: Login terminal ── */}
          <div style={{
            padding: 40,
            background: "rgba(10, 12, 18, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0,243,255,0.12)",
            borderRadius: 4,
            boxShadow: "0 0 60px rgba(0, 243, 255, 0.04)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: "-40%", right: "-40%",
              width: "180%", height: "180%",
              background: "radial-gradient(circle, rgba(0,243,255,0.03) 0%, transparent 60%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <Terminal size={40} style={{ color: "var(--accent-primary)" }} />
              </div>

              <h2 style={{
                fontSize: 22, textAlign: "center", marginBottom: 6,
                color: "var(--text-primary)", letterSpacing: "1px",
              }}>
                Secure Access
              </h2>
              <p style={{
                color: "var(--text-muted)", textAlign: "center",
                fontSize: 12, marginBottom: 16,
                textTransform: "uppercase", letterSpacing: "1.5px",
              }}>
                Initialize Analyst Session
              </p>

              {/* Public Demo Notice */}
              <div style={{
                background: "rgba(0, 243, 255, 0.08)",
                border: "1px solid rgba(0, 243, 255, 0.2)",
                borderRadius: 4,
                padding: "12px",
                marginBottom: 24,
                textAlign: "center",
                fontSize: 13,
                color: "var(--text-primary)"
              }}>
                <span style={{ color: "var(--accent-primary)", display: "block", marginBottom: 4, fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Public Demo Access</span>
                <strong>ID:</strong> admin &nbsp;|&nbsp; <strong>Password:</strong> root123
              </div>

              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{
                    display: "block", fontSize: 11,
                    color: "var(--text-secondary)", marginBottom: 8,
                    textTransform: "uppercase", letterSpacing: "1.5px",
                  }}>
                    Analyst ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe / Neo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                    style={{
                      width: "100%",
                      fontSize: 14,
                      padding: "12px 14px",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid var(--border-color)",
                      borderRadius: 4,
                      color: "var(--text-primary)",
                      letterSpacing: "1px",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: "block", fontSize: 11,
                    color: "var(--text-secondary)", marginBottom: 8,
                    textTransform: "uppercase", letterSpacing: "1.5px",
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      fontSize: 14,
                      padding: "12px 14px",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid var(--border-color)",
                      borderRadius: 4,
                      color: "var(--text-primary)",
                      letterSpacing: "1px",
                      outline: "none",
                    }}
                  />
                </div>
                {error && (
                  <div style={{ color: "var(--danger)", fontSize: 12, textAlign: "center" }}>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    display: "flex", justifyContent: "center",
                    padding: "14px 20px", marginTop: 8,
                  }}
                >
                  INITIALIZE TERMINAL
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
