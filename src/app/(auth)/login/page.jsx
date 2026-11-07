"use client";

// ============================================================================
// SECTION: LOGIN PAGE — CLEAN 2-COLUMN SPLIT
// ============================================================================
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { redirectByRole } from "@/lib/redirectByRole";
import { ApiError } from "@/lib/api";
import { AuthShowcaseCard } from "@/components/auth/AuthShowcaseCard";
import { AuthSocialButtons } from "@/components/auth/AuthSocialButtons";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, status, role, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [wake, setWake] = useState(false);

  const reason = params.get("reason");
  const next = params.get("next");

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!isAuthenticated) return;
    router.replace(redirectByRole(role));
  }, [status, isAuthenticated, role, router]);

  const isSafeNext = (n) => {
    if (!n) return false;
    try {
      const url = new URL(n, typeof window !== "undefined" ? window.location.origin : "http://localhost");
      if (typeof window !== "undefined" && url.origin !== window.location.origin) return false;
      return url.pathname.startsWith("/");
    } catch {
      return n.startsWith("/") && !n.startsWith("//");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!email.trim()) {
      setFieldErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }

    setLoading(true);
    const wakeTimer = setTimeout(() => setWake(true), 4000);
    try {
      await login(email.trim().toLowerCase(), password);
      clearTimeout(wakeTimer);
      setWake(false);
      if (isSafeNext(next)) {
        router.replace(next);
        return;
      }
      router.replace(redirectByRole(role) === "/" ? "/student/jobs" : redirectByRole(role));
    } catch (err) {
      clearTimeout(wakeTimer);
      setWake(false);
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors || {});
      } else {
        setError(err.message || "Invalid credentials. Please try again.");
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

  return (
    <div className="min-h-screen w-full bg-white grid lg:grid-cols-2">
      {/* ================================================================ */}
      {/* COLUMN 1: FORM */}
      {/* ================================================================ */}
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-10 md:px-16 xl:px-20">
        <div className="w-full max-w-sm mx-auto">

          {/* Mobile back link */}
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors duration-150"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-1.5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-ink)] text-white text-[9px] font-bold tracking-tight font-[family-name:var(--font-poppins)]">
                OAU
              </div>
              <span className="text-sm font-semibold text-[var(--color-ink)] font-[family-name:var(--font-poppins)]">Campus Jobs</span>
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-[var(--color-ink)] font-[family-name:var(--font-poppins)]">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[var(--color-ink)] underline underline-offset-4 hover:opacity-70 transition-opacity"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Session expired notice */}
          {reason === "expired" && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle size={14} className="shrink-0 text-amber-500 mt-0.5" />
              <span>Your session expired. Please sign in again.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-[12px] font-medium text-[var(--color-ink)] mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@oauife.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] bg-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:ring-offset-1 ${
                  fieldErrors.email ? "border-red-400 bg-red-50/30" : "border-[var(--color-border-strong)] hover:border-[var(--color-ink)]/30"
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-[12px] font-medium text-[var(--color-ink)]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset link will be sent to your email.")}
                  className="text-[11px] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] bg-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:ring-offset-1 ${
                    fieldErrors.password ? "border-red-400 bg-red-50/30" : "border-[var(--color-border-strong)] hover:border-[var(--color-ink)]/30"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] hover:text-[var(--color-ink)] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[var(--color-border-strong)] accent-[var(--color-ink)]"
              />
              <span className="text-[12px] text-[var(--color-muted)]">Remember me</span>
            </label>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
                {error}
              </div>
            )}

            {/* Wake-up notice */}
            {wake && (
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-[12px] text-[var(--color-muted)]">
                Waking up the server — this may take up to a minute.
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-ink)] py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--color-ink-2)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-poppins)]"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[11px] text-[var(--color-subtle)]">or continue with</span>
            </div>
          </div>

          {/* Social */}
          <AuthSocialButtons mode="login" />
        </div>
      </div>

      {/* ================================================================ */}
      {/* COLUMN 2: SHOWCASE IMAGE (RIGHT) */}
      {/* ================================================================ */}
      <div className="relative hidden lg:block h-full min-h-screen w-full">
        <AuthShowcaseCard />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-muted)]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
