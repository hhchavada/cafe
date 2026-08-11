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
    <div className="sticky top-16 z-30 -mx-4 mb-6 overflow-x-auto border-b border-gray-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex space-x-2 sm:justify-center min-w-max">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all active:scale-95",
              activeCategory === category.id
                ? "bg-black text-white shadow-md"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
