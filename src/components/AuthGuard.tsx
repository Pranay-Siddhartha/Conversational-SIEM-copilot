"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("siem_username");
    if (!user) {
      router.push("/login");
    } else {
      setMounted(true);
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="loading-overlay" style={{ height: "100vh" }}>
        <div className="spinner" />
        <p>Connecting to secure network...</p>
      </div>
    );
  }

  return <>{children}</>;
}
