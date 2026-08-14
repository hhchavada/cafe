"use client";

import React, { useRef, useCallback, useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, Center, Bounds } from "@react-three/drei";
import * as THREE from "three";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface ProductViewerProps {
  modelUrl: string;
}

function Model({ url }: { url: string }) {
  // Use the official Google Draco decoder CDN so compressed geometries can be decoded
  const { scene } = useGLTF(url, "https://www.gstatic.com/draco/v1/decoders/");
  
  // Enable shadows on all meshes
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

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("3D Model failed to load:", error);
  }

  resetError = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background p-4 text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-8 w-8 text-destructive opacity-80" />
          </div>
          <h3 className="font-serif text-lg tracking-widest uppercase text-foreground mb-2">
            3D View Unavailable
          </h3>
          <p className="text-sm text-muted-foreground font-light mb-6 max-w-[250px]">
            Please try again.
          </p>
          <button 
            onClick={this.resetError}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-card-border hover:bg-muted transition-colors text-xs font-semibold tracking-widest uppercase text-foreground"
          >
            <RefreshCw className="h-3 w-3" />
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ProductViewer({ modelUrl }: ProductViewerProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate interaction logic
  const handleInteraction = useCallback(() => {
    setAutoRotate(false);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setAutoRotate(true);
    }, 2000); // Resume auto-rotate after 2 seconds
  }, []);

  return (
    <div className="relative h-full w-full bg-background cursor-grab active:cursor-grabbing">
      <ModelErrorBoundary>
        <Suspense fallback={null}>
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
            
            <Model url={modelUrl} />
            
            {/* Soft Ground Shadow */}
            <ContactShadows 
              position={[0, -1, 0]} 
              opacity={0.6} 
              scale={10} 
              blur={2} 
              far={4} 
            />
            
            <OrbitControls 
              autoRotate={autoRotate}
              autoRotateSpeed={1.0}
              enableDamping={true}
              dampingFactor={0.05}
              enableZoom={true} 
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
