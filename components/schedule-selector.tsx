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

  const publishedSchedules = schedulesList.filter((s) => s.status === "published");

  const handleChange = (val: string) => {
    setActiveScheduleId(val);
    const target = schedulesList.find((s) => s.id === val);
    if (target) {
      toast.success(`Loaded schedule: ${target.title}`);
    }
  };

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
          {publishedSchedules.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
