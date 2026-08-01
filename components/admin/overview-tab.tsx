"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAllStudents,
  getActiveSessions,
  getDownloads,
  getAuditLogs,
} from "@/lib/firebase/firestore-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PulseLoader } from "@/components/ui/pulse-loader";
import {
  Users,
  Activity,
  Ban,
  TrendingUp,
  Smartphone,
  Globe,
  Clock,
  Laptop,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export function OverviewTab() {
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: getAllStudents,
    staleTime: 30_000,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["admin", "sessions"],
    queryFn: getActiveSessions,
    staleTime: 15_000,
  });

  const { data: downloads = [], isLoading: downloadsLoading } = useQuery({
    queryKey: ["admin", "downloads"],
    queryFn: () => getDownloads(200),
    staleTime: 30_000,
  });

  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: () => getAuditLogs(200),
    staleTime: 15_000,
  });

  const totalUsers = students.length;
  const onlineUsers = sessions.length;
  const activeCount = students.filter((s) => s.status === "active").length;
  const expiredCount = students.filter((s) => s.status === "expired").length;
  const suspendedCount = students.filter((s) => s.status === "suspended").length;
  const bannedCount = students.filter((s) => s.status === "banned").length;

  // Device, Browser, OS breakdowns from Audit Logs & Sessions
  const deviceStats = auditLogs.reduce<Record<string, number>>((acc, log) => {
    const dev = log.screenSize === "0x0" ? "Desktop" : "Mobile / Tablet";
    acc[dev] = (acc[dev] || 0) + 1;
    return acc;
  }, {});

  const browserStats = auditLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.browser] = (acc[log.browser] || 0) + 1;
    return acc;
  }, {});

  const osStats = auditLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.os] = (acc[log.os] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid gap-5">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[var(--muted)] font-medium">Total Users</div>
            <div className="text-xl font-black text-[var(--text)] mt-0.5">
              {studentsLoading ? <PulseLoader text="" /> : totalUsers}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[var(--muted)] font-medium">Online Users</div>
            <div className="text-xl font-black text-[var(--text)] mt-0.5">
              {sessionsLoading ? <PulseLoader text="" /> : onlineUsers}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[var(--muted)] font-medium">Active (Green)</div>
            <div className="text-xl font-black text-emerald-500 mt-0.5">
              {studentsLoading ? <PulseLoader text="" /> : activeCount}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[var(--muted)] font-medium">Expired (Yellow)</div>
            <div className="text-xl font-black text-amber-500 mt-0.5">
              {studentsLoading ? <PulseLoader text="" /> : expiredCount}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[var(--muted)] font-medium">Suspended</div>
            <div className="text-xl font-black text-orange-500 mt-0.5">
              {studentsLoading ? <PulseLoader text="" /> : suspendedCount}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[var(--muted)] font-medium">Banned (Red)</div>
            <div className="text-xl font-black text-rose-500 mt-0.5">
              {studentsLoading ? <PulseLoader text="" /> : bannedCount}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
            <Ban className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Device Statistics */}
        <Card className="p-4 grid gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--text)]">
            <Smartphone className="w-4 h-4 text-[var(--accent)]" /> Device Breakdown
          </div>
          <div className="space-y-2">
            {Object.entries(deviceStats).map(([dev, count]) => (
              <div key={dev} className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">{dev}</span>
                <span className="font-mono font-bold text-[var(--text)]">{count} events</span>
              </div>
            ))}
            {Object.keys(deviceStats).length === 0 && (
              <div className="text-xs text-[var(--muted)] italic">No device data yet.</div>
            )}
          </div>
        </Card>

        {/* Browser Statistics */}
        <Card className="p-4 grid gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--text)]">
            <Globe className="w-4 h-4 text-[var(--accent)]" /> Browser Distribution
          </div>
          <div className="space-y-2">
            {Object.entries(browserStats).map(([browser, count]) => (
              <div key={browser} className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">{browser}</span>
                <span className="font-mono font-bold text-[var(--text)]">{count}</span>
              </div>
            ))}
            {Object.keys(browserStats).length === 0 && (
              <div className="text-xs text-[var(--muted)] italic">No browser data yet.</div>
            )}
          </div>
        </Card>

        {/* OS Statistics */}
        <Card className="p-4 grid gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--text)]">
            <Laptop className="w-4 h-4 text-[var(--accent)]" /> Operating System (OS)
          </div>
          <div className="space-y-2">
            {Object.entries(osStats).map(([os, count]) => (
              <div key={os} className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">{os}</span>
                <span className="font-mono font-bold text-[var(--text)]">{count}</span>
              </div>
            ))}
            {Object.keys(osStats).length === 0 && (
              <div className="text-xs text-[var(--muted)] italic">No OS data yet.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Activity & Recent Logins Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-[var(--accent)]" /> Recent Logins, Downloads & Real IP Addresses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logsLoading ? (
              <PulseLoader text="Loading recent activity & IP logs…" />
            ) : auditLogs.length === 0 ? (
              <div className="text-xs text-[var(--muted)] italic py-4 text-center">No activity events recorded yet.</div>
            ) : (
              auditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--card2)_60%,transparent)] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[var(--text)]">{log.studentId}</span>{" "}
                    <span className="text-[var(--muted)]">performed</span>{" "}
                    <span className="font-semibold text-[var(--accent)]">{log.action}</span>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">
                      IP: <span className="font-mono text-[var(--text)] font-bold">{log.ip}</span> • {log.os} • {log.browser}
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
