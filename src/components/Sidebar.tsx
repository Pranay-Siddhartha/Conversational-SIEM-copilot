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
        <h1>
          <Shield className="text-[var(--accent-primary)]" size={24} />
          SIEM Copilot
        </h1>
        <p>AI Security Operations Center</p>
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
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[var(--border-color)] mt-auto bg-[rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Shield size={16} className="text-[var(--success)]" />
            <div className="absolute inset-0 bg-[var(--success)] opacity-20 blur-sm rounded-full animate-pulse" />
          </div>
          <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            System Active
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Analyst</span>
            <span className="text-sm text-[var(--text-primary)] font-semibold tracking-tight">
              {username}
            </span>
          </div>
          
          <button
            onClick={() => {
              localStorage.removeItem("siem_username");
              router.push("/login");
            }}
            className="p-2.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[rgba(239,68,68,0.1)] transition-all duration-200"
            title="Terminate Session"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
