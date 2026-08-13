import { ReactNode } from "react";

interface MenuGridProps {
  children: ReactNode;
}

export function MenuGrid({ children }: MenuGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      {children}
    </div>
  );
}
