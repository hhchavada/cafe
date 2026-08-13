"use client";

import { Category } from "../../types/menu";
import { cn } from "../../lib/utils";

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelectCategory }: CategoryTabsProps) {
  return (
    <div className="relative -mx-4 mb-8 overflow-x-auto sm:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex px-4 sm:px-0 min-w-max border-b border-card-border/50">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "relative py-4 px-5 text-sm sm:text-base font-medium transition-colors duration-300",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              {category.name}
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-t-full shadow-[0_-2px_10px_rgba(199,135,82,0.4)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
