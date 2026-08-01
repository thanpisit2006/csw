"use client";

import React from "react";
import { useViewportStore } from "@/stores/use-viewport-store";
import { DEVICE_PRESETS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function DeviceSelector() {
  const selectedDeviceId = useViewportStore((s) => s.selectedDeviceId);
  const isCustom = useViewportStore((s) => s.isCustom);
  const customWidth = useViewportStore((s) => s.customWidth);
  const customHeight = useViewportStore((s) => s.customHeight);
  const setDevice = useViewportStore((s) => s.setDevice);
  const setCustomDimensions = useViewportStore((s) => s.setCustomDimensions);

  return (
    <div className="grid gap-2">
      <label className="text-xs text-[var(--muted)] tracking-wider">Device size</label>
      <Select value={selectedDeviceId} onValueChange={setDevice}>
        <SelectTrigger>
          <SelectValue placeholder="Select device size" />
        </SelectTrigger>
        <SelectContent>
          {DEVICE_PRESETS.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom…</SelectItem>
        </SelectContent>
      </Select>

      {isCustom && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          <div className="grid gap-2">
            <label htmlFor="cw" className="text-xs text-[var(--muted)]">
              Width (px)
            </label>
            <Input
              id="cw"
              type="number"
              min={200}
              max={8000}
              step={1}
              value={customWidth}
              onChange={(e) =>
                setCustomDimensions(Number(e.target.value), customHeight)
              }
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="ch" className="text-xs text-[var(--muted)]">
              Height (px)
            </label>
            <Input
              id="ch"
              type="number"
              min={200}
              max={8000}
              step={1}
              value={customHeight}
              onChange={(e) =>
                setCustomDimensions(customWidth, Number(e.target.value))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
