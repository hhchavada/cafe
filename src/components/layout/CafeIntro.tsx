"use client";

import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface CafeIntroProps {
  onComplete: () => void;
}

export function CafeIntro({ onComplete }: CafeIntroProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [shouldPlay, setShouldPlay] = useState<boolean>(true);

  useEffect(() => {
    // Check session storage to see if we already played the intro
    const hasPlayed = sessionStorage.getItem("cafe_intro_played");
    
    // Check for prefers-reduced-motion
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (hasPlayed || reducedMotion) {
      setShouldPlay(false);
      onComplete();
      return;
    }

    // Phase 1: 0 - 400ms (Fade in cafe logo)
    setPhase(1);

    // Phase 2: 400ms - 1000ms (Hold cafe identity)
    const t1 = setTimeout(() => {
      setPhase(2);
    }, 400);

    // Phase 3: 1000ms - 1800ms (Transition out intro, reveal background)
    const t2 = setTimeout(() => {
      setPhase(3);
    }, 1000);

    // Phase 4: 1800ms - 2500ms (Reveal main menu content, finish)
    const t3 = setTimeout(() => {
      setPhase(4);
      sessionStorage.setItem("cafe_intro_played", "true");
      onComplete();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (!shouldPlay) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700 ease-in-out",
        phase >= 3 ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      {/* Subtle warm radial lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-background to-background opacity-60" />

      {/* Cafe Branding */}
      <div 
        className={cn(
          "relative z-10 flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          phase === 0 ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-0",
          phase >= 3 ? "-translate-y-12 scale-90 opacity-0" : ""
        )}
      >
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground tracking-widest uppercase mb-3 drop-shadow-sm">
          Brew Haven
        </h1>
        
        {/* Subtle copper accent line */}
        <div className="w-12 h-[1px] bg-accent/60 mb-4" />
        
        <p className="font-sans text-sm sm:text-base text-accent uppercase tracking-[0.2em] font-light">
          Good Coffee. Good Moments.
        </p>
      </div>
    </div>
  );
}
