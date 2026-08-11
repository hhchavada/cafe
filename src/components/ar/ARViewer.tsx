"use client";

import React, { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { Scan } from "lucide-react";

interface ARViewerProps {
  modelUrl: string;
  iosModelUrl?: string;
  productName: string;
  arConfig?: {
    scale?: number;
    orientation?: string;
    placement?: "floor" | "wall";
  };
}

export function ARViewer({ modelUrl, iosModelUrl, productName, arConfig }: ARViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [arStatus, setArStatus] = useState<"not-presenting" | "session-started" | "object-placed">("not-presenting");
  const [arTracking, setArTracking] = useState<"tracking" | "not-tracking">("not-tracking");
  const modelViewerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  useEffect(() => {
    const mv = modelViewerRef.current;
    if (!mv) return;

    const handleARStatus = (e: Event) => {
      const customEvent = e as CustomEvent;
      setArStatus(customEvent.detail.status);
    };

    const handleARTracking = (e: Event) => {
      const customEvent = e as CustomEvent;
      setArTracking(customEvent.detail.status);
    };

    mv.addEventListener('ar-status', handleARStatus);
    mv.addEventListener('ar-tracking', handleARTracking);

    return () => {
      mv.removeEventListener('ar-status', handleARStatus);
      mv.removeEventListener('ar-tracking', handleARTracking);
    };
  }, [isMounted]);

  if (!isMounted) return null;

  const scaleValue = arConfig?.scale ? `${arConfig.scale} ${arConfig.scale} ${arConfig.scale}` : "1 1 1";
  const orientationValue = arConfig?.orientation || "0deg 0deg 0deg";
  const placementValue = arConfig?.placement || "floor";

  return (
    <>
      <Script 
        type="module" 
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
        strategy="lazyOnload"
      />
      
      <div className="mt-6 w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h3 className="mb-4 text-center text-xs font-bold tracking-widest text-gray-400 uppercase">
          Augmented Reality
        </h3>

        {isMobile ? (
          <div className="flex flex-col items-center justify-center">
            <p className="mb-4 text-center text-sm font-medium text-gray-600">
              See it on your table.<br />
              <span className="text-xs text-gray-500 font-normal mt-1 block">
                Place the dish in your space and explore it at real size.
              </span>
            </p>
            
            {/* @ts-expect-error model-viewer is a custom web component */}
            <model-viewer
              ref={modelViewerRef}
              src={modelUrl}
              ios-src={iosModelUrl}
              alt={`A 3D model of ${productName}`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-placement={placementValue}
              scale={scaleValue}
              orientation={orientationValue}
              shadow-intensity="1"
              reveal="manual"
              className="w-full flex justify-center bg-transparent"
              style={{ width: '100%', height: '52px' }}
            >
              {/* Custom WebXR DOM Overlay (Only visible in Android WebXR) */}
              <div 
                id="ar-ui" 
                className={`absolute inset-0 z-50 flex flex-col items-center justify-end pb-12 transition-opacity duration-300 pointer-events-none ${arStatus === "not-presenting" ? "opacity-0 hidden" : "opacity-100"}`}
              >
                <div className="bg-black/70 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm font-medium shadow-lg pointer-events-auto">
                  {arStatus === "session-started" && arTracking === "not-tracking" && "Move your phone slowly to find a table..."}
                  {arStatus === "session-started" && arTracking === "tracking" && "Tap the screen to place"}
                  {arStatus === "object-placed" && "Drag to move • Pinch to resize"}
                </div>
              </div>

              <button 
                slot="ar-button" 
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-black px-6 text-sm font-semibold tracking-wide text-white shadow-md transition-all active:scale-95"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  transform: 'none',
                  margin: '0',
                  border: 'none',
                }}
              >
                <Scan className="h-5 w-5" />
                VIEW IN AR
              </button>
            {/* @ts-expect-error model-viewer is a custom web component */}
            </model-viewer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-3">
            <div className="mb-3 rounded-full bg-gray-50 p-3">
              <Scan className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-center text-sm font-medium text-gray-600">
              View in AR is available on supported mobile devices.
            </p>
            <p className="mt-1 text-center text-xs text-gray-400">
              Scan the QR code on your phone to see this item on your table.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
