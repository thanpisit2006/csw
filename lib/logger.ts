/**
 * Activity Logger
 * Writes all audit events and download records to Firestore.
 * Firebase is the single source of truth — no in-memory arrays.
 */

import { writeAuditLog, writeDownload } from "./firebase/firestore-service";
import type { AuditLogRecord, DownloadRecord } from "./db/mock-data";

export interface LogActionParams {
  userId: string;
  studentId: string;
  action: AuditLogRecord["action"];
  resource: string;
  metadata?: Record<string, unknown>;
}

export interface TrackDownloadParams {
  fileId: string;
  fileName: string;
  category: string;
  user: string;
  studentId: string;
}

export async function getRealClientIp(): Promise<string> {
  if (typeof window === "undefined") return "127.0.0.1";
  try {
    const res = await fetch("/api/ip", { cache: "no-store" });
    if (!res.ok) return "127.0.0.1";
    const data = await res.json();
    return data.ip || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

export function parseDeviceSpecs() {
  if (typeof window === "undefined") {
    return {
      browser: "Unknown Server",
      os: "Unknown OS",
      screenSize: "0x0",
      language: "en",
      timezone: "UTC",
      device: "Desktop",
    };
  }

  const ua = navigator.userAgent;
  let browser = "Chrome";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";

  let os = "Desktop OS";
  if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Android")) os = "Android";

  let device = "Desktop";
  if (/Mobi|Android|iPhone/i.test(ua)) device = "Mobile";
  else if (/Tablet|iPad/i.test(ua)) device = "Tablet";

  const screenSize = `${window.screen.width}x${window.screen.height}`;
  const language = navigator.language || "en-US";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return { browser, os, screenSize, language, timezone, device };
}

export async function logActivity(params: LogActionParams): Promise<AuditLogRecord> {
  const specs = parseDeviceSpecs();
  const realIp = await getRealClientIp();

  return writeAuditLog({
    userId: params.userId,
    studentId: params.studentId,
    action: params.action,
    resource: params.resource,
    metadata: params.metadata || {},
    browser: specs.browser,
    os: specs.os,
    screenSize: specs.screenSize,
    language: specs.language,
    timezone: specs.timezone,
    ip: realIp,
  });
}

export async function trackDownload(params: TrackDownloadParams): Promise<DownloadRecord> {
  const record = await writeDownload({
    fileId: params.fileId,
    fileName: params.fileName,
    category: params.category,
    user: params.user,
    studentId: params.studentId,
  });

  logActivity({
    userId: params.studentId,
    studentId: params.studentId,
    action: "DOWNLOAD_WALLPAPER",
    resource: params.fileName,
    metadata: {
      fileId: params.fileId,
      category: params.category,
    },
  }).catch(() => {});

  return record;
}
