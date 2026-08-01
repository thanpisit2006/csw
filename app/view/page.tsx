"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WallpaperCanvas } from "@/components/wallpaper-canvas";
import { useScheduleStore } from "@/stores/use-schedule-store";
import { useViewportStore } from "@/stores/use-viewport-store";
import { ScheduleItem } from "@/lib/types";
import { Loader2, Share2, Download } from "lucide-react";
import { toast } from "sonner";

interface SharedPayload {
  title: string;
  courses: ScheduleItem[];
  width: number;
  height: number;
}

function ViewContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [sharedTitle, setSharedTitle] = useState("");

  const createSchedule = useScheduleStore((s) => s.createSchedule);
  const setCustomDimensions = useViewportStore((s) => s.setCustomDimensions);

  useEffect(() => {
    const s = searchParams.get("s");
    if (!s) {
      setStatus("error");
      return;
    }
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(s)))) as SharedPayload;
      createSchedule({
        title: decoded.title + " (Shared)",
        semester: "shared",
        academicYear: String(new Date().getFullYear()),
        status: "published",
        courses: decoded.courses,
      });
      setCustomDimensions(decoded.width, decoded.height);
      setSharedTitle(decoded.title);
      setStatus("loaded");
    } catch {
      setStatus("error");
    }
  }, [searchParams, createSchedule, setCustomDimensions]);

  const handleDownload = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) { toast.error("Canvas not ready."); return; }
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `schedule-wallpaper-shared.png`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Wallpaper saved!");
    }, "image/png", 1.0);
  };

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
      <span className="text-sm text-[var(--muted)]">Loading shared schedule…</span>
    </div>
  );

  if (status === "error") return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] gap-4 p-6 text-center">
      <div className="text-5xl">🔗</div>
      <h1 className="text-xl font-black text-[var(--text)]">Invalid Share Link</h1>
      <p className="text-sm text-[var(--muted)]">This link is broken or expired. Ask your classmate to share it again.</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <div className="border-b border-[var(--border)] px-5 py-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-bold text-[var(--muted)]">Shared Schedule Preview</span>
          </div>
          <h1 className="font-extrabold text-sm text-[var(--text)]">{sharedTitle}</h1>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-2 text-xs font-bold bg-[var(--accent)] text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          <Download className="w-3.5 h-3.5" /> Save Wallpaper
        </button>
      </div>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[360px]">
          <WallpaperCanvas />
        </div>
      </main>
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
        <span className="text-sm text-[var(--muted)]">Loading…</span>
      </div>
    }>
      <ViewContent />
    </Suspense>
  );
}
