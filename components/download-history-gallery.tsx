"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/use-auth-store";
import { getDownloads } from "@/lib/firebase/firestore-service";
import type { DownloadRecord } from "@/lib/db/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, History, Loader2 } from "lucide-react";

export function DownloadHistoryGallery() {
  const user = useAuthStore((s) => s.user);
  const [userDownloads, setUserDownloads] = useState<DownloadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    getDownloads(50)
      .then((all) =>
        setUserDownloads(
          all.filter((d) => d.studentId === user.studentId || d.user === user.name)
        )
      )
      .catch((err) => console.error("Failed to load download history:", err))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!user) return null;
  if (isLoading) return null; // Don't show skeleton — simply hide until loaded
  if (userDownloads.length === 0) return null;

  const handleReDownload = (fileName: string) => {
    toast.success(`Re-downloading ${fileName}…`);
    // Re-trigger download trigger
  };

  return (
    <Card className="mt-6 border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[color-mix(in_oklab,var(--accent)_5%,transparent)]">
      <CardHeader className="flex items-center justify-between pb-3">
        <CardTitle className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-[var(--text)]">
          <History className="w-4 h-4 text-[var(--accent)]" /> Your Downloaded Wallpapers ({userDownloads.length})
        </CardTitle>
        <span className="text-[11px] text-[var(--muted)] font-mono">
          Student ID: {user.studentId}
        </span>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {userDownloads.map((dl) => (
            <div
              key={dl.id}
              className="p-3 rounded-2xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--card2)_80%,transparent)] grid gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono text-xs font-bold text-[var(--text)] truncate">
                  {dl.fileName}
                </div>
                <span className="text-[10px] font-bold text-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] px-2 py-0.5 rounded-full shrink-0">
                  {dl.category}
                </span>
              </div>

              <div className="text-[11px] text-[var(--muted)] flex items-center justify-between">
                <span>Downloaded {dl.downloadCount} time(s)</span>
                <span className="font-mono">{new Date(dl.timestamp).toLocaleDateString()}</span>
              </div>

              <Button
                type="button"
                variant="primary"
                onClick={() => handleReDownload(dl.fileName)}
                className="w-full text-xs h-8 mt-1 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-Download Wallpaper
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
