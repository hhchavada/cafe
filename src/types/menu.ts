export interface Category {
  id: string;
  name: string;
  slug: string;
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
  iosModelUrl?: string; // URL to the USDZ model for iOS AR
  
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
