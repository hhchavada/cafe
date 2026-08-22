"use client";

import { useState, useRef, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Bounds, ContactShadows } from "@react-three/drei";
import { menuItems } from "../../../data/menu";

// The model component
function Model({ url, onLoad }: { url: string; onLoad?: () => void }) {
  const { scene } = useGLTF(url, "https://www.gstatic.com/draco/v1/decoders/");
  
  // Call onLoad after a brief delay to ensure it's rendered
  setTimeout(() => {
    if (onLoad) onLoad();
  }, 500);

  return <primitive object={scene} />;
}

// A helper to frame the model nicely
function FrameModel() {
  const { camera } = useThree();
  
  // Set a nice 3/4 angle by default before Bounds fits it
  camera.position.set(5, 4, 5);
  camera.lookAt(0, 0, 0);
  
  return null;
}

export default function PreviewGenerator() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const items = menuItems.filter((i) => i.has3DModel && i.modelUrl);
  const currentItem = items[currentIndex];

  const handleCapture = () => {
    if (!canvasRef.current || !currentItem) return;
    
    // Get WebP from canvas
    const dataUrl = canvasRef.current.toDataURL("image/webp", 0.9);
    
    // Trigger download
    const link = document.createElement("a");
    link.download = `${currentItem.slug}.webp`;
    link.href = dataUrl;
    link.click();
    
    setDownloaded(prev => [...prev, currentItem.slug]);
  };

  const nextModel = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (items.length === 0) return <div className="p-10 text-white">No models found</div>;

  return (
    <div className="min-h-screen bg-[#171311] text-white p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-2">3D Preview Generator</h1>
      <p className="text-white/60 mb-8 max-w-xl text-center">
        This tool renders the existing GLB models using the same lighting as the app, 
        and allows you to capture lightweight WebP images to use as static 3D previews.
        Place the downloaded images in the <code className="bg-white/10 px-1 rounded">public/3d-previews/</code> folder.
      </p>

      <div className="flex gap-8 w-full max-w-6xl">
        {/* Left Side: Controls */}
        <div className="w-1/3 space-y-6">
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold mb-4">Select Product</h2>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    currentIndex === idx 
                      ? "bg-accent text-accent-foreground font-medium" 
                      : "hover:bg-white/10 text-white/70"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{item.name}</span>
                    {downloaded.includes(item.slug) && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Saved</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold mb-2">Instructions</h2>
            <ol className="list-decimal pl-4 space-y-2 text-sm text-white/70">
              <li>Wait for the model to load in the canvas.</li>
              <li>Drag to rotate the model to a nice 3/4 angle.</li>
              <li>Click "Capture & Download".</li>
              <li>Move the downloaded file to `public/3d-previews/`.</li>
            </ol>
            
            <button
              onClick={handleCapture}
              className="mt-6 w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-white/90 active:scale-95 transition-all"
            >
              Capture & Download WebP
            </button>
            
            <button
              onClick={nextModel}
              disabled={currentIndex >= items.length - 1}
              className="mt-3 w-full bg-transparent border border-white/20 text-white font-medium py-3 rounded-lg hover:bg-white/5 active:scale-95 transition-all disabled:opacity-30"
            >
              Next Model
            </button>
          </div>
        </div>

        {/* Right Side: Canvas */}
        <div className="w-2/3 aspect-square max-w-[800px] bg-[#171311] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
          {/* Ensure gl preserves drawing buffer so toDataURL works */}
          <Canvas
            ref={canvasRef}
            gl={{ preserveDrawingBuffer: true, antialias: true }}
            camera={{ position: [5, 4, 5], fov: 45 }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <ambientLight intensity={1.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
            <Environment preset="city" />
            
            <Suspense fallback={null}>
              <Bounds fit clip observe margin={1.2}>
                <FrameModel />
                <Model url={currentItem.modelUrl!} />
              </Bounds>
              <ContactShadows position={[0, -0.8, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
            </Suspense>
            
            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
          </Canvas>

          {/* Loading Indicator Overlay (naive) */}
          <div className="absolute top-4 left-4 pointer-events-none">
            <p className="text-xs font-bold tracking-widest uppercase text-white/50 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
              800x800 Target
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
