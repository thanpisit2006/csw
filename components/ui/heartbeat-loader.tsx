import React from "react";

export function HeartbeatEKG({ text = "Loading system data…" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 text-center">
      <div className="relative w-48 h-14 overflow-hidden flex items-center justify-center">
        {/* Moving SVG EKG Heartbeat Line */}
        <svg
          viewBox="0 0 200 60"
          className="w-full h-full text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M 0 30 L 40 30 L 50 15 L 60 45 L 75 5 L 90 55 L 100 25 L 110 35 L 120 30 L 200 30"
            className="animate-ekg-path"
          />
        </svg>
      </div>

      {text && (
        <span className="text-xs font-semibold text-[var(--muted)] tracking-tight animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}
