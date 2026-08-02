"use client";

import React from "react";
import { useScheduleStore } from "@/stores/use-schedule-store";
import { motion } from "framer-motion";
import { FileText, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { convertGoogleDriveUrl } from "@/lib/utils";

export function SchedulePdfBanner() {
  const getActiveScheduleRecord = useScheduleStore((s) => s.getActiveScheduleRecord);
  const activeSched = getActiveScheduleRecord();

  const rawPdfUrl = activeSched?.pdfFileUrl;
  const pdfUrl = rawPdfUrl ? convertGoogleDriveUrl(rawPdfUrl) : "";
  const isAvailable = !!(activeSched?.pdfEnabled && pdfUrl);

  const handleOpenPdf = () => {
    if (!isAvailable || !pdfUrl) {
      toast.error("PDF is not available for this schedule.");
      return;
    }
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={isAvailable ? { scale: 1.02 } : {}}
      whileTap={isAvailable ? { scale: 0.985 } : {}}
      onClick={handleOpenPdf}
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-lg flex items-center justify-between gap-3 min-h-[56px] max-h-[72px] transition-all duration-300 group select-none ${
        isAvailable ? "cursor-pointer hover:border-cyan-500/40 hover:shadow-cyan-500/10" : "cursor-not-allowed opacity-75"
      }`}
    >
      {/* Slow Shimmering Light Sweep Every 7 Seconds */}
      <motion.div
        animate={{ x: ["-100%", "250%"] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", repeatDelay: 2 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
      />

      {/* Left: PDF Icon with Soft Glow + Non-wrapping Title & Subtitle */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* PDF Icon Box with Soft Ambient Glow */}
        <div className="relative shrink-0">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
              isAvailable
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-slate-800 text-slate-400 border border-slate-700/50"
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Text Container - Ensured Single Line Truncation (whitespace-nowrap & truncate) */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs sm:text-sm text-white truncate whitespace-nowrap">
              Class Schedule PDF
            </span>
            {isAvailable && activeSched?.pdfFileSize && (
              <span className="hidden sm:inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-white/10 whitespace-nowrap">
                {(activeSched.pdfFileSize / (1024 * 1024)).toFixed(1)} MB
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-300/80 font-medium truncate whitespace-nowrap">
            {isAvailable ? "Tap to open official schedule" : "PDF not available"}
          </span>
        </div>
      </div>

      {/* Right: Compact Action Button */}
      <button
        type="button"
        disabled={!isAvailable}
        onClick={(e) => {
          e.stopPropagation();
          handleOpenPdf();
        }}
        className={`h-8 sm:h-9 px-3.5 sm:px-4 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-sm ${
          isAvailable
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 active:scale-95 cursor-pointer"
            : "bg-slate-800/80 text-slate-400 border border-slate-700/50 cursor-not-allowed"
        }`}
      >
        {isAvailable ? (
          <>
            <span className="whitespace-nowrap">Open PDF</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </>
        ) : (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="whitespace-nowrap">Unavailable</span>
          </>
        )}
      </button>
    </motion.div>
  );
}
