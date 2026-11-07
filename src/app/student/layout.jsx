"use client";

// ============================================================================
// SECTION: STUDENT LAYOUT (WRAPPED CANVAS WITH ROUNDED CORNERS)
// ============================================================================
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingState } from "@/components/states/LoadingState";

export default function StudentLayout({ children }) {
  const { status, role, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isJobsPage = pathname === "/student/jobs";
  const isJobDetailPage =
    pathname.startsWith("/student/jobs/") && pathname !== "/student/jobs";

  useEffect(() => {
    if (status === "loading") return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role && role !== "STUDENT") {
      if (role === "EMPLOYER") router.replace("/employer");
      else if (role === "ADMIN") router.replace("/admin");
      else router.replace("/");
    }
  }, [status, isAuthenticated, role, router]);

  if (status === "loading") {
    return <LoadingState message="Checking access..." />;
  }

  if (!isAuthenticated || role !== "STUDENT") {
    return null;
  }

  return (
    <div
      className={`${isJobsPage ? "h-dvh overflow-hidden" : "min-h-screen lg:h-screen lg:overflow-hidden"} bg-[var(--color-surface-2)] flex flex-col lg:flex-row`}
    >
      {/* Collapsible Sidebar */}
      <Sidebar role="STUDENT" />

      {/* Wrapped Canvas around the page */}
      <div
        className={`flex-1 flex flex-col min-w-0 border-0 lg:border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition-all duration-300 ${
          isJobsPage
            ? "min-h-0 lg:my-2.5 lg:mr-2.5 lg:rounded-[4px]"
            : "lg:my-2.5 lg:mr-2.5 lg:rounded-3xl lg:shadow-sm"
        }`}
      >
        <Navbar />
        <main
          className={
            isJobsPage
              ? "flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-4 pb-18 sm:px-6 lg:pb-0"
              : isJobDetailPage
                ? "flex-1 overflow-y-auto p-0 pb-20 sm:px-6 sm:py-6 sm:pb-8"
                : "flex-1 overflow-y-auto px-4 py-6 pb-18 sm:px-6 lg:pb-8"
          }
        >
          {children}
        </main>
      </div>

      <BottomNav role="STUDENT" />
    </div>
  );
}
