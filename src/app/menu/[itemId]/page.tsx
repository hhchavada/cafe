"use client";

import { useCallback, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Leaf, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { menuItems } from "../../../data/menu";
import { Badge } from "../../../components/ui/Badge";
import { Explore3DButton } from "../../../components/product/Explore3DButton";
import { Product3DOverlay } from "../../../components/product/Product3DOverlay";
import { NutritionDrawer } from "../../../components/product/NutritionDrawer";
import { FadeIn } from "../../../components/animations/FadeIn";
import { useIsMobile } from "../../../hooks/useIsMobile";

interface PageProps {
  params: Promise<{
    itemId: string;
  }>;
}

const LazyProductViewer = dynamic(
  () => import("../../../components/three/ProductViewer").then((mod) => mod.ProductViewer),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#110e0c]">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
        </div>
      </div>
    ),
  }
);

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const item = menuItems.find((m) => m.slug === resolvedParams.itemId);
  const [is3DOpen, setIs3DOpen] = useState(false);
  const [isNutritionOpen, setIsNutritionOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  const nutritionHref = item?.nutrition ? `/menu/${item.slug}/nutrition` : undefined;

  const openNutrition = useCallback(() => {
    if (!item?.nutrition || !nutritionHref) return;
    if (isMobile) {
      router.push(nutritionHref);
      return;
    }
    setIsNutritionOpen(true);
  }, [item, nutritionHref, isMobile, router]);

  if (!item) {
    notFound();
  }

  const activeModelUrl = item.optimizedModelUrl || item.modelUrl || "";

  return (
    <div className="relative min-h-screen bg-background selection:bg-accent/30 selection:text-foreground pb-10">
      {activeModelUrl && (
        <link rel="preload" href={activeModelUrl} as="fetch" crossOrigin="anonymous" />
      )}

      <div className="fixed top-0 left-0 z-40 flex w-full items-center justify-between p-4 sm:p-6 sm:pt-safe pt-safe pointer-events-none">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-transform active:scale-90 border border-white/10 shadow-sm pointer-events-auto"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {item.has3DModel && (
          <Explore3DButton
            onClick={() => setIs3DOpen(true)}
            className="h-10 px-3.5 sm:px-4 py-0 bg-black/40 backdrop-blur-md border-white/20 pointer-events-auto"
            disabled={!item.modelUrl}
          />
        )}
      </div>

      <FadeIn className="relative w-full h-[55vh] sm:h-[60vh] max-h-[800px] bg-[#110e0c] rounded-b-[2.5rem] overflow-hidden shadow-2xl pointer-events-none">
        {item.has3DModel ? (
          !is3DOpen ? (
            <LazyProductViewer
              key={activeModelUrl}
              modelUrl={activeModelUrl}
              interactiveMode="display"
            />
          ) : (
            <div className="absolute inset-0 bg-[#110e0c]" />
          )
        ) : (
          <Image
            src={item.image}
            alt={item.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)] mix-blend-multiply opacity-50" />
      </FadeIn>

      <main className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 -mt-8">
        <FadeIn delay={200}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap gap-2 min-w-0">
              {item.featured && <Badge variant="warning">Signature</Badge>}
              {item.vegetarian && <Badge variant="success">Vegetarian</Badge>}
            </div>

            {item.nutrition && (
              <button
                type="button"
                onClick={openNutrition}
                className="shrink-0 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-foreground/90 transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-accent active:scale-95"
              >
                <Leaf className="h-3.5 w-3.5 text-accent" />
                Nutrition
              </button>
            )}
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground tracking-tight drop-shadow-sm min-w-0">
              {item.name}
            </h1>
            <div className="font-serif text-3xl sm:text-4xl md:text-5xl text-accent drop-shadow-sm shrink-0 pt-1 sm:pt-2">
              {item.currency}
              {item.price.toFixed(0)}/-
            </div>
          </div>

          <p className="mt-3 text-muted-foreground leading-relaxed text-base sm:text-lg font-light max-w-2xl">
            {item.description}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-accent tracking-widest text-sm">★★★★★</span>
            <span className="text-muted-foreground/60 text-xs font-medium tracking-wider">4.8</span>
          </div>
        </FadeIn>
      </main>

      <Product3DOverlay
        isOpen={is3DOpen}
        onClose={() => setIs3DOpen(false)}
        modelUrl={item.optimizedModelUrl || item.modelUrl}
        onNutritionClick={item.nutrition ? openNutrition : undefined}
      />

      {item.nutrition && (
        <NutritionDrawer
          isOpen={isNutritionOpen}
          onClose={() => setIsNutritionOpen(false)}
          nutrition={item.nutrition}
          productName={item.name}
        />
      )}
    </div>
  );
}
