"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { Scan } from "lucide-react";

interface ARViewerProps {
  modelUrl: string;
  iosModelUrl?: string;
  productName: string;
}

export function ARViewer({ modelUrl, iosModelUrl, productName }: ARViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    // Basic check to determine if device might support mobile AR (iOS/Android)
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  if (!isMounted) return null;

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
              Point your camera at a flat surface.<br />
              Tap to place the {productName.toLowerCase()}.
            </p>
            
            {/* model-viewer is used purely as an AR launcher here. 
                reveal="manual" prevents it from loading the 3D scene in the browser. */}
            {/* @ts-expect-error model-viewer is a custom web component */}
            <model-viewer
              src={modelUrl}
              ios-src={iosModelUrl}
              alt={`A 3D model of ${productName}`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              reveal="manual"
              className="w-full flex justify-center"
              style={{ width: '100%', height: '52px' }}
            >
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
