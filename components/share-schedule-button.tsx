"use client";

import React from "react";
import { useScheduleStore } from "@/stores/use-schedule-store";
import { useViewportStore } from "@/stores/use-viewport-store";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareScheduleButton() {
  const getActiveSchedule = useScheduleStore((s) => s.getActiveSchedule);
  const getActiveTitle = useScheduleStore((s) => s.getActiveTitle);
  const width = useViewportStore((s) => s.width);
  const height = useViewportStore((s) => s.height);

  const handleShare = () => {
    try {
      const payload = {
        title: getActiveTitle(),
        courses: getActiveSchedule(),
        width,
        height,
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const url = `${window.location.origin}/view?s=${encoded}`;
      navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard!");
    } catch {
      toast.error("Failed to generate share link.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-full min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)] border border-[color-mix(in_oklab,var(--border)_80%,transparent)] rounded-xl px-4 py-2 transition-colors hover:border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--card2)_60%,transparent)] cursor-pointer"
    >
      <Share2 className="w-3.5 h-3.5" />
      Share
    </button>
  );
}
