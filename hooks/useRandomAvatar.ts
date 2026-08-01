"use client";

import { useState, useEffect } from "react";
import { AVATAR_COLOR_THEMES, AvatarColorTheme } from "@/components/user/avatarData";

const STORAGE_KEY = "csw_user_avatar_color_theme_id";

export function useRandomAvatar() {
  const [avatarTheme, setAvatarTheme] = useState<AvatarColorTheme>(AVATAR_COLOR_THEMES[0]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      const found = AVATAR_COLOR_THEMES.find((a) => a.id === savedId);
      if (found) {
        setAvatarTheme(found);
        return;
      }
    }

    // Pick random color theme once on first visit and save to localStorage
    const randomIndex = Math.floor(Math.random() * AVATAR_COLOR_THEMES.length);
    const randomChoice = AVATAR_COLOR_THEMES[randomIndex];
    setAvatarTheme(randomChoice);
    localStorage.setItem(STORAGE_KEY, randomChoice.id);
  }, []);

  const refreshAvatarTheme = () => {
    const randomIndex = Math.floor(Math.random() * AVATAR_COLOR_THEMES.length);
    const newChoice = AVATAR_COLOR_THEMES[randomIndex];
    setAvatarTheme(newChoice);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newChoice.id);
    }
  };

  return { avatarTheme, refreshAvatarTheme };
}
