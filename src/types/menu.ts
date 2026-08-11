export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  price: number;
  currency: string;
  description: string;
  shortDescription: string;
  image: string;
  model?: string; // URL to the GLB model
  iosModelUrl?: string; // URL to the USDZ model for iOS AR
  modelScale?: number;
  modelRotation?: [number, number, number];
  modelPosition?: [number, number, number];
  ar?: {
    scale?: number;
    orientation?: string; // e.g. "0deg 90deg 0deg"
    placement?: "floor" | "wall";
  };
  ingredients: string[];
  tags: string[];
  isVegetarian: boolean;
  isPopular: boolean;
  isAvailable: boolean;
}
