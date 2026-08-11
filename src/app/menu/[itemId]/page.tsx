import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { menuItems } from "../../../data/menu";
import { ProductViewer } from "../../../components/three/ProductViewer";
import { Container } from "../../../components/ui/Container";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ARViewer } from "../../../components/ar/ARViewer";

interface PageProps {
  params: Promise<{
    itemId: string;
  }>;
}

export function generateStaticParams() {
  return menuItems.map((item) => ({
    itemId: item.slug,
  }));
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const item = menuItems.find((m) => m.slug === resolvedParams.itemId);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <Container>
          <div className="flex h-16 items-center gap-4">
            <Link 
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-900 transition-colors hover:bg-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">{item.name}</h1>
          </div>
        </Container>
      </header>

      <main>
        <div className="w-full sm:px-4 sm:py-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            
            {/* Viewer Section */}
            <div className="w-full lg:sticky lg:top-24 lg:h-fit relative">
              <ProductViewer 
                modelUrl={item.model} 
                fallbackImage={item.image} 
                productName={item.name} 
                modelScale={item.modelScale}
                modelRotation={item.modelRotation}
                modelPosition={item.modelPosition}
              />
              {item.model && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold tracking-wide text-gray-800 shadow-sm backdrop-blur-md uppercase pointer-events-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Interactive 3D
                </div>
              )}
              <div className="mt-3 flex justify-center text-xs text-gray-400 sm:hidden">
                Drag to rotate • Pinch to zoom
              </div>
              
              {item.model && (
                <ARViewer 
                  modelUrl={item.model} 
                  iosModelUrl={item.iosModelUrl} 
                  productName={item.name} 
                  arConfig={item.ar}
                />
              )}
            </div>

            {/* Details Section */}
            <div className="px-4 sm:px-0">
              <div className="mb-4 flex flex-wrap gap-2">
                {item.isPopular && <Badge variant="warning">Popular</Badge>}
                {item.isVegetarian && <Badge variant="success">Vegetarian</Badge>}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                {item.name}
              </h1>
              
              <div className="mt-4 text-2xl font-medium text-black">
                {item.currency}{item.price.toFixed(2)}
              </div>

              <div className="mt-6 prose prose-gray">
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>

              {item.ingredients.length > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                    Ingredients
                  </h3>
                  <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {item.ingredients.map((ingredient, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                          <Check className="h-3 w-3" />
                        </div>
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.tags.length > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                    Tags
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Order/Action Button (Placeholder for future) */}
              <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white p-4 sm:static sm:mt-10 sm:border-t-0 sm:bg-transparent sm:p-0">
                <Button className="w-full text-base sm:w-auto" size="lg">
                  Order Now - {item.currency}{item.price.toFixed(2)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
