import Image from "next/image";
import Link from "next/link";
import { MenuItem } from "../../types/menu";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";

interface FeaturedProductProps {
  item: MenuItem;
  className?: string;
}

export function FeaturedProduct({ item, className }: FeaturedProductProps) {
  return (
    <Link 
      href={`/menu/${item.slug}`} 
      className={cn(
        "group relative flex flex-col sm:flex-row overflow-hidden rounded-3xl bg-card border border-card-border transition-all duration-500 hover:border-accent/30 active:scale-[0.98] shadow-lg",
        className
      )}
    >
      <div className="relative h-64 sm:h-auto sm:w-2/5 overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        
        <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
          {item.vegetarian && <Badge variant="success">Veg</Badge>}
          {item.has3DModel && (
            <Badge variant="default" className="bg-white/20 backdrop-blur-md text-white border-white/10">
              ✨ 3D
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-6 sm:p-8 z-10">
        <h3 className="font-serif text-2xl sm:text-3xl text-foreground mb-2 group-hover:text-accent transition-colors">
          {item.name}
        </h3>
        
        <p className="mt-2 flex-1 text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
          {item.shortDescription}
        </p>
        
        <div className="mt-6 flex items-center justify-between">
          <span className="font-serif text-2xl text-accent">
            {item.currency}{item.price.toFixed(2)}
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground/80 group-hover:text-accent transition-colors">
            Tap to view
          </span>
        </div>
      </div>
    </Link>
  );
}
