export interface AvatarColorTheme {
  id: string;
  name: string;
  gradient: string;
}

export const AVATAR_COLOR_THEMES: AvatarColorTheme[] = [
  { id: "blue", name: "Blue", gradient: "from-blue-500 to-sky-400" },
  { id: "sky", name: "Sky Blue", gradient: "from-sky-400 to-cyan-500" },
  { id: "cyan", name: "Cyan", gradient: "from-cyan-500 to-teal-400" },
  { id: "teal", name: "Teal", gradient: "from-teal-500 to-emerald-400" },
  { id: "green", name: "Green", gradient: "from-green-500 to-emerald-400" },
  { id: "emerald", name: "Emerald", gradient: "from-emerald-500 to-teal-500" },
  { id: "lime", name: "Lime", gradient: "from-lime-500 to-green-400" },
  { id: "yellow", name: "Yellow", gradient: "from-yellow-400 to-amber-500" },
  { id: "amber", name: "Amber", gradient: "from-amber-500 to-orange-400" },
  { id: "orange", name: "Orange", gradient: "from-orange-500 to-amber-500" },
  { id: "red", name: "Red", gradient: "from-red-500 to-rose-500" },
  { id: "rose", name: "Rose", gradient: "from-rose-500 to-pink-500" },
  { id: "pink", name: "Pink", gradient: "from-pink-500 to-rose-400" },
  { id: "purple", name: "Purple", gradient: "from-purple-500 to-violet-500" },
  { id: "violet", name: "Violet", gradient: "from-violet-500 to-fuchsia-500" },
  { id: "indigo", name: "Indigo", gradient: "from-indigo-500 to-purple-600" },
];
