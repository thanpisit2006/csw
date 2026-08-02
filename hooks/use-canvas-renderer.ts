import { useEffect, useCallback, RefObject } from "react";
import { useViewportStore } from "@/stores/use-viewport-store";
import { useScheduleStore } from "@/stores/use-schedule-store";
import { computeCrop, clamp } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_LABELS: Record<string, string> = {
  Mon: "MON", Tue: "TUE", Wed: "WED", Thu: "THU", Fri: "FRI",
};
const TIME_START = 8.5;
const TIME_END = 16.5;

function fmtTime(t: number): string {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function useCanvasRenderer(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const width = useViewportStore((s) => s.width);
  const height = useViewportStore((s) => s.height);
  const zoom = useViewportStore((s) => s.zoom);
  const sx = useViewportStore((s) => s.sx);
  const sy = useViewportStore((s) => s.sy);
  const bgImgElement = useViewportStore((s) => s.bgImgElement);
  const defaultBgElement = useViewportStore((s) => s.defaultBgElement);
  const setCropOffset = useViewportStore((s) => s.setCropOffset);
  const setCropKey = useViewportStore((s) => s.setCropKey);
  const cropKey = useViewportStore((s) => s.cropKey);

  const getActiveSchedule = useScheduleStore((s) => s.getActiveSchedule);
  const getActiveTitle = useScheduleStore((s) => s.getActiveTitle);
  const activeScheduleId = useScheduleStore((s) => s.activeScheduleId);
  const schedulesList = useScheduleStore((s) => s.schedulesList);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const W = width;
    const H = height;

    // ─────────────────────────────────────────────────────────────────────────
    // drawBackground()  — identical to original
    // ─────────────────────────────────────────────────────────────────────────
    const img = bgImgElement || defaultBgElement;

    if (!img) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    } else {
      const imgKey = `${img.src || "mem"}::${img.naturalWidth}x${img.naturalHeight}`;
      let curSx = sx;
      let curSy = sy;

      if (cropKey !== imgKey) {
        const crop = computeCrop(img, W, H, zoom);
        curSx = crop.sxMax / 2;
        curSy = crop.syMax / 2;
        setCropOffset(curSx, curSy);
        setCropKey(imgKey);
      }

      const crop = computeCrop(img, W, H, zoom);
      const validSx = clamp(curSx, crop.sxMin, crop.sxMax);
      const validSy = clamp(curSy, crop.syMin, crop.syMax);
      ctx.drawImage(img, validSx, validSy, crop.sw, crop.sh, 0, 0, W, H);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // drawSchedule()  — ported directly from original app.js
    // Layout: 5 day columns (x-axis), time flows vertically (y-axis)
    // ─────────────────────────────────────────────────────────────────────────
    const FONT_SCALE = 1.3;

    const panelW = Math.round(W * 0.80);
    const panelH = Math.round(H * 0.46);
    const panelX = Math.round((W - panelW) / 2);

    const aspect = H / W;
    const topFrac = aspect >= 2.05 ? 0.29 : aspect >= 1.85 ? 0.27 : 0.24;
    const panelY = Math.round(H * topFrac);

    // Helper: draw a rounded rectangle path (mirrors original roundRect)
    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }

    // Glass panel background: Semi-transparent soft black (72% opacity), light blur glassmorphism, low opacity border, gentle shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.40)";
    ctx.shadowBlur = Math.round(W * 0.025);
    ctx.shadowOffsetY = Math.round(W * 0.01);

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "rgba(0, 0, 0, 0.40)"; // Soft black overlay (approx 72% opacity)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)"; // Low-opacity soft white border
    ctx.lineWidth = Math.max(1.5, Math.round(W * 0.002));
    roundRect(panelX, panelY, panelW, panelH, Math.round(W * 0.038));
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Inner grid bounds
    const ix = panelX + Math.round(panelW * 0.06);
    const iy = panelY + Math.round(panelH * 0.14);
    const iw = panelW - Math.round(panelW * 0.12);
    const ih = panelH - Math.round(panelH * 0.20);

    // Schedule title (top-left of panel)
    const titleText = getActiveTitle() || "iCPE 2/2025";
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${Math.max(20, Math.round(W * 0.019 * FONT_SCALE))}px ui-sans-serif, system-ui`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(titleText, panelX + Math.round(panelW * 0.07), panelY + Math.round(panelH * 0.10));

    const useDays = DAYS;
    const cols = useDays.length;
    const rows = 8;
    const colW = iw / cols;
    const rowH = ih / rows;

    // Grid lines
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
    ctx.lineWidth = 1;
    for (let c = 0; c <= cols; c++) {
      const x = ix + c * colW;
      ctx.beginPath();
      ctx.moveTo(x, iy);
      ctx.lineTo(x, iy + ih);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      const y = iy + r * rowH;
      ctx.beginPath();
      ctx.moveTo(ix, y);
      ctx.lineTo(ix + iw, y);
      ctx.stroke();
    }
    ctx.restore();

    // Day labels (above grid)
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = `800 ${Math.max(12, Math.round(W * 0.012 * FONT_SCALE))}px ui-sans-serif, system-ui`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    useDays.forEach((d, i) => {
      ctx.fillText(DAY_LABELS[d] || d, ix + i * colW + 6, iy - 10);
    });

    // Course event blocks
    const tRange = TIME_END - TIME_START;
    const activeSchedule = getActiveSchedule();

    activeSchedule.forEach((item) => {
      const dayIndex = useDays.indexOf(item.day);
      if (dayIndex === -1) return;

      const s = Math.max(TIME_START, item.start);
      const e = Math.min(TIME_END, item.end);
      if (e <= s) return;

      // Y positions based on time (time flows top-to-bottom)
      const y1 = iy + ((s - TIME_START) / tRange) * ih;
      const y2 = iy + ((e - TIME_START) / tRange) * ih;

      // Block bounds
      const bx = ix + dayIndex * colW + 5;
      const by = y1 + 5;
      const bw = colW - 10;
      const bh = y2 - y1 - 10;

      if (bw <= 0 || bh <= 0) return;

      // Soft dark cell fill with gentle shadow and low opacity border
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;

      ctx.globalAlpha = 0.95;
      ctx.fillStyle = item.color || "rgba(30, 41, 59, 0.90)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      roundRect(bx, by, bw, bh, 14);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Course text - Black typography inside schedule cells
      ctx.save();
      const titleSize = Math.max(14, Math.round(W * 0.014 * FONT_SCALE));
      const subSize = Math.max(11, Math.round(W * 0.011 * FONT_SCALE));

      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // 1. Subject Name: Black, bold, slightly larger
      ctx.fillStyle = "#000000";
      ctx.font = `800 ${titleSize}px ui-sans-serif, system-ui`;
      const titleTextStr = item.title || "";
      const maxTitleWidth = bw - 20;

      let displayTitle = titleTextStr;
      if (ctx.measureText(displayTitle).width > maxTitleWidth) {
        while (displayTitle.length > 3 && ctx.measureText(displayTitle + "…").width > maxTitleWidth) {
          displayTitle = displayTitle.slice(0, -1);
        }
        displayTitle += "…";
      }
      ctx.fillText(displayTitle, bx + 10, by + 10);

      // 2. Time Text: Black with solid readability (90% opacity)
      ctx.font = `600 ${subSize}px ui-sans-serif, system-ui`;
      ctx.fillStyle = "rgba(0, 0, 0, 0.90)";
      ctx.fillText(
        `${fmtTime(item.start)}–${fmtTime(item.end)}`,
        bx + 10,
        by + 10 + titleSize + 5
      );

      // 3. Room / Instructor: Black with slightly lighter opacity (75% opacity)
      if (item.room) {
        ctx.font = `500 ${subSize}px ui-sans-serif, system-ui`;
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillText(
          item.room,
          bx + 10,
          by + 10 + titleSize + 5 + subSize + 4
        );
      }
      ctx.restore();
    });
  }, [
    canvasRef,
    width,
    height,
    zoom,
    sx,
    sy,
    bgImgElement,
    defaultBgElement,
    cropKey,
    setCropOffset,
    setCropKey,
    getActiveSchedule,
    getActiveTitle,
    activeScheduleId,
    schedulesList,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return renderCanvas;
}
