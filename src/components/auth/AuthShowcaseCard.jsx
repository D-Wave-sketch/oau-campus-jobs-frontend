"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const SLIDES = [
  {
    label: "Campus Employment",
    title: "Find work built around your studies",
    subtitle:
      "Verified on-campus opportunities for Obafemi Awolowo University students.",
    image: "/images/p1.jpg",
    imageAlt:
      "Campus building surrounded by greenery at Obafemi Awolowo University",
  },
  {
    label: "Flexible Roles",
    title: "Roles that fit your lecture schedule",
    subtitle: "From departmental jobs to research and campus enterprise gigs.",
    image: "/images/p2.jpg",
    imageAlt: "Campus building and statue at Obafemi Awolowo University",
  },
  {
    label: "Trusted Platform",
    title: "Every listing is reviewed",
    subtitle: "Earn, grow, and build your CV without leaving Great Ife.",
    image: "/images/p3.jpg",
    imageAlt: "Students studying together outdoors on campus",
  },
];

export function AuthShowcaseCard() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % SLIDES.length);
        setFading(false);
      }, 300);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[activeSlide];

  return (
    <div className="relative h-full min-h-screen w-full overflow-hidden bg-[#0D0D0D]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt={slide.imageAlt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center opacity-50"
        />
        {/* Layered gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex h-full min-h-screen flex-col justify-between p-10 sm:p-14 lg:p-16">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#111] text-[11px] font-bold tracking-tight shrink-0 font-[family-name:var(--font-poppins)]">
              OAU
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold text-white tracking-tight font-[family-name:var(--font-poppins)]">
                Campus Jobs
              </span>
              <span className="text-[10px] text-white/50 font-medium tracking-widest uppercase">
                Great Ife
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-200 backdrop-blur-sm"
          >
            <span>Browse</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* Bottom content */}
        <div className="space-y-5">
          {/* Slide text */}
          <div
            className="space-y-2 transition-all duration-300"
            style={{
              opacity: fading ? 0 : 1,
              transform: fading ? "translateY(4px)" : "translateY(0)",
            }}
          >
            <p className="text-[11px] font-semibold tracking-widest uppercase text-white/40">
              {slide.label}
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-white leading-tight tracking-tight font-[family-name:var(--font-poppins)]">
              {slide.title}
            </h2>
            <p className="text-sm text-white/55 max-w-sm leading-relaxed">
              {slide.subtitle}
            </p>
          </div>

          {/* Slide indicators */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setFading(true);
                  setTimeout(() => {
                    setActiveSlide(index);
                    setFading(false);
                  }, 300);
                }}
                aria-label={`Slide ${index + 1}`}
                className={`h-[3px] rounded-full transition-all duration-400 ${
                  activeSlide === index
                    ? "w-8 bg-white"
                    : "w-4 bg-white/25 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
