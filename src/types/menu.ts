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
  arScale?: number; // Physical scale adjustment for AR
  modelRotation?: [number, number, number];
  modelPosition?: [number, number, number];
  ingredients: string[];
  tags: string[];
  isVegetarian: boolean;
  isPopular: boolean;
  isAvailable: boolean;
}
