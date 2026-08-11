import { Cafe } from "../../types/cafe";

interface CafeBrandProps {
  cafe: Cafe;
}

export function CafeBrand({ cafe }: CafeBrandProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center sm:py-8">
      {cafe.logoUrl ? (
        <img src={cafe.logoUrl} alt={cafe.name} className="mb-3 h-12 w-12 rounded-full object-cover shadow-sm ring-1 ring-gray-100" />
      ) : (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-black text-xl font-bold text-white shadow-sm">
          {cafe.name.charAt(0)}
        </div>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {cafe.name}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {cafe.tagline}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
        <span>📍 {cafe.location}</span>
        <span className="hidden sm:inline">•</span>
        <span>🕒 {cafe.openingHours}</span>
      </div>
    </div>
  );
}
