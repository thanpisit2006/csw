"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DeviceSelector } from "@/components/device-selector";
import { ScheduleSelector } from "@/components/schedule-selector";
import { BackgroundUploader } from "@/components/background-uploader";
import { JsonScheduleEditor } from "@/components/json-schedule-editor";
import { CourseColorEditor } from "@/components/course-color-editor";
import { ShareScheduleButton } from "@/components/share-schedule-button";
import { Button } from "@/components/ui/button";
import { useViewportStore } from "@/stores/use-viewport-store";
import { useAuthStore } from "@/stores/use-auth-store";
import { trackDownload } from "@/lib/logger";
import { DEVICE_PRESETS } from "@/lib/constants";
import { toast } from "sonner";

export function CustomizeCard() {
  const width = useViewportStore((s) => s.width);
  const height = useViewportStore((s) => s.height);
  const selectedDeviceId = useViewportStore((s) => s.selectedDeviceId);
  const recenter = useViewportStore((s) => s.recenter);

  const user = useAuthStore((s) => s.user);

  const handleReset = () => {
    recenter();
    toast.info("Reset.");
  };

  const handleDownload = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      toast.error("Couldn't save.");
      return;
    }
    toast.info("Preparing wallpaper export…");

    const preset = DEVICE_PRESETS.find((p) => p.id === selectedDeviceId);
    const category = preset ? preset.label : `Custom (${width}×${height})`;
    const fileName = `schedule-wallpaper_${width}x${height}.png`;

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          toast.error("Couldn't save image.");
          return;
        }
        const a = document.createElement("a");
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Saved wallpaper.");

        // Record Download Activity & History
        await trackDownload({
          fileId: `file_${width}x${height}`,
          fileName,
          category,
          user: user?.name || "Guest User",
          studentId: user?.studentId || "GUEST",
        });
      },
      "image/png",
      1.0
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Customize</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4">
          <DeviceSelector />
          <ScheduleSelector />
          <BackgroundUploader />

          {/* Color picker per course */}
          <CourseColorEditor />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
            <Button
              type="button"
              variant="default"
              onClick={handleReset}
              className="min-h-[44px] w-full flex items-center justify-center text-xs font-semibold"
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleDownload}
              className="min-h-[44px] w-full flex items-center justify-center text-xs font-semibold"
            >
              Download
            </Button>
            <div className="min-h-[44px] w-full flex">
              <ShareScheduleButton />
            </div>
          </div>

          <JsonScheduleEditor />

          <div className="mt-1 text-xs text-[var(--muted)] text-center sm:text-left">
            Tip: Double‑click the preview to reset.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
