"use client";
// ============================================================================
// SECTION: ONBOARDING — CLEAN 2-COLUMN SPLIT (matches auth pages)
// ============================================================================
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Users,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { AuthShowcaseCard } from "@/components/auth/AuthShowcaseCard";

const KEY = "oau_campus_jobs_onboarded";
const FADE_MS = 200;

const SLIDES = [
  {
    icon: Briefcase,
    step: "01",
    title: "Find work on campus",
    desc: "Discover verified opportunities built for OAU students — from departmental roles to campus enterprise gigs.",
    cta: "Next",
  },
  {
    icon: Users,
    step: "02",
    title: "Connect with employers",
    desc: "Apply directly to departments and campus businesses. Your profile, applications, and saved jobs — all in one place.",
    cta: "Next",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Trusted & moderated",
    desc: "Every listing is reviewed before going live. We keep the platform safe so you can focus on finding the right role.",
    cta: "Get started",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    let onboarded = false;
    try {
      onboarded = localStorage.getItem(KEY) === "true";
    } catch {}
    if (onboarded) {
      router.replace("/");
    } else {
      setReady(true);
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const complete = () => {
    try {
      localStorage.setItem(KEY, "true");
    } catch {}
    router.replace("/");
  };

  const go = (dir) => {
    if (exiting) return;
    setExiting(true);
    timer.current = setTimeout(() => {
      setSlide((s) => s + dir);
      setExiting(false);
    }, FADE_MS);
  };

  const advance = () => {
    if (exiting) return;
    if (slide < SLIDES.length - 1) go(1);
    else complete();
  };

  const back = () => {
    if (slide > 0) go(-1);
  };

  if (!ready) {
    return (
      <div
        className="min-h-screen w-full bg-white flex items-center justify-center"
        role="status"
        aria-label="Loading"
      >
        <Loader2 className="h-5 w-5 animate-spin text-[var(--color-muted)]" />
      </div>
    );
  }

  const S = SLIDES[slide];
  const Icon = S.icon;
  const isLast = slide === SLIDES.length - 1;

  return (
    <div className="min-h-screen w-full bg-white grid lg:grid-cols-2">
      {/* ================================================================ */}
      {/* COLUMN 1: ONBOARDING STEPS (LEFT) */}
      {/* ================================================================ */}
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-10 md:px-16 xl:px-20">
        <div className="w-full max-w-sm mx-auto">

          {/* Mobile: skip */}
          <div className="mb-8 lg:hidden flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-ink)] text-white text-[9px] font-bold font-[family-name:var(--font-poppins)]">
                OAU
              </div>
              <span className="text-sm font-semibold text-[var(--color-ink)] font-[family-name:var(--font-poppins)]">Campus Jobs</span>
            </div>
            <button
              type="button"
              onClick={complete}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              Skip
            </button>
          </div>

          {/* Mobile showcase */}
          <div className="relative mb-8 h-40 w-full overflow-hidden rounded-xl border border-[var(--color-border)] lg:hidden">
            <AuthShowcaseCard />
          </div>

          {/* Brand (desktop) */}
          <div className="hidden lg:flex items-center gap-2 mb-10">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-ink)] text-white text-[9px] font-bold font-[family-name:var(--font-poppins)]">
              OAU
            </div>
            <span className="text-sm font-semibold text-[var(--color-ink)] font-[family-name:var(--font-poppins)]">Campus Jobs</span>
          </div>

          {/* Progress bar */}
          <div
            className="flex items-center gap-1.5 mb-10"
            role="progressbar"
            aria-label="Onboarding progress"
            aria-valuemin={1}
            aria-valuemax={SLIDES.length}
            aria-valuenow={slide + 1}
          >
            {SLIDES.map((_, i) => (
              <div
                key={i}
                aria-hidden="true"
                className={`h-[2px] rounded-full transition-all duration-500 ${
                  i === slide
                    ? "flex-1 bg-[var(--color-ink)]"
                    : i < slide
                    ? "w-8 bg-[var(--color-ink)]/30"
                    : "w-8 bg-[var(--color-border-strong)]"
                }`}
              />
            ))}
            <span className="ml-auto text-[11px] text-[var(--color-subtle)] tabular-nums" aria-hidden="true">
              {slide + 1} / {SLIDES.length}
            </span>
          </div>

          {/* Slide content */}
          <div
            aria-live="polite"
            aria-atomic="true"
            className="space-y-4 transition-all duration-200"
            style={{
              opacity: exiting ? 0 : 1,
              transform: exiting ? "translateY(6px)" : "translateY(0)",
            }}
          >
            {/* Step label + icon row */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] text-[var(--color-ink)]">
                <Icon size={22} aria-hidden="true" />
              </div>
              <span className="text-[11px] font-mono text-[var(--color-subtle)] tracking-wider">
                STEP {S.step}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink)] leading-snug font-[family-name:var(--font-poppins)]">
              {S.title}
            </h1>

            <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-xs">
              {S.desc}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col gap-3">
            <div className="flex gap-2.5">
              {slide > 0 && (
                <button
                  type="button"
                  onClick={back}
                  disabled={exiting}
                  aria-label="Previous step"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-all duration-150 hover:bg-[var(--color-surface-2)] active:scale-[0.99] disabled:opacity-50"
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  Back
                </button>
              )}
              <button
                type="button"
                id="onboarding-advance-btn"
                onClick={advance}
                disabled={exiting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[var(--color-ink)] py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--color-ink-2)] active:scale-[0.99] disabled:opacity-60 font-[family-name:var(--font-poppins)]"
              >
                {S.cta}
                {!isLast && <ArrowRight size={15} aria-hidden="true" />}
              </button>
            </div>

            <button
              type="button"
              onClick={complete}
              className="w-full py-2 text-[12px] text-[var(--color-subtle)] hover:text-[var(--color-ink)] transition-colors"
            >
              Skip onboarding
            </button>
          </div>

          {/* Sign in link */}
          <p className="mt-8 text-center text-[12px] text-[var(--color-muted)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--color-ink)] underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Sign in
            </Link>
          </p>
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