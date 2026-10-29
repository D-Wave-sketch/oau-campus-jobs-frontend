"use client";

// ============================================================================
// SECTION: EMPLOYER LAYOUT (WRAPPED CANVAS WITH ROUNDED CORNERS)
// ============================================================================
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingState } from "@/components/states/LoadingState";
import { AlertCircle } from "lucide-react";

export default function EmployerLayout({ children }) {
  const { status, role, isAuthenticated, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role && role !== "EMPLOYER") {
      if (role === "STUDENT") router.replace("/student/jobs");
      else if (role === "ADMIN") router.replace("/admin/users");
      else router.replace("/");
    }
  }, [status, isAuthenticated, role, router]);

  if (status === "loading") {
    return <LoadingState message="Checking access…" />;
  }

  if (!isAuthenticated || role !== "EMPLOYER") {
    return null;
  }

  const p = profile?.data || profile;
  const verificationStatus = p?.verificationStatus;
  const isVerified = verificationStatus === "VERIFIED";

  return (
    <div className="min-h-screen bg-[var(--color-surface-2)] flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      {/* Collapsible Sidebar */}
      <Sidebar role="EMPLOYER" />

      {/* Wrapped Canvas around the page with rounded corners */}
      <div className="flex-1 flex flex-col min-w-0 lg:my-2.5 lg:mr-2.5 lg:rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden transition-all duration-300">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 pb-6">
          {!isVerified && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/90 px-3.5 py-2.5 text-sm text-amber-800 shadow-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">Verification pending</div>
                <div className="text-xs text-amber-700">
                  Your employer account is {verificationStatus || "PENDING"}. An admin must approve your department or business before job listings go live.
                </div>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
