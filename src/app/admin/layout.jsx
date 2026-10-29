"use client";

// ============================================================================
// SECTION: ADMIN LAYOUT (WRAPPED CANVAS WITH ROUNDED CORNERS)
// ============================================================================
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingState } from "@/components/states/LoadingState";

export default function AdminLayout({ children }) {
  const { status, role, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role && role !== "ADMIN") {
      if (role === "STUDENT") router.replace("/student/jobs");
      else if (role === "EMPLOYER") router.replace("/employer");
      else router.replace("/");
    }
  }, [status, isAuthenticated, role, router]);

  if (status === "loading") {
    return <LoadingState message="Checking access..." />;
  }

  if (!isAuthenticated || role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-2)] flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      {/* Collapsible Sidebar */}
      <Sidebar role="ADMIN" />

      {/* Wrapped Canvas around the page with rounded corners */}
      <div className="flex-1 flex flex-col min-w-0 lg:my-2.5 lg:mr-2.5 lg:rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden transition-all duration-300">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
