"use client";

import React, { useRef, useCallback, useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, Center, Bounds } from "@react-three/drei";
import * as THREE from "three";
import { Loader2, AlertCircle, RefreshCw, MousePointer2, X } from "lucide-react";

interface ProductViewerProps {
  modelUrl: string;
  interactiveMode?: "auto" | "click-to-interact" | "display";
}

// ... Model and ModelErrorBoundary remain same ...
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url, "https://www.gstatic.com/draco/v1/decoders/");
  useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);
  return (
    <Bounds fit clip observe margin={1.2}>
      <Center>
        <primitive object={scene} />
      </Center>
    </Bounds>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ModelErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: unknown) { console.error("3D Model failed to load:", error); }
  resetError = () => { this.setState({ hasError: false }); };
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background p-4 text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-8 w-8 text-destructive opacity-80" />
          </div>
          <h3 className="font-serif text-lg tracking-widest uppercase text-foreground mb-2">3D View Unavailable</h3>
          <p className="text-sm text-muted-foreground font-light mb-6 max-w-[250px]">Please try again.</p>
          <button onClick={this.resetError} className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-card-border hover:bg-muted transition-colors text-xs font-semibold tracking-widest uppercase text-foreground">
            <RefreshCw className="h-3 w-3" />
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ProductViewer({ modelUrl, interactiveMode = "auto" }: ProductViewerProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [isInteracting, setIsInteracting] = useState(interactiveMode === "auto");
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInteraction = useCallback(() => {
    if (!isInteracting || interactiveMode === "display") return;
    setAutoRotate(false);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setAutoRotate(true);
    }, 2000);
  }, [isInteracting, interactiveMode]);

  const LoaderOverlay = (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
      </div>
    </div>
  );

  return (
    <div className={`relative h-full w-full bg-[#110e0c] overflow-hidden ${interactiveMode === "display" ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}>
      
      {/* Click-to-interact Overlay */}
      {interactiveMode === "click-to-interact" && !isInteracting && (
        <div 
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 cursor-pointer group hover:bg-black/20 transition-colors"
          onClick={() => setIsInteracting(true)}
        >
          <div className="px-6 py-3 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-transform group-hover:scale-105 shadow-2xl flex items-center gap-2">
            <MousePointer2 className="w-4 h-4 text-accent" />
            Tap to Interact
          </div>
        </div>
      )}

      {/* Done Interacting Button */}
      {interactiveMode === "click-to-interact" && isInteracting && (
        <div className="absolute top-6 right-6 z-20 animate-in fade-in zoom-in duration-300 pointer-events-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsInteracting(false); setAutoRotate(true); }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform active:scale-90 border border-white/20 shadow-xl hover:bg-black/80"
            title="Lock 3D View"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <ModelErrorBoundary>
        <Suspense fallback={LoaderOverlay}>
          <Canvas 
            shadows 
            camera={{ position: [0, 1.5, 4], fov: 45 }}
            onPointerDown={handleInteraction}
            onWheel={handleInteraction}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize={1024} />
            <Environment preset="city" />
            
            <Model url={modelUrl} />
            
            <ContactShadows position={[0, -1, 0]} opacity={0.6} scale={10} blur={2} far={4} />
            
            <OrbitControls 
              autoRotate={autoRotate}
              autoRotateSpeed={1.0}
              enableDamping={true}
              dampingFactor={0.05}
              enableZoom={isInteracting && interactiveMode !== "display"} 
              enablePan={isInteracting && interactiveMode !== "display"}
              enableRotate={isInteracting && interactiveMode !== "display"}
              minDistance={2}
              maxDistance={8}
              minPolarAngle={Math.PI / 6} 
              maxPolarAngle={Math.PI / 2 + 0.1} 
              makeDefault 
            />
          </Canvas>
        </Suspense>
      </ModelErrorBoundary>
    </div>
  );
}
