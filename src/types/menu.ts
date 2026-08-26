export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // g
  carbohydrates: number; // g
  fat: number; // g
  fiber: number; // g
  sugar: number; // g
  sodium: number; // mg
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId: string; // Keeping for relation
  price: number;
  currency: string;
  description: string;
  shortDescription: string;
  image: string;
  vegetarian: boolean;
  rating: number;
  featured: boolean;
  has3DModel: boolean;
  modelUrl?: string; // URL to the GLB model
  optimizedModelUrl?: string; // URL to the heavily optimized mobile-friendly GLB
  previewImageUrl?: string; // Static WebP preview of the 3D model
  iosModelUrl?: string; // URL to the USDZ model for iOS AR
  nutrition?: NutritionInfo;
  /** Full-bleed ingredients/explore image under public/explore */
  exploreImageUrl?: string;
  
  // AR positioning (optional)
  modelScale?: number;
  modelRotation?: [number, number, number];
  modelPosition?: [number, number, number];
  ar?: {
    scale?: number;
    orientation?: string;
    placement?: "floor" | "wall";
  };
}
