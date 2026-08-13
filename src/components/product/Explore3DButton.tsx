"use client";

import { Box } from "lucide-react";
import { cn } from "../../lib/utils";

interface Explore3DButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export function Explore3DButton({ onClick, className, disabled }: Explore3DButtonProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "group relative flex items-center gap-2 overflow-hidden rounded-full border border-accent/40 bg-accent/5 px-6 py-3 transition-all duration-300 shadow-sm",
        disabled 
          ? "opacity-60 cursor-not-allowed grayscale" 
          : "hover:bg-accent/10 hover:border-accent active:scale-95 hover:shadow-[0_0_20px_rgba(199,135,82,0.2)]",
        className
      )}
    >
      <Box className={cn(
        "h-4 w-4 text-accent transition-transform duration-500",
        !disabled && "group-hover:rotate-12 group-hover:scale-110"
      )} />
      <span className="font-sans text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-accent">
        {disabled ? "3D Coming Soon" : "Explore in 3D"}
      </span>
      {/* Subtle shine effect */}
      {!disabled && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      )}
    </button>
  );
}
