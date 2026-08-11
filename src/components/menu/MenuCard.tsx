import Image from "next/image";
import Link from "next/link";
import { Box } from "lucide-react";
import { MenuItem } from "../../types/menu";
import { Badge } from "../ui/Badge";

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  return (
    <Link href={`/menu/${item.slug}`} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md active:scale-[0.98]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {item.isPopular && <Badge variant="warning">Popular</Badge>}
          {item.isVegetarian && <Badge variant="success">Veg</Badge>}
        </div>
        {item.model && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-gray-700 shadow-sm backdrop-blur-md uppercase">
            <Box className="h-3.5 w-3.5" />
            3D View
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
          <span className="shrink-0 font-medium text-black">
            {item.currency}{item.price.toFixed(2)}
          </span>
        </div>
        <p className="mt-1 flex-1 text-sm text-gray-500 line-clamp-2">
          {item.shortDescription}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400">Tap to view</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-900 transition-colors group-hover:bg-black group-hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
