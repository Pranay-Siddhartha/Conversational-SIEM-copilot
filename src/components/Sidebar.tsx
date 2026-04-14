"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Clock,
  FileText,
  Upload,
  Shield,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Investigation Chat", icon: MessageSquare },
  { href: "/timeline", label: "Attack Timeline", icon: Clock },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/upload", label: "Upload Logs", icon: Upload },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string>("Analyst");

  useEffect(() => {
    const user = localStorage.getItem("siem_username");
    if (user) setUsername(user);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>🛡️ SIEM Copilot</h1>
        <p>AI Security Operations</p>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-color)", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Shield size={16} style={{ color: "var(--success)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            System Active
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, color: "var(--accent-primary)", fontWeight: 500, letterSpacing: "0.5px" }}>
            Hello, {username}
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("siem_username");
              router.push("/login");
            }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", padding: 4, display: "flex",
              alignItems: "center", borderRadius: 4,
            }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
