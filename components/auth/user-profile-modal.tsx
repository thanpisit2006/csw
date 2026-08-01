"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/use-auth-store";
import { clearSessionCookie } from "@/lib/session";
import { logActivity } from "@/lib/logger";
import { getDownloads } from "@/lib/firebase/firestore-service";
import type { DownloadRecord } from "@/lib/db/mock-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  User,
  GraduationCap,
  LogOut,
  Download,
  Calendar,
  X,
  Loader2,
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);

  const [userDownloads, setUserDownloads] = useState<DownloadRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load user-specific download history from Firestore when modal opens
  useEffect(() => {
    if (!isOpen || !user) return;
    setIsLoadingHistory(true);

    getDownloads(50)
      .then((all) =>
        setUserDownloads(
          all.filter((d) => d.studentId === user.studentId || d.user === user.name)
        )
      )
      .catch((err) => console.error("Failed to load user history:", err))
      .finally(() => setIsLoadingHistory(false));
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleLogout = async () => {
    logActivity({
      userId: user.userId,
      studentId: user.studentId,
      action: "LOGOUT",
      resource: "/logout",
    }).catch(() => {});

    clearSessionCookie(user.role);
    logoutStore();
    onClose();
    toast.success("Logged out successfully.");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
      <div className="w-full max-w-[520px] rounded-[24px] border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--card2)] shadow-2xl p-6 grid gap-5 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--card2)_80%,transparent)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_oklab,var(--accent)_20%,transparent)] border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] flex items-center justify-center text-[var(--accent)] shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-[var(--text)] tracking-tight">
              {user.name}
            </h3>
            <div className="text-xs text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
              <GraduationCap className="w-3.5 h-3.5" /> Student ID:{" "}
              <strong className="text-[var(--text)] font-mono">{user.studentId}</strong>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--chip)_50%,transparent)]">
          <div className="text-[var(--muted)] flex items-center gap-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" /> Role / Permission
          </div>
          <div className="font-bold text-[var(--text)] mt-1 capitalize text-xs">
            {user.role}
          </div>
        </div>

        <div className="grid gap-2">
          <div className="font-bold text-xs text-[var(--text)] flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-[var(--accent)]" /> Recent Downloads
            {!isLoadingHistory && ` (${userDownloads.length})`}
          </div>

          {isLoadingHistory ? (
            <div className="flex items-center gap-2 py-3 text-xs text-[var(--muted)]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" /> Loading history…
            </div>
          ) : userDownloads.length === 0 ? (
            <div className="text-xs text-[var(--muted)] italic p-3 rounded-xl border border-[color-mix(in_oklab,var(--border)_50%,transparent)]">
              No recent downloads logged yet.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {userDownloads.map((dl) => (
                <div
                  key={dl.id}
                  className="p-2.5 rounded-lg border border-[color-mix(in_oklab,var(--border)_60%,transparent)] bg-[color-mix(in_oklab,var(--card2)_60%,transparent)] flex items-center justify-between text-xs"
                >
                  <div className="font-mono text-[var(--text)] truncate max-w-[240px]">
                    {dl.fileName}
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">
                    {new Date(dl.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-[color-mix(in_oklab,var(--border)_60%,transparent)] flex justify-end">
          <Button
            type="button"
            variant="danger"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs h-9"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
