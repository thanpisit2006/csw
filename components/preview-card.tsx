"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WallpaperCanvas } from "@/components/wallpaper-canvas";
import { useViewportStore } from "@/stores/use-viewport-store";

export function PreviewCard() {
  const width = useViewportStore((s) => s.width);
  const height = useViewportStore((s) => s.height);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <div className="text-xs text-[var(--muted)] font-mono">
          {width}×{height}px
        </div>
      </CardHeader>

      <WallpaperCanvas />

      <CardContent>
        <p className="m-0 text-xs text-[var(--muted)] leading-relaxed">
          • Drag to reposition.
          <br />
          • Scroll to zoom (desktop). Pinch to zoom (mobile).
          <br />• No black bars—always stays cover.
        </p>
      </CardContent>
    </Card>
  );
}
