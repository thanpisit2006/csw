"use client";

import React, { useState } from "react";
import { Header } from "@/components/header";
import { AdminSidebar, AdminTab } from "@/components/admin/sidebar";
import { OverviewTab } from "@/components/admin/overview-tab";
import { UsersTab } from "@/components/admin/users-tab";
import { SchedulesTab } from "@/components/admin/schedules-tab";
import { SessionsTab } from "@/components/admin/sessions-tab";
import { DownloadsTab } from "@/components/admin/downloads-tab";
import { AuditLogsTab } from "@/components/admin/audit-logs-tab";
import { AnnouncementsTab } from "@/components/admin/announcements-tab";
import { ShieldCheck, ChevronRight } from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />

      <main className="max-w-[var(--shell)] w-full mx-auto px-4.5 py-6 flex-1 flex flex-col gap-6">
        {/* Breadcrumb & Section Title */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium mb-1">
              <span>Admin</span>
              <ChevronRight className="w-3 h-3" />
              <span className="capitalize text-[var(--accent)] font-bold">{activeTab}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text)] flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-[#ff3b30]" /> System Control Center
            </h1>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <section className="flex-1 w-full">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "students" && <UsersTab />}
            {activeTab === "schedules" && <SchedulesTab />}
            {activeTab === "sessions" && <SessionsTab />}
            {activeTab === "downloads" && <DownloadsTab />}
            {activeTab === "audit-logs" && <AuditLogsTab />}
            {activeTab === "announcements" && <AnnouncementsTab />}
          </section>
        </div>
      </main>
    </div>
  );
}
