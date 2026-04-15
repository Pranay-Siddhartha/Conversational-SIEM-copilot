"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { sendChat } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-[1000px] mx-auto h-full flex flex-col"
    >
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-4">
            <Bot className="text-[var(--accent-primary)]" size={32} />
            Investigation Copilot
        </h1>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl">Query telemetry and synthesize threat intelligence in natural language.</p>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-[32px] overflow-hidden backdrop-blur-sm">
        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-8">
                  <Sparkles size={80} className="text-[var(--accent-primary)] opacity-20" />
                  <Bot size={40} className="text-[var(--accent-primary)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Initiate Tactical Inquiry</h3>
              <p className="text-[var(--text-muted)] text-lg mb-12 max-w-md">
                Interrogate security logs to uncover latent threats or performance anomalies.
              </p>
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                {SUGGESTIONS.map((s) => (
                  <button 
                    key={s} 
                    className="chip px-5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl hover:border-[var(--accent-primary)] hover:bg-[rgba(0,243,255,0.05)] transition-all text-sm font-medium"
                    onClick={() => handleSend(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white p-6 rounded-2xl rounded-tr-none shadow-lg' : 'bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-3xl rounded-tl-none'}`}>
                <div className="flex items-center gap-3 mb-4 opacity-70">
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {msg.role === "user" ? "Lead Analyst" : "SIEM Intelligence"}
                  </span>
                </div>
                <div className={`text-base leading-relaxed ${msg.role === 'assistant' ? 'prose prose-invert prose-sm max-w-none text-[var(--text-secondary)]' : 'font-medium'}`}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl rounded-tl-none flex items-center gap-4">
                <div className="spinner" />
                <span className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest animate-pulse">
                  Synthesizing Logs...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        <div className="p-8 border-t border-[var(--border-color)] bg-[rgba(0,0,0,0.2)]">
          <div className="relative flex items-center gap-4 max-w-4xl mx-auto">
            <input
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl py-4 px-6 text-base text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-muted)]"
              placeholder="Ask about your security logs (e.g., 'Summarize admin events from last night')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <button
              className="absolute right-2 p-3 bg-[var(--accent-primary)] text-black rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              <Send size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="mt-4 flex justify-center gap-6 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest opacity-50">
            <span>Powered by Groq-70B</span>
            <span>Real-time Telemetry Context</span>
            <span>Encrypted Response Loop</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
