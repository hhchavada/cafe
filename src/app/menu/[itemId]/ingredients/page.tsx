"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { menuItems } from "../../../../data/menu";

export default function IngredientsPage() {
  const params = useParams<{ itemId: string }>();
  const item = menuItems.find((m) => m.slug === params.itemId);

  if (!item?.exploreImageUrl) {
    notFound();
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 flex items-center justify-center px-4 py-4 sm:px-6 sm:pt-safe pt-safe bg-background/90 backdrop-blur-md">
        <Link
          href={`/menu/${item.slug}`}
          className="absolute left-4 sm:left-6 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-transform active:scale-90"
          aria-label="Back to product"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-sans text-base sm:text-lg font-semibold tracking-wide">
          Ingredients
        </h1>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 pb-10 pt-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.exploreImageUrl}
          alt={`${item.name} ingredients`}
          className="max-h-[calc(100vh-6rem)] w-full max-w-3xl object-contain"
        />
      </main>
    </div>
  );
}
