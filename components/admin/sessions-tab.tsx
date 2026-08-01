"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getActiveSessions } from "@/lib/firebase/firestore-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, ShieldCheck, Laptop, Globe, Loader2, RefreshCw } from "lucide-react";

export function SessionsTab() {
  const { data: sessions = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "sessions"],
    queryFn: getActiveSessions,
    staleTime: 15_000,
    refetchInterval: 60_000, // Auto-refresh every 60 seconds
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Active System Sessions Monitor
          </CardTitle>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs text-[var(--muted)] hover:text-[var(--accent)] flex items-center gap-1.5 transition-colors"
            aria-label="Refresh sessions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-[var(--muted)]">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> Loading active sessions from Firestore…
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-semibold">
            Failed to load sessions. Check Firestore connection.
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="overflow-x-auto rounded-xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[color-mix(in_oklab,var(--card2)_80%,transparent)] border-b border-[color-mix(in_oklab,var(--border)_70%,transparent)] text-[var(--muted)] font-bold">
                  <tr>
                    <th className="p-3">Student / User ID</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Device Specs</th>
                    <th className="p-3">Created At</th>
                    <th className="p-3">Expires At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color-mix(in_oklab,var(--border)_50%,transparent)]">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-[var(--muted)] italic">
                        No active sessions in Firestore.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((sess) => (
                      <tr key={sess.id} className="hover:bg-[color-mix(in_oklab,var(--chip)_40%,transparent)]">
                        <td className="p-3 font-mono font-bold text-[var(--text)]">
                          {sess.studentId}
                        </td>
                        <td className="p-3">
                          {sess.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#ff3b30] bg-[#ff3b30]/15 px-2 py-0.5 rounded-full border border-[#ff3b30]/30">
                              <ShieldCheck className="w-3 h-3" /> ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                              STUDENT
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[var(--muted)] flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-[var(--accent)]" /> {sess.ip}
                        </td>
                        <td className="p-3 text-[var(--muted)]">
                          <div className="flex items-center gap-1.5 font-medium text-[var(--text)]">
                            <Laptop className="w-3.5 h-3.5 text-[var(--muted)]" /> {sess.os} • {sess.browser}
                          </div>
                          <div className="text-[11px] font-mono text-[var(--muted)] mt-0.5">
                            Screen: {sess.screenSize}
                          </div>
                        </td>
                        <td className="p-3 text-[var(--muted)] font-mono">
                          {new Date(sess.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="p-3 text-[var(--muted)] font-mono">
                          {new Date(sess.expiresAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="text-[11px] text-[var(--muted)] text-right font-mono mt-2">
              {sessions.length} active session(s) · auto-refreshes every 60s
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
