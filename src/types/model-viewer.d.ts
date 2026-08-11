import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          "ios-src"?: string;
          ar?: boolean;
          "ar-modes"?: string;
          "ar-scale"?: string;
          "camera-controls"?: boolean;
          "disable-zoom"?: boolean;
          "auto-rotate"?: boolean;
          reveal?: string;
          alt?: string;
        },
        HTMLElement
      >;
    }
  }
}
