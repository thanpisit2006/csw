import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function coverBaseScale(iw: number, ih: number, cw: number, ch: number): number {
  return Math.max(cw / iw, ch / ih);
}

export interface CropResult {
  iw: number;
  ih: number;
  base: number;
  scale: number;
  sw: number;
  sh: number;
  sxMin: number;
  syMin: number;
  sxMax: number;
  syMax: number;
}

export function computeCrop(
  img: { naturalWidth: number; naturalHeight: number },
  cw: number,
  ch: number,
  zoom: number
): CropResult {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const base = coverBaseScale(iw, ih, cw, ch);
  const scale = base * zoom;

  const sw = cw / scale;
  const sh = ch / scale;

  const sxMin = 0;
  const syMin = 0;
  const sxMax = Math.max(0, iw - sw);
  const syMax = Math.max(0, ih - sh);

  return { iw, ih, base, scale, sw, sh, sxMin, syMin, sxMax, syMax };
}

export function fmtTime(t: number): string {
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "dev_server";
  const KEY = "csw_device_fingerprint_id";
  let devId = localStorage.getItem(KEY);
  if (!devId) {
    devId = `dev_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    localStorage.setItem(KEY, devId);
  }
  return devId;
}

export function convertGoogleDriveUrl(url: string): string {
  if (!url) return url;
  // Convert Google Drive sharing/view links into clean view URLs
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/file/d/${fileIdMatch[1]}/view`;
  }
  return url;
}

