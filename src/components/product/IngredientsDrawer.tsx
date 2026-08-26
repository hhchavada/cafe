"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface IngredientsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  productName?: string;
}

export function IngredientsDrawer({
  isOpen,
  onClose,
  imageUrl,
  productName,
}: IngredientsDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60]",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close ingredients"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Ingredients"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-background shadow-2xl border-l border-white/10 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 className="font-sans text-lg font-semibold tracking-wide">Ingredients</h2>
            {productName && (
              <p className="mt-0.5 text-xs text-muted-foreground">{productName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground transition-transform active:scale-90 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1 min-h-0 bg-[#110e0c]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${productName || "Dish"} ingredients`}
            className="absolute inset-0 h-full w-full object-contain p-4"
          />
        </div>
      </aside>
    </div>
  );
}
