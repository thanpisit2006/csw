import React from "react";
import { BrandLogo } from "@/components/ui/brand-logo";

export function PulseLoader({ text = "Loading…" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <div className="relative flex items-center justify-center">
        {/* Soft breathing glowing background aura */}
        <div className="absolute w-12 h-12 rounded-full bg-[var(--accent)] opacity-30 animate-pulse-glow blur-md" />
        <BrandLogo className="w-10 h-10 relative z-10 animate-pulse-glow" />
      </div>
      {text && (
        <span className="text-xs font-semibold text-[var(--muted)] tracking-tight">
          {text}
        </span>
      )}
    </div>
  );
}
