"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  Download,
  FileText,
  Megaphone,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "students"
  | "schedules"
  | "sessions"
  | "downloads"
  | "audit-logs"
  | "announcements";

interface SidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "schedules", label: "Schedules", icon: Calendar },
    { id: "sessions", label: "Active Sessions", icon: Activity },
    { id: "downloads", label: "Download History", icon: Download },
    { id: "audit-logs", label: "Audit Logs", icon: FileText },
    { id: "announcements", label: "Announcements", icon: Megaphone },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 grid gap-4">
      <div className="p-4 rounded-[20px] border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--card2)] shadow-sm grid gap-3">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[color-mix(in_oklab,var(--border)_70%,transparent)]">
          <div className="w-9 h-9 rounded-xl bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/30 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-[var(--text)] tracking-tight">
              Admin Portal
            </div>
            <div className="text-[11px] text-[var(--muted)]">
              CSW Control Center
            </div>
          </div>
        </div>

        <nav className="grid gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-[var(--accent)] border border-[color-mix(in_oklab,var(--accent)_30%,transparent)]"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[color-mix(in_oklab,var(--chip)_50%,transparent)]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="pt-2 border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)]">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[color-mix(in_oklab,var(--chip)_50%,transparent)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Main App
          </Link>
        </div>
      </div>
    </aside>
  );
}
