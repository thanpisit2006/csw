"use client";

import React from "react";

export function Footer() {
  return (
    <footer className="w-full mt-10 border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--bg)_80%,transparent)] backdrop-blur-md py-4 px-4 select-none min-h-[48px] max-h-[60px] flex items-center justify-center">
      <div className="max-w-[var(--shell)] mx-auto text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-[11px] text-[var(--muted)] font-medium">
        <span>© 2026 Class Schedule</span>
        <span className="hidden sm:inline opacity-40">•</span>
        <span>Developed by Thanpisit Ritpetchnil</span>
        <span className="hidden sm:inline opacity-40">•</span>
        <span>All Rights Reserved</span>
        <span className="hidden sm:inline opacity-40">•</span>
        <span className="font-mono text-[10px] bg-[color-mix(in_oklab,var(--chip)_60%,transparent)] px-2 py-0.5 rounded-md border border-[var(--border)]">
          Version 2.1.6
        </span>
      </div>
    </footer>
  );
}
