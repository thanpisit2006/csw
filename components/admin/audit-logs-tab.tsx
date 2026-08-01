"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/lib/firebase/firestore-service";
import type { AuditLogRecord } from "@/lib/db/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Search, FileSpreadsheet, Code, X, Loader2, RefreshCw } from "lucide-react";

export function AuditLogsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const { data: auditLogs = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: () => getAuditLogs(200),
    staleTime: 15_000,
  });

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const exportCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error("No audit log entries to export.");
      return;
    }

    const headers = [
      "ID",
      "User ID",
      "Student ID",
      "Action",
      "Resource",
      "Browser",
      "OS",
      "Screen Size",
      "Language",
      "Timezone",
      "IP",
      "Timestamp",
    ];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.userId,
      log.studentId,
      log.action,
      `"${log.resource}"`,
      log.browser,
      log.os,
      log.screenSize,
      log.language,
      log.timezone,
      log.ip,
      log.timestamp,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `csw_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredLogs.length} audit log entries to CSV.`);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full gap-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--accent)]" /> Immutable System Audit Trail
          </CardTitle>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] flex items-center gap-1.5 transition-colors"
              aria-label="Refresh audit logs"
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
        {/* Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-[var(--muted)]" />
            <Input
              placeholder="Search audit logs by Student ID or Resource…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)] font-medium">Action Filter:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              aria-label="Action Filter"
              className="h-10 px-3 rounded-[12px] border border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="DOWNLOAD_WALLPAPER">DOWNLOAD_WALLPAPER</option>
              <option value="UPLOAD_IMAGE">UPLOAD_IMAGE</option>
              <option value="UPDATE_CONSENT">UPDATE_CONSENT</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-[var(--muted)]">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> Loading audit logs from Firestore…
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-semibold">
            Failed to load audit logs. Check Firestore connection.
          </div>
        )}

        {/* Audit Logs Table */}
        {!isLoading && !error && (
          <>
            <div className="overflow-x-auto rounded-xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[color-mix(in_oklab,var(--card2)_80%,transparent)] border-b border-[color-mix(in_oklab,var(--border)_70%,transparent)] text-[var(--muted)] font-bold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Resource Target</th>
                    <th className="p-3">Client Device / IP</th>
                    <th className="p-3 text-right">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color-mix(in_oklab,var(--border)_50%,transparent)]">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-[var(--muted)] italic">
                        {auditLogs.length === 0
                          ? "No audit events in Firestore yet."
                          : "No matching audit log events found."}
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[color-mix(in_oklab,var(--chip)_40%,transparent)]">
                        <td className="p-3 font-mono text-[var(--muted)]">
                          {new Date(log.timestamp).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "medium",
                          })}
                        </td>
                        <td className="p-3 font-mono font-bold text-[var(--text)]">
                          {log.studentId}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-black bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] text-[var(--accent)] border border-[color-mix(in_oklab,var(--accent)_30%,transparent)]">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[var(--text)] truncate max-w-[180px]">
                          {log.resource}
                        </td>
                        <td className="p-3 text-[var(--muted)] text-[11px]">
                          <div>{log.os} • {log.browser}</div>
                          <div className="font-mono text-[var(--muted)]">{log.ip}</div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="text-[var(--accent)] hover:underline font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Code className="w-3.5 h-3.5" /> JSON
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="text-[11px] text-[var(--muted)] text-right font-mono">
              {filteredLogs.length} / {auditLogs.length} entries shown
            </div>
          </>
        )}
      </CardContent>

      {/* Metadata JSON Inspector Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] rounded-[24px] border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--card2)] shadow-2xl p-5 grid gap-4 relative">
            <button
              type="button"
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="font-extrabold text-sm text-[var(--text)] flex items-center gap-2">
              <Code className="w-4 h-4 text-[var(--accent)]" /> Audit Log Event: {selectedLog.id}
            </h4>

            <pre className="p-3.5 rounded-xl bg-black/70 border border-[var(--border)] font-mono text-xs text-emerald-400 overflow-x-auto max-h-[300px]">
              {JSON.stringify(selectedLog, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
}
