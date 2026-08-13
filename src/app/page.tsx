"use client";

import { useState } from "react";
import { CafeIntro } from "../components/layout/CafeIntro";
import { CafeHeader } from "../components/layout/CafeHeader";
import { CategoryTabs } from "../components/menu/CategoryTabs";
import { MenuSearch } from "../components/menu/MenuSearch";
import { MenuCard } from "../components/menu/MenuCard";
import { SignatureCarousel } from "../components/menu/SignatureCarousel";
import { FadeIn } from "../components/animations/FadeIn";
import { menuCategories, menuItems } from "../data/menu";

export default function Home() {
  const [introFinished, setIntroFinished] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const clearFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
  };

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden selection:bg-accent/30 selection:text-foreground pb-24">
      {!introFinished && <CafeIntro onComplete={() => setIntroFinished(true)} />}
      
      {/* Main Menu Content */}
      <div 
        className={`transition-opacity duration-1000 ${introFinished ? "opacity-100" : "opacity-0 h-screen overflow-hidden"}`}
      >
        <CafeHeader />
        
        <div className="max-w-5xl mx-auto pt-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <FadeIn delay={100}>
              <MenuSearch 
                value={searchQuery} 
                onChange={setSearchQuery} 
                className="mb-8 max-w-3xl mx-auto"
              />
            </FadeIn>

            <FadeIn delay={200}>
              <CategoryTabs 
                categories={menuCategories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />
            </FadeIn>
          </div>

          {/* Signature 3D Collection - Only show when no search/filter to keep it curated */}
          {activeCategory === "all" && !searchQuery && (
            <FadeIn delay={300} className="mt-12 mb-16">
              <div className="px-4 sm:px-6 lg:px-8 mb-6">
                <h2 className="font-serif text-2xl sm:text-3xl text-foreground tracking-wide">
                  Signature 3D Collection
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Explore our signature dishes in 3D.
                </p>
              </div>
              <SignatureCarousel items={menuItems} />
            </FadeIn>
          )}

          {/* Explore Our Menu Grid */}
          <div className="px-4 sm:px-6 lg:px-8 mt-12">
            {filteredItems.length > 0 ? (
              <FadeIn delay={activeCategory === "all" && !searchQuery ? 400 : 300}>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl sm:text-3xl text-foreground tracking-wide uppercase">
                    Explore Our Menu
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Take a closer look at everything on the menu.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {filteredItems.map(item => (
                    <MenuCard key={item.id} item={item} />
                  ))}
                </div>
              </FadeIn>
            ) : (
              <FadeIn delay={100} className="py-24 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="text-2xl opacity-50">🍽️</span>
                </div>
                <h3 className="font-serif text-xl tracking-widest uppercase text-foreground mb-2">
                  No Dishes Found
                </h3>
                <p className="text-sm text-muted-foreground font-light mb-8 max-w-xs">
                  Try another search or category.
                </p>
                <button 
                  onClick={clearFilters}
                  className="px-6 py-2 rounded-full border border-card-border hover:bg-muted transition-colors text-xs font-semibold tracking-widest uppercase text-foreground"
                >
                  Clear Filters
                </button>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
