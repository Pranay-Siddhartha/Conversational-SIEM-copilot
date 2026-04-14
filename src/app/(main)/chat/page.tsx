"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { sendChat } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Show suspicious IPs",
  "Any brute-force attempts?",
  "Who had the most failed logins?",
  "Summarize admin activity",
  "Show me privilege escalation events",
  "What happened between 1 AM and 2 AM?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const data = await sendChat(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "No response from AI." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error connecting to investigation service. Please try again later." },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="page-header">
        <h1>💬 Threat Investigation Chat</h1>
        <p>Ask questions about your security logs in plain English</p>
      </div>

      {messages.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Sparkles size={48} style={{ color: "var(--accent-primary)", margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Start your investigation</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
            Ask me anything about your uploaded security logs
          </p>
          <div className="suggestion-chips" style={{ justifyContent: "center" }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => handleSend(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, opacity: 0.7, fontSize: 11 }}>
              {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              {msg.role === "user" ? "You" : "SIEM Copilot"}
            </div>
            {msg.role === "assistant" ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="spinner" />
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Analyzing logs...</span>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          placeholder="Ask about your security logs..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
