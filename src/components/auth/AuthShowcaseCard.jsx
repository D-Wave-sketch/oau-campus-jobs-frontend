"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const SLIDES = [
  {
    title: "Capturing Moments, Creating Futures",
    subtitle: "Empowering Obafemi Awolowo University students with verified on-campus and remote opportunities.",
  },
  {
    title: "Flexible Roles, Real Campus Impact",
    subtitle: "Find departmental, research, and campus enterprise jobs built around your lecture schedule.",
  },
  {
    title: "Bridge Academics With Career Experience",
    subtitle: "Earn, grow professional skills, and build your resume without leaving Great Ife.",
  },
];

export function AuthShowcaseCard() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full min-h-screen w-full overflow-hidden bg-[#161324]">
      {/* Background Image filling 100% of the column */}
      <div className="absolute inset-0">
        <Image
          src="/images/auth-showcase.jpg"
          alt="Atmospheric dunes at twilight"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center filter brightness-[0.92] contrast-[1.05]"
        />
        {/* Soft Vignette and Rich Purple Ambient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#110f1a] via-[#110f1a]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#110f1a]/60 via-transparent to-[#110f1a]/85" />
        <div className="absolute inset-0 bg-[#5b21b6]/15 mix-blend-overlay" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex h-full min-h-screen flex-col justify-between p-8 sm:p-12 lg:p-16">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          {/* Brand Logo matching the minimalist sleek vibe */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-inner transition-transform duration-300 group-hover:scale-105">
              <span className="font-sans font-black tracking-tighter text-lg bg-gradient-to-br from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                OAU
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white drop-shadow-sm">
                Campus Jobs
              </span>
              <span className="text-[10px] tracking-wider uppercase text-purple-200/70 font-mono">
                Great Ife
              </span>
            </div>
          </Link>

          {/* Pill "Back to website ->" Button */}
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:border-white/30 hover:text-white"
          >
            <span>Back to website</span>
            <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Bottom Showcase Caption and Slider Indicators */}
        <div className="space-y-6 pt-16">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/25 bg-purple-500/10 px-3 py-1 text-[11px] font-medium text-purple-200 backdrop-blur-md">
            <Sparkles size={12} className="text-purple-300" />
            <span>Verified Student Employment</span>
          </div>

          {/* Slide Text Content */}
          <div className="min-h-[100px]">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl drop-shadow-md leading-tight">
              {SLIDES[activeSlide].title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-purple-100/75 max-w-lg leading-relaxed drop-shadow">
              {SLIDES[activeSlide].subtitle}
            </p>
          </div>

          {/* Slide Indicators (Pills) */}
          <div className="flex items-center gap-2 pt-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === index
                    ? "w-8 bg-white"
                    : "w-4 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
