"use client";

import { useState } from "react";
import { CafeBrand } from "@/components/layout/CafeBrand";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { MenuCard } from "@/components/menu/MenuCard";
import { Container } from "@/components/ui/Container";
import { cafeData } from "@/data/cafe";
import { categories } from "@/data/categories";
import { menuItems } from "@/data/menu";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("cat-all");

  const filteredItems = activeCategory === "cat-all" 
    ? menuItems 
    : menuItems.filter(item => item.categoryId === activeCategory);

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      <Container>
        <CafeBrand cafe={cafeData} />
        
        <CategoryTabs 
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
        
        <MenuGrid>
          {filteredItems.map(item => (
            <MenuCard key={item.id} item={item} />
          ))}
        </MenuGrid>
        
        {filteredItems.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            No items found in this category.
          </div>
        )}
      </Container>
    </main>
  );
}
