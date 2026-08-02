"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { UserProfileModal } from "@/components/auth/user-profile-modal";
import { UserAvatar } from "@/components/user/UserAvatar";
import { useRandomAvatar } from "@/hooks/useRandomAvatar";
import { BrandLogo } from "@/components/ui/brand-logo";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { avatarTheme } = useRandomAvatar();

  return (
    <>
      <header className="sticky top-0 z-10 backdrop-blur-xl border-b border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--bg)_70%,transparent)]">
        <div className="max-w-[var(--shell)] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Brand Title */}
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <BrandLogo className="w-8 h-8 shrink-0" />
            <div className="min-w-0">
              <div className="font-extrabold tracking-tight leading-tight text-[var(--text)] text-base truncate">
                Class Bank
              </div>
              <div className="text-xs text-[var(--muted)] mt-0.5 hidden sm:block truncate">
                University Class Schedule & Wallpapers
              </div>
            </div>
          </Link>

          {/* User & Admin Controls */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated && user ? (
              <motion.button
                type="button"
                aria-label="User Profile"
                onClick={() => setIsProfileOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex items-center gap-2.5 p-1 md:px-3.5 md:py-1.5 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-[var(--text)] text-xs font-bold transition-colors hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent2)] cursor-pointer backdrop-blur-md shrink-0 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 justify-center"
              >
                {/* 40px (mobile) / 44px (desktop) Person Icon Avatar with Randomized Persistent Color Gradient */}
                <UserAvatar avatarTheme={avatarTheme} />

                {/* Information text hidden on mobile below 768px */}
                <div className="hidden md:flex flex-col text-left pr-1">
                  <div className="truncate max-w-[120px] font-bold leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] font-mono leading-none mt-0.5">
                    {user.studentId}
                  </div>
                </div>

                {/* Admin Badge */}
                {user.role === "admin" && (
                  <span className="hidden md:inline-block bg-[#ff3b30]/15 text-[#ff3b30] text-[10px] px-1.5 py-0.5 rounded-md border border-[#ff3b30]/30 font-black">
                    ADMIN
                  </span>
                )}
              </motion.button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-[var(--text)] text-xs font-bold transition-all hover:brightness-105 active:translate-y-[1px] min-h-[44px]"
              >
                <LogIn className="w-4 h-4 text-[var(--accent)]" /> Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
