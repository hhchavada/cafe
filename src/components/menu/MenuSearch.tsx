"use client";

import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

interface MenuSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MenuSearch({ value, onChange, className }: MenuSearchProps) {
  return (
    <div className={cn("relative group", className)}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-accent" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search the menu..."
        className="block w-full bg-card/60 border border-card-border rounded-2xl py-3.5 pl-12 pr-4 text-foreground placeholder-muted-foreground/60 transition-all focus:outline-none focus:ring-1 focus:ring-accent focus:bg-card focus:border-accent/50 shadow-sm"
      />
    </div>
  );
}
