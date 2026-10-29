"use client";

// ============================================================================
// SECTION: LOGIN PAGE (TRUE 2-COLUMN FULL-BLEED: FORM LEFT, IMAGE RIGHT)
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
      <div className="min-h-screen bg-[#110f1a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
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
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[#8c84a8]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Session Expired Notice */}
          {reason === "expired" && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
              <AlertCircle size={16} className="shrink-0 text-amber-400 mt-0.5" />
              <span>Your session has expired. Please sign in again to continue.</span>
            </div>
          )}

          {/* Main Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl border ${
                  fieldErrors.email ? "border-red-500/80" : "border-[#2e2844]"
                } bg-[#1a162b] px-4 py-3 text-sm text-white placeholder-[#6f688e] transition-all duration-200 focus:border-[#7048e8] focus:bg-[#201b36] focus:outline-none focus:ring-1 focus:ring-[#7048e8]`}
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>
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
                  autoComplete="current-password"
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
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#383154] bg-[#1a162b] text-[#7048e8] focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-[#110f1a] accent-[#7048e8]"
                />
                <span className="text-xs text-[#9d95ba]">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Password reset link will be sent to your student/employer email address.")}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </button>
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
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#26203a]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#110f1a] px-3 text-[#787196]">Or sign in with</span>
            </div>
          </div>

          {/* Social Logins */}
          <AuthSocialButtons mode="login" />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* COLUMN 2: FILLED IMAGE SHOWCASE (RIGHT - FULL BLEED) */}
      {/* ==================================================================== */}
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
        <div className="min-h-screen bg-[#110f1a] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
