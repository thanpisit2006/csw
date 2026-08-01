"use client";

import React from "react";
import { AvatarColorTheme } from "./avatarData";
import { User } from "lucide-react";

interface UserAvatarProps {
  avatarTheme?: AvatarColorTheme;
}

export function UserAvatar({ avatarTheme }: UserAvatarProps) {
  const gradientClass = avatarTheme?.gradient || "from-blue-500 to-sky-400";

  return (
    <div
      className={`w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-full bg-gradient-to-br ${gradientClass} border border-white/40 shadow-sm flex items-center justify-center text-white shrink-0 overflow-hidden backdrop-blur-md transition-transform duration-200 hover:scale-105 active:scale-95`}
    >
      <User className="w-5 h-5 md:w-5.5 md:h-5.5 text-white drop-shadow-sm" />
    </div>
  );
}
