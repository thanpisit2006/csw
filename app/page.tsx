"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { Header } from "@/components/header";
import { WallpaperCanvas } from "@/components/wallpaper-canvas";
import { CustomizeCard } from "@/components/customize-card";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { SchedulePdfBanner } from "@/components/schedule-pdf-banner";
import { DownloadHistoryGallery } from "@/components/download-history-gallery";
import { HelpButton } from "@/components/help-button";
import { Footer } from "@/components/footer";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Mandatory Student ID Gate: Require Student ID before accessing home page
    if (!isAuthenticated || !user) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg)] text-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
        <p className="text-xs text-[var(--muted)] font-medium">
          Verifying Student ID Session…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] transition-colors duration-300 relative">
      <Header />

      <main className="max-w-[var(--shell)] w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 flex-1 flex flex-col gap-6">
        {/* Site-wide announcements from admin */}
        <AnnouncementBanner />

        {/* Official Schedule PDF Download Banner (If enabled) */}
        <SchedulePdfBanner />

        {/* Responsive Grid System:
            ≥1400px: 2 columns (Preview larger clamp 340-520px)
            1024-1399px: 2 balanced columns
            768-1023px: 1 column centered
            <768px: 1 column touch-optimized (Preview first)
        */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
          {/* Left Panel: Preview Frame */}
          <WallpaperCanvas />

          {/* Right Panel: Customize Controls */}
          <CustomizeCard />
        </section>

        {/* Download History Re-Download Panel for active Student ID */}
        <DownloadHistoryGallery />
      </main>

      {/* Floating iOS-Style How to Use Help Button */}
      <HelpButton />

      <Footer />
    </div>
  );
}
