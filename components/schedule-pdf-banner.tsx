"use client";

import React, { useState } from "react";
import { useScheduleStore } from "@/stores/use-schedule-store";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SchedulePdfBanner() {
  const getActiveScheduleRecord = useScheduleStore((s) => s.getActiveScheduleRecord);
  const activeSched = getActiveScheduleRecord();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!activeSched || !activeSched.pdfEnabled || !activeSched.pdfFileUrl) {
    return null;
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(activeSched.pdfFileUrl!);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = activeSched.pdfFileName || `${activeSched.title}-Schedule.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Downloaded schedule PDF!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download PDF. Opening in new tab…");
      window.open(activeSched.pdfFileUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full rounded-[24px] border border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-gradient-to-r from-[color-mix(in_oklab,var(--accent)_18%,transparent)] via-[color-mix(in_oklab,var(--card2)_80%,transparent)] to-[color-mix(in_oklab,var(--accent)_18%,transparent)] backdrop-blur-xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="flex items-center gap-3.5 min-w-0 text-center sm:text-left">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shrink-0 shadow-md">
          <FileText className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h3 className="font-extrabold text-sm sm:text-base text-[var(--text)] tracking-tight">
              📄 Official Schedule PDF Available
            </h3>
            {activeSched.pdfFileSize && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[color-mix(in_oklab,var(--chip)_80%,transparent)] text-[var(--muted)] border border-[var(--border)]">
                {(activeSched.pdfFileSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
            You can download the official PDF version of this class schedule ({activeSched.title}).
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={isDownloading}
        onClick={handleDownload}
        className="w-full sm:w-auto h-11 px-6 rounded-full bg-[var(--accent)] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer min-h-[44px] shrink-0"
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Download Official PDF
      </button>
    </div>
  );
}
