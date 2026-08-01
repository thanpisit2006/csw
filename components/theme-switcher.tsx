"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { ThemeChoice } from "@/lib/types";

export function ThemeSwitcher() {
  const { choice, setChoice, syncSystemTheme } = useTheme();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => syncSystemTheme();
    mql.addEventListener?.("change", handleChange);
    return () => mql.removeEventListener?.("change", handleChange);
  }, [syncSystemTheme]);

  const options: { id: ThemeChoice; label: string; icon: React.ElementType }[] = [
    { id: "system", label: "System", icon: Monitor },
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className="inline-flex items-center gap-1 p-1 rounded-full bg-[var(--glass)] backdrop-blur-xl border border-[var(--border)] shadow-sm select-none"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = choice === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setChoice(opt.id)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              isActive ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="theme-switcher-active-pill"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="absolute inset-0 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
              />
            )}
            <Icon className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
