import { useRef, useCallback, useEffect, RefObject } from "react";
import { useViewportStore } from "@/stores/use-viewport-store";
import { computeCrop, clamp } from "@/lib/utils";
import { CONFIG } from "@/lib/constants";

export function usePanZoom(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const width = useViewportStore((s) => s.width);
  const height = useViewportStore((s) => s.height);
  const zoom = useViewportStore((s) => s.zoom);
  const sx = useViewportStore((s) => s.sx);
  const sy = useViewportStore((s) => s.sy);
  const setZoom = useViewportStore((s) => s.setZoom);
  const setCropOffset = useViewportStore((s) => s.setCropOffset);
  const recenter = useViewportStore((s) => s.recenter);
  const bgImgElement = useViewportStore((s) => s.bgImgElement);
  const defaultBgElement = useViewportStore((s) => s.defaultBgElement);

  const getActiveImg = useCallback(() => bgImgElement || defaultBgElement, [bgImgElement, defaultBgElement]);

  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartDistRef = useRef(0);
  const pinchStartZoomRef = useRef(1);

  const panBy = useCallback(
    (dxCanvasPx: number, dyCanvasPx: number) => {
      const img = getActiveImg();
      if (!img) return;

      const crop = computeCrop(img, width, height, zoom);
      const newSx = clamp(sx - dxCanvasPx / crop.scale, crop.sxMin, crop.sxMax);
      const newSy = clamp(sy - dyCanvasPx / crop.scale, crop.syMin, crop.syMax);
      setCropOffset(newSx, newSy);
    },
    [getActiveImg, width, height, zoom, sx, sy, setCropOffset]
  );

  const zoomAt = useCallback(
    (clientX: number, clientY: number, newZoom: number) => {
      const img = getActiveImg();
      const canvas = canvasRef.current;
      if (!img || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const px = (clientX - rect.left) * (width / rect.width);
      const py = (clientY - rect.top) * (height / rect.height);

      const oldZoom = zoom;
      const z = clamp(newZoom, CONFIG.zoom.min, CONFIG.zoom.max);
      if (z === oldZoom) return;

      const oldCrop = computeCrop(img, width, height, oldZoom);
      const srcX = sx + px / oldCrop.scale;
      const srcY = sy + py / oldCrop.scale;

      setZoom(z);

      const newCrop = computeCrop(img, width, height, z);
      const newSx = clamp(srcX - px / newCrop.scale, newCrop.sxMin, newCrop.sxMax);
      const newSy = clamp(srcY - py / newCrop.scale, newCrop.syMin, newCrop.syMax);
      setCropOffset(newSx, newSy);
    },
    [getActiveImg, canvasRef, width, height, zoom, sx, sy, setZoom, setCropOffset]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const handlePointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointersRef.current.size === 1) {
        isDraggingRef.current = true;
        canvas.classList.add("isDragging");
        lastXRef.current = e.clientX;
        lastYRef.current = e.clientY;
      }

      if (pointersRef.current.size === 2) {
        const [p1, p2] = [...pointersRef.current.values()];
        pinchStartDistRef.current = dist(p1, p2);
        pinchStartZoomRef.current = useViewportStore.getState().zoom;
        isDraggingRef.current = false;
        canvas.classList.remove("isDragging");
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointersRef.current.size === 2) {
        const [p1, p2] = [...pointersRef.current.values()];
        const d = dist(p1, p2);
        if (pinchStartDistRef.current > 0) {
          const factor = d / pinchStartDistRef.current;
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          zoomAt(midX, midY, pinchStartZoomRef.current * factor);
        }
        return;
      }

      if (!isDraggingRef.current) return;

      const dx = e.clientX - lastXRef.current;
      const dy = e.clientY - lastYRef.current;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;

      panBy(dx, dy);
    };

    const handlePointerEnd = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size < 2) pinchStartDistRef.current = 0;
      if (pointersRef.current.size === 0) {
        isDraggingRef.current = false;
        canvas.classList.remove("isDragging");
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      const currentZoom = useViewportStore.getState().zoom;
      zoomAt(e.clientX, e.clientY, currentZoom * factor);
    };

    const handleDblClick = () => {
      recenter();
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerEnd);
    canvas.addEventListener("pointercancel", handlePointerEnd);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("dblclick", handleDblClick);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerEnd);
      canvas.removeEventListener("pointercancel", handlePointerEnd);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("dblclick", handleDblClick);
    };
  }, [canvasRef, panBy, zoomAt, recenter]);

  return { recenter };
}
