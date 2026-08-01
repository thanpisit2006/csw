"use client";

import React, { useState, useEffect } from "react";
import { useScheduleStore } from "@/stores/use-schedule-store";
import { scheduleArraySchema } from "@/lib/schemas";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function JsonScheduleEditor() {
  const activeScheduleId = useScheduleStore((s) => s.activeScheduleId);
  const getActiveScheduleRecord = useScheduleStore((s) => s.getActiveScheduleRecord);
  const updateSchedule = useScheduleStore((s) => s.updateSchedule);

  const [jsonText, setJsonText] = useState("");
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    const record = getActiveScheduleRecord();
    setJsonText(JSON.stringify(record.courses, null, 2));
    setMsg(null);
  }, [activeScheduleId, getActiveScheduleRecord]);

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const validation = scheduleArraySchema.safeParse(parsed);
      if (!validation.success) {
        const firstErr = validation.error.errors[0]?.message || "Invalid schedule structure";
        setMsg({ text: `Validation Error: ${firstErr}`, error: true });
        toast.error("Invalid Schedule JSON.");
        return;
      }

      updateSchedule(activeScheduleId, { courses: validation.data });
      setJsonText(JSON.stringify(validation.data, null, 2));
      setMsg({ text: "Applied successfully.", error: false });
      toast.success("Schedule updated.");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Invalid JSON formatting";
      setMsg({ text: `Can’t read that JSON: ${errMsg}`, error: true });
      toast.error("Check JSON format.");
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="json-editor">
        <AccordionTrigger>Schedule (JSON)</AccordionTrigger>
        <AccordionContent>
          <p className="m-0 mb-2.5 text-xs text-[var(--muted)]">
            Edit the JSON, then click Apply to update the preview.
          </p>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={10}
            className="w-full font-mono text-xs p-3 rounded-xl border border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_80%,transparent)] text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />

          {msg && (
            <div
              className={`mt-2 text-xs p-2 rounded-lg font-mono ${msg.error ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                }`}
            >
              {msg.text}
            </div>
          )}

          <div className="mt-3 flex justify-end">
            <Button type="button" variant="primary" onClick={handleApply} className="text-xs h-8">
              Apply JSON Changes
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
