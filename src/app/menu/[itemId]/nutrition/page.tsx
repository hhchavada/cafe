"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { menuItems } from "../../../../data/menu";
import { FadeIn } from "../../../../components/animations/FadeIn";
import { NutritionContent } from "../../../../components/product/NutritionContent";

export default function NutritionPage() {
  const params = useParams<{ itemId: string }>();
  const item = menuItems.find((m) => m.slug === params.itemId);

  if (!item) {
    notFound();
  }

  if (!item.nutrition) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-foreground">
      <header className="sticky top-0 z-20 flex items-center justify-center px-4 py-4 sm:px-6 sm:pt-safe pt-safe bg-background/90 backdrop-blur-md">
        <Link
          href={`/menu/${item.slug}`}
          className="absolute left-4 sm:left-6 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-transform active:scale-90"
          aria-label="Back to product"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-sans text-base sm:text-lg font-semibold tracking-wide">
          Nutrition
        </h1>
      </header>

      <main className="mx-auto max-w-lg px-6 pb-16 pt-8 sm:px-10">
        <FadeIn>
          <NutritionContent nutrition={item.nutrition} />
        </FadeIn>
      </main>
    </div>
  );
}
