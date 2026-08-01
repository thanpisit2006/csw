"use client";

import React, { useRef } from "react";
import { useViewportStore } from "@/stores/use-viewport-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BackgroundUploader() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const bgTitle = useViewportStore((s) => s.bgTitle);
  const bgFilename = useViewportStore((s) => s.bgFilename);
  const isCustomBg = useViewportStore((s) => s.isCustomBg);
  const bgObjectUrl = useViewportStore((s) => s.bgObjectUrl);
  const setCustomBackground = useViewportStore((s) => s.setCustomBackground);
  const resetToDefaultBackground = useViewportStore((s) => s.resetToDefaultBackground);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomBackground(file);
    toast.success("Updated image background.");
  };

  const handleResetDefault = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    resetToDefaultBackground();
    toast.info("Reverted to default background.");
  };

  return (
    <div className="grid gap-2">
      <label className="text-xs text-[var(--muted)] tracking-wider">Background</label>
      <div className="flex items-center justify-between gap-3 p-3 rounded-[18px] border border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_75%,transparent)]">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-13 h-13 rounded-[14px] border border-[color-mix(in_oklab,var(--border)_85%,transparent)] overflow-hidden relative bg-[color-mix(in_oklab,var(--chip)_60%,transparent)] shrink-0 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {!isCustomBg && (
              <div className="absolute inset-0 bg-[radial-gradient(16px_16px_at_30%_30%,rgba(255,255,255,0.22),transparent_60%),linear-gradient(135deg,color-mix(in_oklab,var(--accent)_40%,#fff),color-mix(in_oklab,var(--bg)_70%,#000))]" />
            )}
            {/* eslint-disable-next-html-element-suppress */}
            <img
              src={isCustomBg && bgObjectUrl ? bgObjectUrl : "assets/default-bg.jpg"}
              alt="Background thumbnail"
              className="w-full h-full object-cover relative z-10"
            />
          </div>

          <div className="min-w-0 grid gap-0.5">
            <div className="font-black text-sm tracking-tight text-[var(--text)] truncate">
              {bgTitle}
            </div>
            <div className="text-xs text-[var(--muted)] truncate font-mono">
              {bgFilename}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="default"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose photo
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={!isCustomBg}
            onClick={handleResetDefault}
          >
            Use default
          </Button>
        </div>
      </div>
    </div>
  );
}
