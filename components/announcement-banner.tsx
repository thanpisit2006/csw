"use client";

import React, { useEffect, useState } from "react";
import { getActiveAnnouncements, type AnnouncementRecord } from "@/lib/firebase/firestore-service";
import { X, Info, AlertTriangle, PartyPopper } from "lucide-react";

const TYPE_STYLES = {
  info: {
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-400",
    icon: <Info className="w-4 h-4 shrink-0" />,
  },
  warning: {
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
  },
  holiday: {
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-400",
    icon: <PartyPopper className="w-4 h-4 shrink-0" />,
  },
};

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    getActiveAnnouncements()
      .then(setAnnouncements)
      .catch(() => {}); // silently fail — banner is non-critical
  }, []);

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-2">
      {visible.map((ann) => {
        const style = TYPE_STYLES[ann.type] || TYPE_STYLES.info;
        return (
          <div
            key={ann.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-[14px] border text-sm font-medium ${style.bg} ${style.text}`}
          >
            {style.icon}
            <span className="flex-1 leading-snug">{ann.message}</span>
            <button
              type="button"
              onClick={() => setDismissed((s) => new Set(s).add(ann.id))}
              className="opacity-60 hover:opacity-100 transition-opacity shrink-0 mt-0.5"
              aria-label="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
