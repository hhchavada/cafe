"use client";

import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

export function CafeHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300 ease-in-out px-4 py-4 sm:px-6 lg:px-8",
        scrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-card-border shadow-sm py-3" 
          : "bg-transparent border-b border-transparent py-5"
      )}
    >
      <div className="flex flex-col items-center justify-center max-w-7xl mx-auto">
        <h1 className="font-serif text-2xl sm:text-3xl text-foreground tracking-widest uppercase text-center">
          Brew Haven
        </h1>
        <p 
          className={cn(
            "font-sans text-[10px] sm:text-xs text-accent uppercase tracking-[0.2em] font-light mt-1 transition-all duration-300",
            scrolled ? "opacity-0 h-0 overflow-hidden mt-0" : "opacity-100 h-auto"
          )}
        >
          Good Coffee. Good Moments.
        </p>
      </div>
    </header>
  );
}
