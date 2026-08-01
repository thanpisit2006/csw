"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
  type AnnouncementRecord,
} from "@/lib/firebase/firestore-service";
import { useAuthStore } from "@/stores/use-auth-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Megaphone,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Info,
  AlertTriangle,
  PartyPopper,
  Loader2,
  RefreshCw,
} from "lucide-react";

const TYPE_ICONS = {
  info: <Info className="w-3.5 h-3.5 text-blue-400" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  holiday: <PartyPopper className="w-3.5 h-3.5 text-emerald-400" />,
};

const TYPE_LABELS = { info: "Info", warning: "Warning", holiday: "Holiday" };

export function AnnouncementsTab() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [type, setType] = useState<AnnouncementRecord["type"]>("info");
  const [isAdding, setIsAdding] = useState(false);

  const { data: announcements = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: getAllAnnouncements,
    staleTime: 15_000,
  });

  const createMutation = useMutation({
    mutationFn: () => createAnnouncement(message.trim(), type, user?.studentId || "admin"),
    onSuccess: () => {
      toast.success("Announcement published.");
      setMessage("");
      setIsAdding(false);
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
    onError: () => toast.error("Failed to create announcement."),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      toggleAnnouncement(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "announcements"] }),
    onError: () => toast.error("Failed to toggle announcement."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      toast.success("Announcement deleted.");
      qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
    onError: () => toast.error("Failed to delete announcement."),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-500" /> Site-wide Announcements
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsAdding(true)}
              className="text-xs h-9 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Announcement
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        {/* Compose Form */}
        {isAdding && (
          <div className="p-4 rounded-2xl border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[color-mix(in_oklab,var(--accent)_5%,transparent)] grid gap-3">
            <div className="text-xs font-bold text-[var(--text)]">New Announcement</div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your announcement message for all students…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-[color-mix(in_oklab,var(--border)_80%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-xs text-[var(--text)] placeholder:text-[var(--muted)] outline-none resize-none focus:border-[var(--accent)]"
            />
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)] font-medium">Type:</span>
                {(["info", "warning", "holiday"] as AnnouncementRecord["type"][]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      type === t
                        ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] text-[var(--accent)]"
                        : "border-[color-mix(in_oklab,var(--border)_70%,transparent)] text-[var(--muted)]"
                    }`}
                  >
                    {TYPE_ICONS[t]} {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setIsAdding(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => createMutation.mutate()}
                  disabled={!message.trim() || createMutation.isPending}
                  className="text-xs h-8 flex items-center gap-1.5"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  Publish
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Announcements List */}
        {isLoading ? (
          <div className="flex items-center gap-2 py-6 justify-center text-xs text-[var(--muted)]">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> Loading announcements…
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--muted)] italic border border-dashed border-[var(--border)] rounded-2xl">
            No announcements yet. Create one to broadcast to all students.
          </div>
        ) : (
          <div className="grid gap-2">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                  ann.active
                    ? "border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--card2)_50%,transparent)]"
                    : "border-[color-mix(in_oklab,var(--border)_40%,transparent)] opacity-50"
                }`}
              >
                <div className="mt-0.5">{TYPE_ICONS[ann.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--text)] leading-snug">{ann.message}</div>
                  <div className="text-[11px] text-[var(--muted)] font-mono mt-1">
                    {TYPE_LABELS[ann.type]} · {ann.active ? "Visible" : "Hidden"} ·{" "}
                    {new Date(ann.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleMutation.mutate({ id: ann.id, active: !ann.active })}
                    className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] transition-colors"
                    title={ann.active ? "Hide from students" : "Show to students"}
                  >
                    {ann.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(ann.id)}
                    className="p-1.5 rounded-lg text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
