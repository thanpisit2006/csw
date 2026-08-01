"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getDownloads } from "@/lib/firebase/firestore-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Smartphone, User, Loader2, RefreshCw } from "lucide-react";

export function DownloadsTab() {
  const { data: downloads = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "downloads"],
    queryFn: () => getDownloads(200),
    staleTime: 30_000,
  });

  const exportCSV = () => {
    if (downloads.length === 0) {
      toast.error("No download records to export.");
      return;
    }

    const headers = ["ID", "File Name", "Device Category", "Student Name", "Student ID", "Download Count", "Timestamp"];
    const rows = downloads.map((d) => [
      d.id,
      `"${d.fileName}"`,
      `"${d.category}"`,
      `"${d.user}"`,
      d.studentId,
      d.downloadCount,
      d.timestamp,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `csw_downloads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${downloads.length} download records to CSV.`);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full gap-3">
          <CardTitle className="flex items-center gap-2">
            <Download className="w-4 h-4 text-violet-500" /> Download History & Device Usage Metrics
          </CardTitle>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] flex items-center gap-1.5 transition-colors"
              aria-label="Refresh downloads"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <Button
              type="button"
              variant="primary"
              onClick={exportCSV}
              className="text-xs h-9 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-[var(--muted)]">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> Loading download records from Firestore…
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-semibold">
            Failed to load download data. Check Firestore connection.
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="overflow-x-auto rounded-xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[color-mix(in_oklab,var(--card2)_80%,transparent)] border-b border-[color-mix(in_oklab,var(--border)_70%,transparent)] text-[var(--muted)] font-bold">
                  <tr>
                    <th className="p-3">File Name</th>
                    <th className="p-3">Device Category</th>
                    <th className="p-3">Downloaded By</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Count</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color-mix(in_oklab,var(--border)_50%,transparent)]">
                  {downloads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-[var(--muted)] italic">
                        No download records in Firestore yet.
                      </td>
                    </tr>
                  ) : (
                    downloads.map((dl) => (
                      <tr key={dl.id} className="hover:bg-[color-mix(in_oklab,var(--chip)_40%,transparent)]">
                        <td className="p-3 font-mono font-bold text-[var(--text)]">
                          {dl.fileName}
                        </td>
                        <td className="p-3 font-medium text-[var(--text)] flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[var(--accent)]" /> {dl.category}
                        </td>
                        <td className="p-3 text-[var(--text)]">
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-[var(--muted)]" /> {dl.user}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[var(--muted)]">
                          {dl.studentId}
                        </td>
                        <td className="p-3 font-mono font-bold text-[var(--accent)]">
                          {dl.downloadCount}
                        </td>
                        <td className="p-3 text-[var(--muted)] font-mono">
                          {new Date(dl.timestamp).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="text-[11px] text-[var(--muted)] text-right font-mono">
              {downloads.length} record(s) loaded from Firestore
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
