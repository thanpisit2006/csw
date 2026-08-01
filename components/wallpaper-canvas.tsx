"use client";

import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useViewportStore } from "@/stores/use-viewport-store";
import { useCanvasRenderer } from "@/hooks/use-canvas-renderer";
import { usePanZoom } from "@/hooks/use-pan-zoom";
import { CONFIG } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export function WallpaperCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const width = useViewportStore((s) => s.width);
  const height = useViewportStore((s) => s.height);
  const isLoading = useViewportStore((s) => s.isLoading);
  const setDefaultBgElement = useViewportStore((s) => s.setDefaultBgElement);

  const [frameDimensions, setFrameDimensions] = useState<{ width: number; height: number }>({
    width: 320,
    height: 600,
  });

  useCanvasRenderer(canvasRef);
  usePanZoom(canvasRef);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setDefaultBgElement(img);
    };
    img.src = CONFIG.defaultBgSrc;
  }, [setDefaultBgElement]);

  // Precision algorithm calculating exact aspect ratio fit without extra margins or overflow
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const computeSize = () => {
      // 1. Single source of truth for device ratio
      const targetAspect = width / height;

      // 2. Parent available width (subtracting inner container padding)
      const computedStyle = window.getComputedStyle(container);
      const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
      const availableWidth = container.clientWidth - paddingX;

      // 3. Viewport available height (deducting header ~64px, margins & padding ~120px)
      const isMobile = window.innerWidth < 768;
      const maxViewportHeight = Math.max(280, window.innerHeight - (isMobile ? 140 : 200));

      // 4. Algorithm: Maximize preview size fitting both bounds
      let fitWidth = availableWidth;
      let fitHeight = fitWidth / targetAspect;

      if (fitHeight > maxViewportHeight) {
        fitHeight = maxViewportHeight;
        fitWidth = fitHeight * targetAspect;
      }

      setFrameDimensions({
        width: Math.round(fitWidth),
        height: Math.round(fitHeight),
      });
    };

    computeSize();

    const observer = new ResizeObserver(computeSize);
    observer.observe(container);
    window.addEventListener("resize", computeSize);
    window.addEventListener("orientationchange", computeSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", computeSize);
      window.removeEventListener("orientationchange", computeSize);
    };
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-center p-2 sm:p-4 bg-gradient-to-b from-[color-mix(in_oklab,var(--card2)_55%,transparent)] to-transparent rounded-[32px] select-none"
    >
      <div
        className="rounded-[38px] p-3.5 bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] border border-[color-mix(in_oklab,var(--border)_75%,transparent)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--border)_45%,transparent),0_20px_50px_rgba(0,0,0,0.15)] relative flex items-center justify-center overflow-hidden transition-[width,height] duration-200 ease-out mx-auto shrink-0"
        style={{
          width: `${frameDimensions.width}px`,
          height: `${frameDimensions.height}px`,
          aspectRatio: `${width} / ${height}`,
        }}
      >
        {isLoading && (
          <div className="absolute inset-3.5 rounded-[28px] bg-[color-mix(in_oklab,var(--bg)_50%,transparent)] border border-[color-mix(in_oklab,var(--border)_60%,transparent)] flex flex-col items-center justify-center gap-2.5 backdrop-blur-md z-20">
            <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
            <div className="text-xs text-[var(--muted)] font-medium">Updating…</div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-[28px] bg-[color-mix(in_oklab,var(--bg)_85%,#111)] block cursor-grab active:cursor-grabbing touch-none select-none"
        />
      </div>
    </div>
  );
}
