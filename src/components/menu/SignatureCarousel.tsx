"use client";

import Link from "next/link";
import Image from "next/image";
import { MenuItem } from "../../types/menu";
import { Box } from "lucide-react";
import { FadeIn } from "../animations/FadeIn";

interface SignatureCarouselProps {
  items: MenuItem[];
}

export function SignatureCarousel({ items }: SignatureCarouselProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full relative pb-4">
      {/* 
        Use snap mandatory for mobile swipe. 
        Hide scrollbar for premium look.
      */}
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 px-4 sm:px-6 lg:px-8">
        {items.map((item, index) => (
          <FadeIn 
            key={item.id} 
            delay={100 + index * 50} 
            className="snap-center shrink-0 w-[85%] sm:w-[45%] lg:w-[30%] first:ml-0 last:mr-4"
          >
            <Link 
              href={`/menu/${item.slug}`}
              className="group block relative w-full h-[380px] sm:h-[420px] rounded-2xl overflow-hidden bg-card border border-card-border shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Image Section */}
              <div className="relative w-full h-[65%] overflow-hidden bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 30vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* 3D Indicator */}
                {item.has3DModel && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-md border border-white/10 transition-colors group-hover:border-accent/40 group-hover:bg-black/60">
                    <Box className="h-3 w-3 text-accent group-hover:animate-pulse" />
                    <span className="text-[9px] font-bold tracking-widest text-white uppercase">
                      3D
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="relative h-[35%] p-4 flex flex-col justify-between bg-card">
                <div>
                  <h3 className="font-serif text-lg text-foreground truncate group-hover:text-accent transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 font-light">
                    {item.shortDescription}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="font-serif text-lg text-accent">
                    {item.currency}{item.price.toFixed(2)}
                  </span>
                  
                  {/* Copper Accent line */}
                  <div className="h-[2px] w-8 bg-accent/40 rounded-full transition-all duration-300 group-hover:w-16 group-hover:bg-accent" />
                </div>
              </div>
            </Link>
          </FadeIn>
        ))}
      </div>
      
      {/* Fading edge for visual cue on desktop */}
      <div className="hidden lg:block absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}
