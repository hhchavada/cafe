"use client";

import { NutritionInfo } from "../../types/menu";

interface NutritionContentProps {
  nutrition: NutritionInfo;
  className?: string;
}

export function NutritionContent({ nutrition, className }: NutritionContentProps) {
  const rows = [
    { label: "Protein", value: `${nutrition.protein} g` },
    { label: "Carbohydrates", value: `${nutrition.carbohydrates} g` },
    { label: "Fat", value: `${nutrition.fat} g` },
    { label: "Fiber", value: `${nutrition.fiber} g` },
    { label: "Sugar", value: `${nutrition.sugar} g` },
    { label: "Sodium", value: `${nutrition.sodium} mg` },
  ];

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground font-medium">Calories</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-sans text-6xl sm:text-7xl font-semibold tracking-tight text-foreground tabular-nums">
          {nutrition.calories}
        </span>
        <span className="text-lg font-medium text-accent">kcal</span>
      </div>

      <ul className="mt-10 divide-y divide-white/10 border-t border-white/10">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between py-4 text-[15px] sm:text-base"
          >
            <span className="text-foreground/90">{row.label}</span>
            <span className="tabular-nums text-foreground/90">{row.value}</span>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-center text-xs text-muted-foreground/70 italic">
        * Approximate values per serving
      </p>
    </div>
  );
}
