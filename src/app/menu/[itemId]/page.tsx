"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { menuItems } from "../../../data/menu";
import { Badge } from "../../../components/ui/Badge";
import { Explore3DButton } from "../../../components/product/Explore3DButton";
import { Product3DOverlay } from "../../../components/product/Product3DOverlay";
import { FadeIn } from "../../../components/animations/FadeIn";
import { notFound } from "next/navigation";
import { use } from "react";

interface PageProps {
  params: Promise<{
    itemId: string;
  }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const item = menuItems.find((m) => m.slug === resolvedParams.itemId);
  const [is3DOpen, setIs3DOpen] = useState(false);

  if (!item) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-background selection:bg-accent/30 selection:text-foreground pb-24">
      {/* Floating Back Button */}
      <div className="fixed top-0 left-0 z-40 w-full p-4 sm:p-6 sm:pt-safe pt-safe pointer-events-none">
        <Link 
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-transform active:scale-90 border border-white/10 shadow-sm pointer-events-auto"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      {/* Hero Visual */}
      <FadeIn className="relative w-full h-[55vh] sm:h-[60vh] max-h-[800px] bg-muted rounded-b-[2.5rem] overflow-hidden shadow-2xl">
        <Image
          src={item.image}
          alt={item.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Subtle premium gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)] mix-blend-multiply opacity-50" />
      </FadeIn>

      {/* Content Section */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 -mt-8">
        <FadeIn delay={200} className="flex flex-col md:flex-row md:items-start gap-10">
          
          {/* Main Info Column */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-4">
              {item.featured && <Badge variant="warning">Signature</Badge>}
              {item.vegetarian && <Badge variant="success">Vegetarian</Badge>}
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground tracking-tight drop-shadow-sm">
              {item.name}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-accent tracking-widest text-sm">★★★★★</span>
              <span className="text-muted-foreground/60 text-xs font-medium tracking-wider">4.8</span>
            </div>

            <p className="mt-6 text-muted-foreground leading-relaxed text-base sm:text-lg font-light max-w-2xl">
              {item.description}
            </p>
          </div>

          {/* Action Column */}
          <div className="md:w-64 flex flex-col items-start md:items-end gap-6 shrink-0">
            <div className="font-serif text-4xl sm:text-5xl text-accent drop-shadow-sm">
              {item.currency}{item.price.toFixed(2)}
            </div>

            {item.has3DModel && (
              <Explore3DButton 
                onClick={() => setIs3DOpen(true)} 
                className="w-full md:w-auto" 
                disabled={!item.modelUrl}
              />
            )}
          </div>
        </FadeIn>
      </main>

      {/* 3D Overlay Container */}
      <Product3DOverlay 
        isOpen={is3DOpen} 
        onClose={() => setIs3DOpen(false)} 
        modelUrl={item.modelUrl} 
      />
    </div>
  );
}
