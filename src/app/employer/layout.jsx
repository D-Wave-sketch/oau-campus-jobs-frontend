"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/states/LoadingState";

export default function EmployerLayout({ children }) {
  const { status, role, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role && role !== "EMPLOYER" && role !== "ADMIN") {
      router.replace("/student/jobs");
    }
  }, [status, isAuthenticated, role, router]);

  if (status === "loading") {
    return <LoadingState message="Checking employer access..." />;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[var(--color-surface-2)] flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 lg:my-2.5 lg:mr-2.5 lg:rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden transition-all duration-300">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav role={role} />
    </div>
  );
}