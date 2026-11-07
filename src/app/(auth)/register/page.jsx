"use client";

// ============================================================================
// SECTION: REGISTER PAGE — CLEAN 2-COLUMN SPLIT
// ============================================================================
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowLeft, GraduationCap, Building2, CheckCircle2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { redirectByRole } from "@/lib/redirectByRole";
import { ApiError } from "@/lib/api";
import { AuthShowcaseCard } from "@/components/auth/AuthShowcaseCard";
import { AuthSocialButtons } from "@/components/auth/AuthSocialButtons";

// Shared input class helper
const inputCls = (hasError) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] bg-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:ring-offset-1 ${
    hasError
      ? "border-red-400 bg-red-50/30"
      : "border-[var(--color-border-strong)] hover:border-[var(--color-ink)]/30"
  }`;

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role")?.toUpperCase() === "EMPLOYER" ? "EMPLOYER" : "STUDENT";

  const { register, status, role, isAuthenticated } = useAuth();

  const [activeRole, setActiveRole] = useState(initialRole);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [wake, setWake] = useState(false);
  const [employerDone, setEmployerDone] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!isAuthenticated) return;
    router.replace(redirectByRole(role));
  }, [status, isAuthenticated, role, router]);

  const validate = () => {
    const errs = {};
    if (activeRole === "STUDENT") {
      if (!firstName.trim()) errs.firstName = "First name is required";
      if (!lastName.trim()) errs.lastName = "Last name is required";
    } else {
      if (!orgName.trim() || orgName.trim().length < 2) {
        errs.orgName = "Organization or contact name must be at least 2 characters";
      }
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!password || password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    } else if (password.length > 72) {
      errs.password = "Password cannot exceed 72 characters";
    }

    if (!agreedToTerms) {
      errs.terms = "You must accept the Terms & Conditions to create an account";
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const v = validate();
    if (Object.keys(v).length > 0) {
      setFieldErrors(v);
      return;
    }

    setLoading(true);
    const wakeTimer = setTimeout(() => setWake(true), 4000);

    const displayName =
      activeRole === "STUDENT"
        ? `${firstName.trim()} ${lastName.trim()}`
        : orgName.trim();

    try {
      await register(displayName, email.trim().toLowerCase(), password, activeRole);
      clearTimeout(wakeTimer);
      setWake(false);

      if (activeRole === "EMPLOYER") {
        setEmployerDone(true);
      } else {
        router.replace(redirectByRole("STUDENT"));
      }
    } catch (err) {
      clearTimeout(wakeTimer);
      setWake(false);
      if (err instanceof ApiError) {
        setError(err.message);
        const fe = { ...(err.fieldErrors || {}) };
        if (err.status === 409 || err.message.toLowerCase().includes("email")) {
          fe.email = fe.email || "Email is already registered. Please sign in.";
        }
        setFieldErrors(fe);
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-muted)]" />
      </div>
    );
  }

  // Employer verification pending state
  if (employerDone) {
    return (
      <div className="min-h-screen w-full bg-white grid lg:grid-cols-2">
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-10 md:px-16 xl:px-20">
          <div className="w-full max-w-sm mx-auto">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border-strong)] bg-white text-[var(--color-ink)] mb-5">
                <CheckCircle2 size={22} />
              </div>
              <h1 className="text-xl font-bold text-[var(--color-ink)] font-[family-name:var(--font-poppins)]">
                Employer account created
              </h1>
              <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">
                Your employer profile has been submitted and is pending campus verification. An admin will review your department or business before job postings go live.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => router.push("/employer")}
                  className="flex-1 rounded-lg bg-[var(--color-ink)] py-2.5 text-center text-sm font-semibold text-white hover:bg-[var(--color-ink-2)] transition-colors font-[family-name:var(--font-poppins)]"
                >
                  Go to dashboard
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 rounded-lg border border-[var(--color-border-strong)] bg-white py-2.5 text-center text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  Return home
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden lg:block h-full min-h-screen w-full">
          <AuthShowcaseCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white grid lg:grid-cols-2">
      {/* ================================================================ */}
      {/* COLUMN 1: FORM */}
      {/* ================================================================ */}
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-10 md:px-16 xl:px-20">
        <div className="w-full max-w-sm mx-auto">

          {/* Mobile back */}
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-7">
            <div className="mb-1.5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-ink)] text-white text-[9px] font-bold tracking-tight font-[family-name:var(--font-poppins)]">
                OAU
              </div>
              <span className="text-sm font-semibold text-[var(--color-ink)] font-[family-name:var(--font-poppins)]">Campus Jobs</span>
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-[var(--color-ink)] font-[family-name:var(--font-poppins)]">
              Create an account
            </h1>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[var(--color-ink)] underline underline-offset-4 hover:opacity-70 transition-opacity"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Role switcher */}
          <div className="mb-5 flex rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-1">
            <button
              type="button"
              id="role-student-btn"
              onClick={() => setActiveRole("STUDENT")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[12px] font-semibold transition-all duration-150 ${
                activeRole === "STUDENT"
                  ? "bg-white text-[var(--color-ink)] shadow-[var(--shadow-xs)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <GraduationCap size={14} />
              <span>Student</span>
            </button>
            <button
              type="button"
              id="role-employer-btn"
              onClick={() => setActiveRole("EMPLOYER")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[12px] font-semibold transition-all duration-150 ${
                activeRole === "EMPLOYER"
                  ? "bg-white text-[var(--color-ink)] shadow-[var(--shadow-xs)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Building2 size={14} />
              <span>Campus Employer</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name fields */}
            {activeRole === "STUDENT" ? (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="reg-firstName" className="block text-[12px] font-medium text-[var(--color-ink)] mb-1.5">
                    First name
                  </label>
                  <input
                    id="reg-firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Chidi"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputCls(fieldErrors.firstName)}
                  />
                  {fieldErrors.firstName && (
                    <p className="mt-1 text-[11px] text-red-500">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="reg-lastName" className="block text-[12px] font-medium text-[var(--color-ink)] mb-1.5">
                    Last name
                  </label>
                  <input
                    id="reg-lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Okeke"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputCls(fieldErrors.lastName)}
                  />
                  {fieldErrors.lastName && (
                    <p className="mt-1 text-[11px] text-red-500">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="reg-orgName" className="block text-[12px] font-medium text-[var(--color-ink)] mb-1.5">
                  Organization / Contact name
                </label>
                <input
                  id="reg-orgName"
                  type="text"
                  placeholder="Dept. of Computer Science"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className={inputCls(fieldErrors.orgName)}
                />
                {fieldErrors.orgName && (
                  <p className="mt-1 text-[11px] text-red-500">{fieldErrors.orgName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-[12px] font-medium text-[var(--color-ink)] mb-1.5">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder={activeRole === "STUDENT" ? "you@oauife.edu.ng" : "dept@oauife.edu.ng"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls(fieldErrors.email)}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-[12px] font-medium text-[var(--color-ink)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls(fieldErrors.password) + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] hover:text-[var(--color-ink)] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-[var(--color-border-strong)] accent-[var(--color-ink)]"
                />
                <span className="text-[12px] text-[var(--color-muted)] leading-normal">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="font-semibold text-[var(--color-ink)] underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    Terms & Conditions
                  </button>
                </span>
              </label>
              {fieldErrors.terms && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.terms}</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
                {error}
              </div>
            )}

            {/* Wake notice */}
            {wake && (
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-[12px] text-[var(--color-muted)]">
                Waking up the server — this may take up to a minute.
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="register-submit-btn"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-ink)] py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--color-ink-2)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-poppins)]"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </button>
          </form>

          {/* Social divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[11px] text-[var(--color-subtle)]">or register with</span>
            </div>
          </div>

          <AuthSocialButtons mode="register" />
        </div>
      </div>

      {/* ================================================================ */}
      {/* COLUMN 2: SHOWCASE IMAGE */}
      {/* ================================================================ */}
      <div className="relative hidden lg:block h-full min-h-screen w-full">
        <AuthShowcaseCard />
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--color-ink)] font-[family-name:var(--font-poppins)]">
                Terms & Conditions
              </h3>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 max-h-64 overflow-y-auto space-y-3 pr-1 text-[12px] text-[var(--color-muted)] leading-relaxed custom-scrollbar">
              <p>
                <strong className="text-[var(--color-ink)]">1. Eligibility:</strong> Students must be currently enrolled at Obafemi Awolowo University, Ile-Ife. Campus employers must represent verified academic departments, faculty units, or approved campus enterprises.
              </p>
              <p>
                <strong className="text-[var(--color-ink)]">2. Fair Compensation:</strong> All campus roles posted must honor established university wage agreements, provide respectful working conditions, and not interfere with academic schedules.
              </p>
              <p>
                <strong className="text-[var(--color-ink)]">3. Privacy & Data:</strong> Personal information is handled securely and used exclusively to facilitate campus job placement and university administration.
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                }}
                className="rounded-lg bg-[var(--color-ink)] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[var(--color-ink-2)] transition-colors font-[family-name:var(--font-poppins)]"
              >
                I understand & agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-muted)]" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
