"use client";

import React, { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, Center, Bounds } from "@react-three/drei";
import Image from "next/image";
import { Loader2, Maximize, Minimize, RefreshCw, Box } from "lucide-react";
import { cn } from "../../lib/utils";

interface ProductViewerProps {
  modelUrl?: string;
  fallbackImage?: string;
  productName: string;
  modelScale?: number;
  modelRotation?: [number, number, number];
  modelPosition?: [number, number, number];
}

class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("3D Model failed to load:", error);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function Model({ url, scale, rotation, position }: { url: string; scale?: number; rotation?: [number, number, number]; position?: [number, number, number] }) {
  const { scene } = useGLTF(url);
  
  scene.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return (
    <Bounds fit clip observe margin={1.2}>
      <Center>
        <primitive 
          object={scene} 
          scale={scale ?? 1} 
          rotation={rotation ?? [0, 0, 0]} 
          position={position ?? [0, 0, 0]} 
        />
      </Center>
    </Bounds>
  );
}

function FallbackView({ fallbackImage, productName }: { fallbackImage?: string; productName: string }) {
  return (
    <div className="relative h-full w-full bg-[#f8f9fa] flex flex-col items-center justify-center">
      {fallbackImage ? (
        <>
          <Image
            src={fallbackImage}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-md">
            3D preview unavailable
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Box className="h-8 w-8 opacity-50" />
          <span className="text-sm font-medium">3D preview unavailable</span>
        </div>
      )}
    </div>
  );
}

export function ProductViewer({ modelUrl, fallbackImage, productName, modelScale, modelRotation, modelPosition }: ProductViewerProps) {
  const [modelExists, setModelExists] = useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if model URL is reachable
  useEffect(() => {
    if (!modelUrl) {
      setModelExists(false);
      return;
    }
    
    fetch(modelUrl, { method: 'HEAD' })
      .then(res => setModelExists(res.ok))
      .catch(() => setModelExists(false));
  }, [modelUrl]);

  // Handle Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen API not supported or denied", err);
    }
  }, []);

  // Listen to fullscreen changes (e.g. escaping via keyboard)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-rotate interaction logic
  const handleInteraction = useCallback(() => {
    setAutoRotate(false);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setAutoRotate(true);
    }, 3000); // Resume auto-rotate after 3 seconds of inactivity
  }, []);

  const resetCamera = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

  // Render Fallback if no model
  if (modelExists === false || !modelUrl) {
    return (
      <div className="relative aspect-square w-full overflow-hidden bg-[#f8f9fa] sm:aspect-[4/3] lg:aspect-square sm:rounded-3xl shadow-sm ring-1 ring-black/5">
        <FallbackView fallbackImage={fallbackImage} productName={productName} />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "group relative w-full overflow-hidden bg-[#f8f9fa] shadow-inner sm:rounded-3xl ring-1 ring-black/5 transition-all duration-300",
        isFullscreen ? "h-screen rounded-none" : "aspect-square sm:aspect-[4/3] lg:aspect-[4/4]"
      )}
    >
      {/* Loading State */}
      {modelExists === null && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#f8f9fa]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Preparing 3D view...</p>
        </div>
      )}
      
      {/* 3D Canvas */}
      {modelExists === true && (
        <ErrorBoundary fallback={<FallbackView fallbackImage={fallbackImage} productName={productName} />}>
          <Suspense 
            fallback={
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#f8f9fa]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Preparing 3D view...</p>
              </div>
            }
          >
            <Canvas 
              shadows 
              camera={{ position: [0, 1.5, 4], fov: 45 }}
              onPointerDown={handleInteraction}
              onWheel={handleInteraction}
            >
              {/* Premium Lighting Setup */}
              <ambientLight intensity={0.5} />
              <directionalLight 
                position={[5, 10, 5]} 
                intensity={1.2} 
                castShadow 
                shadow-mapSize={1024}
              />
              <Environment preset="city" />
              
              <Model 
                url={modelUrl} 
                scale={modelScale} 
                rotation={modelRotation} 
                position={modelPosition} 
              />
              
              {/* Soft Ground Shadow */}
              <ContactShadows 
                position={[0, -1, 0]} 
                opacity={0.6} 
                scale={10} 
                blur={2} 
                far={4} 
              />
              
              <OrbitControls 
                ref={controlsRef}
                autoRotate={autoRotate}
                autoRotateSpeed={1.5}
                enableDamping={true}
                dampingFactor={0.05}
                enableZoom={true} 
                minDistance={2}
                maxDistance={8}
                minPolarAngle={Math.PI / 6} // Limit how high the camera can go
                maxPolarAngle={Math.PI / 2 + 0.1} // Limit how low (don't go too far under ground)
                makeDefault 
              />
            </Canvas>
          </Suspense>
        </ErrorBoundary>
      )}

      {/* UI Controls Overlay */}
      {modelExists === true && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
          <div className="flex items-center gap-2 rounded-full bg-white/80 p-1.5 shadow-lg backdrop-blur-md ring-1 ring-black/5 pointer-events-auto">
            <button 
              onClick={resetCamera}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-black/5 active:scale-95"
              aria-label="Reset Camera"
              title="Reset Camera"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            
            <div className="h-6 w-px bg-gray-200" />
            
            <button 
              onClick={toggleFullscreen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-black/5 active:scale-95"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
