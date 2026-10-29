"use client";

// ============================================================================
// SECTION: REGISTER PAGE (TRUE 2-COLUMN FULL-BLEED: FORM LEFT, IMAGE RIGHT)
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
      <div className="min-h-screen bg-[#110f1a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  // Employer verification pending state
  if (employerDone) {
    return (
      <div className="min-h-screen w-full bg-[#110f1a] text-slate-100 grid lg:grid-cols-2">
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12 md:px-16 xl:px-24">
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-2xl border border-purple-500/30 bg-[#19152b] p-8 shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 mb-5">
                <CheckCircle2 size={28} />
              </div>
              <h1 className="text-2xl font-bold text-white">Employer Account Created</h1>
              <p className="mt-3 text-sm text-[#9f97bf] leading-relaxed">
                Your employer profile has been submitted and is currently pending campus verification. An admin will verify your department or business before job postings go live.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/employer")}
                  className="flex-1 rounded-xl bg-[#7048e8] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#6238df] transition-colors"
                >
                  Go to dashboard
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 rounded-xl border border-[#352e4d] bg-[#1d1830] py-2.5 text-center text-sm font-medium text-slate-300 hover:bg-[#25203d] hover:text-white transition-colors"
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
    <div className="min-h-screen w-full bg-[#110f1a] text-slate-100 grid lg:grid-cols-2">
      {/* ==================================================================== */}
      {/* COLUMN 1: FORM (LEFT) */}
      {/* ==================================================================== */}
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12 md:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Back Link */}
          <div className="mb-6 lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-purple-200/70 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to website</span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-[#8c84a8]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>

          {/* Role Segmented Switcher */}
          <div className="mb-5 flex rounded-xl border border-[#2e2844] bg-[#161224] p-1">
            <button
              type="button"
              onClick={() => setActiveRole("STUDENT")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all duration-200 ${
                activeRole === "STUDENT"
                  ? "bg-[#7048e8] text-white shadow-md"
                  : "text-[#877fa6] hover:text-white"
              }`}
            >
              <GraduationCap size={15} />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRole("EMPLOYER")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all duration-200 ${
                activeRole === "EMPLOYER"
                  ? "bg-[#7048e8] text-white shadow-md"
                  : "text-[#877fa6] hover:text-white"
              }`}
            >
              <Building2 size={15} />
              <span>Campus Employer</span>
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Student Name: First & Last Name side by side */}
            {activeRole === "STUDENT" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="sr-only">
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full rounded-xl border ${
                      fieldErrors.firstName ? "border-red-500/80" : "border-[#2e2844]"
                    } bg-[#1a162b] px-4 py-3 text-sm text-white placeholder-[#6f688e] transition-all duration-200 focus:border-[#7048e8] focus:bg-[#201b36] focus:outline-none focus:ring-1 focus:ring-[#7048e8]`}
                  />
                  {fieldErrors.firstName && (
                    <p className="mt-1 text-[11px] text-red-400">{fieldErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="sr-only">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full rounded-xl border ${
                      fieldErrors.lastName ? "border-red-500/80" : "border-[#2e2844]"
                    } bg-[#1a162b] px-4 py-3 text-sm text-white placeholder-[#6f688e] transition-all duration-200 focus:border-[#7048e8] focus:bg-[#201b36] focus:outline-none focus:ring-1 focus:ring-[#7048e8]`}
                  />
                  {fieldErrors.lastName && (
                    <p className="mt-1 text-[11px] text-red-400">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="orgName" className="sr-only">
                  Organization / Contact name
                </label>
                <input
                  id="orgName"
                  type="text"
                  placeholder="Organization or Contact name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className={`w-full rounded-xl border ${
                    fieldErrors.orgName ? "border-red-500/80" : "border-[#2e2844]"
                  } bg-[#1a162b] px-4 py-3 text-sm text-white placeholder-[#6f688e] transition-all duration-200 focus:border-[#7048e8] focus:bg-[#201b36] focus:outline-none focus:ring-1 focus:ring-[#7048e8]`}
                />
                {fieldErrors.orgName && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.orgName}</p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={activeRole === "STUDENT" ? "Email (e.g. name@student.oauife.edu.ng)" : "Official contact email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl border ${
                  fieldErrors.email ? "border-red-500/80" : "border-[#2e2844]"
                } bg-[#1a162b] px-4 py-3 text-sm text-white placeholder-[#6f688e] transition-all duration-200 focus:border-[#7048e8] focus:bg-[#201b36] focus:outline-none focus:ring-1 focus:ring-[#7048e8]`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl border ${
                    fieldErrors.password ? "border-red-500/80" : "border-[#2e2844]"
                  } bg-[#1a162b] px-4 py-3 pr-11 text-sm text-white placeholder-[#6f688e] transition-all duration-200 focus:border-[#7048e8] focus:bg-[#201b36] focus:outline-none focus:ring-1 focus:ring-[#7048e8]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#787196] hover:text-purple-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#383154] bg-[#1a162b] text-[#7048e8] focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-[#110f1a] accent-[#7048e8]"
                />
                <span className="text-xs text-[#9d95ba] leading-normal">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors inline-block"
                  >
                    Terms &amp; Conditions
                  </button>
                </span>
              </label>
              {fieldErrors.terms && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.terms}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* Wake Up Notice */}
            {wake && (
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-200">
                Waking up the server, this can take up to a minute...
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#7048e8] py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(112,72,232,0.4)] transition-all duration-200 hover:bg-[#6238df] hover:shadow-[0_6px_28px_rgba(112,72,232,0.55)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#26203a]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#110f1a] px-3 text-[#787196]">Or register with</span>
            </div>
          </div>

          {/* Social Logins */}
          <AuthSocialButtons mode="register" />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* COLUMN 2: FILLED IMAGE SHOWCASE (RIGHT - FULL BLEED) */}
      {/* ==================================================================== */}
      <div className="relative hidden lg:block h-full min-h-screen w-full">
        <AuthShowcaseCard />
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#352d50] bg-[#181427] p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2b2444] pb-3">
              <h3 className="text-base font-bold text-white">Terms &amp; Conditions</h3>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="rounded-lg p-1 text-[#877fa6] hover:bg-[#251f38] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 max-h-72 overflow-y-auto space-y-3 pr-2 text-xs text-[#a29bbb] leading-relaxed">
              <p>
                <strong>1. Eligibility:</strong> Students must be currently enrolled at Obafemi Awolowo University, Ile-Ife. Campus employers must represent verified academic departments, faculty units, or approved campus enterprises.
              </p>
              <p>
                <strong>2. Fair Compensation:</strong> All campus roles posted must honor established university wage agreements, provide respectful working conditions, and not interfere with academic schedules.
              </p>
              <p>
                <strong>3. Privacy &amp; Data:</strong> Personal information is handled securely and used exclusively to facilitate campus job placement and university administration.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                }}
                className="rounded-xl bg-[#7048e8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6238df]"
              >
                I Understand &amp; Agree
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
        <div className="min-h-screen bg-[#110f1a] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
