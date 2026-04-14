import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </AuthGuard>
  );
}
