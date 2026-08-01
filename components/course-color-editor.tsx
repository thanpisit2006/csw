"use client";

import React, { useState } from "react";
import { useScheduleStore } from "@/stores/use-schedule-store";
import { Palette, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_COLORS = [
  "#d9d7a5", "#d9a9d9", "#a9d9a9", "#d9bfa9",
  "#a9cfe0", "#f0b8b8", "#b8c8f0", "#c8f0b8",
];

export function CourseColorEditor() {
  const getActiveScheduleRecord = useScheduleStore((s) => s.getActiveScheduleRecord);
  const updateSchedule = useScheduleStore((s) => s.updateSchedule);
  const [open, setOpen] = useState(false);

  const record = getActiveScheduleRecord();

  // Deduplicate courses by title (same course appears on multiple days)
  const uniqueCourses = record.courses.reduce<{ title: string; color: string }[]>((acc, c) => {
    if (!acc.find((x) => x.title === c.title)) {
      acc.push({ title: c.title, color: c.color || "#888888" });
    }
    return acc;
  }, []);

  const handleColorChange = (title: string, newColor: string) => {
    const updatedCourses = record.courses.map((c) =>
      c.title === title ? { ...c, color: newColor } : c
    );
    updateSchedule(record.id, { courses: updatedCourses });
  };

  const handleReset = () => {
    const updatedCourses = record.courses.map((c, i) => ({
      ...c,
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }));
    updateSchedule(record.id, { courses: updatedCourses });
    toast.success("Colors reset to defaults.");
  };

  return (
    <div className="rounded-[14px] border border-[color-mix(in_oklab,var(--border)_80%,transparent)] bg-[color-mix(in_oklab,var(--card2)_60%,transparent)] overflow-hidden">
      {/* Toggle Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-[var(--text)] hover:bg-[color-mix(in_oklab,var(--chip)_50%,transparent)] transition-colors"
      >
        <span className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[var(--accent)]" />
          Course Colors
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-[var(--muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--muted)]" />}
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 grid gap-2.5 border-t border-[color-mix(in_oklab,var(--border)_60%,transparent)]">
          <div className="pt-3 grid gap-2">
            {uniqueCourses.map(({ title, color }) => (
              <div key={title} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/20"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-mono font-bold text-[var(--text)] truncate">
                    {title}
                  </span>
                </div>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(title, e.target.value)}
                  className="w-8 h-7 rounded-md cursor-pointer border-0 bg-transparent p-0.5"
                  title={`Pick color for ${title}`}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--accent)] font-bold py-1.5 rounded-lg border border-[color-mix(in_oklab,var(--border)_70%,transparent)] transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
}
