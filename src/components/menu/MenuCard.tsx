import Image from "next/image";
import Link from "next/link";
import { MenuItem } from "../../types/menu";
import { Badge } from "../ui/Badge";

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  return (
    <Link href={`/menu/${item.slug}`} className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-card-border transition-all duration-500 hover:border-accent/30 active:scale-[0.98] shadow-sm hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        {/* Very subtle gradient to ensure badge readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" />
        
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex flex-col gap-1 sm:gap-2 z-10 scale-90 origin-top-left">
          {item.vegetarian && <Badge variant="success">Veg</Badge>}
          {item.has3DModel && (
            <Badge variant="default" className="bg-white/20 backdrop-blur-md text-white border-white/10">
              ✨ 3D
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-4 sm:p-5 z-10">
        <h3 className="font-serif text-base sm:text-lg text-foreground line-clamp-1 group-hover:text-accent transition-colors">{item.name}</h3>
        <p className="mt-1.5 flex-1 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed font-light">
          {item.shortDescription}
        </p>
        
        <div className="mt-4 flex w-full items-center justify-between">
          <span className="font-serif text-lg text-accent">
            {item.currency}{item.price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
