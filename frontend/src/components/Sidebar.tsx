"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Clock,
  FileText,
  Upload,
  Shield,
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
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={16} style={{ color: "var(--success)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            System Active
          </span>
        </div>
      </div>
    </aside>
  );
}
