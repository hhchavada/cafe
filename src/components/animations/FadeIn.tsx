"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number; // in ms
  className?: string;
  animateOnce?: boolean;
}

export function FadeIn({ children, delay = 0, className, animateOnce = true }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          if (animateOnce && domRef.current) {
            observer.unobserve(domRef.current);
          }
        } else if (!animateOnce) {
          setIsVisible(false);
        }
      });
    });
    
    if (domRef.current) {
      observer.observe(domRef.current);
    }
    
    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, [animateOnce, delay]);

  return (
    <div
      ref={domRef}
      className={cn(
        "transition-all duration-1000 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
