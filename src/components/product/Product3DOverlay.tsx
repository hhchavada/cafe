"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2, Maximize, Minimize } from "lucide-react";
import { cn } from "../../lib/utils";

// Lazy load the heavy 3D viewer component
const LazyProductViewer = dynamic(
  () => import("../../components/three/ProductViewer").then(mod => mod.ProductViewer),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
        </div>
        <p className="mt-4 text-xs font-semibold tracking-widest uppercase text-muted-foreground animate-pulse">
          Preparing 3D View
        </p>
      </div>
    )
  }
);

interface Product3DOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl?: string;
}

export function Product3DOverlay({ isOpen, onClose, modelUrl }: Product3DOverlayProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to allow mounting before triggering animation class
      const t = requestAnimationFrame(() => setAnimateIn(true));
      return () => cancelAnimationFrame(t);
    } else {
      setAnimateIn(false);
      const t = setTimeout(() => setShouldRender(false), 500); // Wait for transition out
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!shouldRender || !modelUrl) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-all duration-500 ease-out",
        animateIn ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Top UI */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:p-6 sm:pt-safe pt-safe">
        <button 
          onClick={onClose}
          className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-transform active:scale-90 border border-white/10 shadow-sm"
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button 
          onClick={toggleFullscreen}
          className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-transform active:scale-90 border border-white/10 shadow-sm"
        >
          {isFullscreen ? <Minimize className="h-5 w-5 sm:h-6 sm:w-6" /> : <Maximize className="h-5 w-5 sm:h-6 sm:w-6" />}
        </button>
      </div>

      {/* 3D Canvas Container */}
      <div 
        className={cn(
          "w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          animateIn ? "scale-100" : "scale-95"
        )}
      >
        <LazyProductViewer modelUrl={modelUrl} />
      </div>


    </div>
  );
}
