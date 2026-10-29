"use client";
// ============================================================================
// SECTION: ONBOARDING
// ============================================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Briefcase, Users, ShieldCheck } from "lucide-react";

const KEY = "oau_campus_jobs_onboarded";

export default function OnboardingPage() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === "true") {
        router.replace("/");
      }
    } catch {}
  }, [router]);

  const complete = () => {
    try {
      localStorage.setItem(KEY, "true");
    } catch {}
    router.replace("/");
  };

  const slides = [
    {
      title: "Find work on campus",
      desc: "Discover verified opportunities tailored to OAU students.",
      icon: Briefcase,
    },
    {
      title: "Connect with employers",
      desc: "Apply directly to departments and campus businesses.",
      icon: Users,
    },
    {
      title: "Trusted and moderated",
      desc: "Listings are reviewed to keep the platform safe.",
      icon: ShieldCheck,
    },
  ];

  const S = slides[slide];
  const Icon = S.icon;

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-accent)]">
            <Icon size={22} />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-[var(--color-ink)]">{S.title}</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{S.desc}</p>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={complete}>Skip</Button>
          {slide < slides.length - 1 ? (
            <Button onClick={() => setSlide(slide + 1)}>Next</Button>
          ) : (
            <Button onClick={complete}>Get started</Button>
          )}
        </div>
        <div className="mt-4 flex justify-center gap-1">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full ${i === slide ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
