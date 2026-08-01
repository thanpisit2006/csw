"use client";

import React from "react";
import { useScheduleStore } from "@/stores/use-schedule-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function ScheduleSelector() {
  const schedulesList = useScheduleStore((s) => s.schedulesList);
  const activeScheduleId = useScheduleStore((s) => s.activeScheduleId);
  const setActiveScheduleId = useScheduleStore((s) => s.setActiveScheduleId);
  const isSubscribed = useScheduleStore((s) => s.isSubscribed);

  const handleChange = (val: string) => {
    setActiveScheduleId(val);
    const target = schedulesList.find((s) => s.id === val);
    if (target) {
      toast.success(`Loaded schedule: ${target.title}`);
    }
  };

  if (!isSubscribed) {
    return (
      <div className="grid gap-2">
        <label className="text-xs text-[var(--muted)] tracking-wider font-semibold">
          Class Schedule (Firestore)
        </label>
        <div className="h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--chip)] text-xs text-[var(--muted)] flex items-center gap-2 font-medium animate-pulse">
          Loading class schedules from database…
        </div>
      </div>
    );
  }

  if (schedulesList.length === 0) {
    return (
      <div className="grid gap-2">
        <label className="text-xs text-[var(--muted)] tracking-wider font-semibold">
          Class Schedule (Firestore)
        </label>
        <div className="h-10 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-400 flex items-center font-medium">
          No published schedules available for your account.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <label className="text-xs text-[var(--muted)] tracking-wider font-semibold">
        Class Schedule (Firestore)
      </label>
      <Select value={activeScheduleId} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select class schedule" />
        </SelectTrigger>
        <SelectContent>
          {schedulesList.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
