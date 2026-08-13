import Image from "next/image";
import { Cafe } from "../../types/cafe";

interface CafeBrandProps {
  cafe: Cafe;
}

export function CafeBrand({ cafe }: CafeBrandProps) {
  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-4 overflow-hidden h-[120px] sm:h-[160px]">
      {/* Premium Dark Fade Background Image */}
      <Image 
        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1600" 
        alt="Cafe Background"
        fill
        className="object-cover opacity-30"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      
      {/* Sleek Minimalist Content - Horizontal Layout */}
      <div className="absolute inset-0 flex items-end p-4 sm:p-8">
        <div className="flex items-center gap-3">
          {cafe.logoUrl ? (
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full p-[2px] bg-gradient-to-tr from-amber-500 to-orange-400">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-background">
                <Image src={cafe.logoUrl} alt={cafe.name} fill className="object-cover" />
              </div>
            </div>
          ) : (
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-lg sm:text-xl font-bold text-white shadow-lg">
              {cafe.name.charAt(0)}
            </div>
          )}
          
          <div className="flex flex-col justify-center">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none mb-0.5">
              {cafe.name}
            </h1>
            <p className="text-amber-500 font-semibold text-[10px] sm:text-xs tracking-wide">
              Premium menu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
