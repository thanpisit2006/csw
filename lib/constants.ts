import { DevicePreset, ProfileKey, ScheduleItem } from "./types";

export const CONFIG = {
  storageKeys: {
    theme: "swm-theme",
    scheduleProfile: "swm-schedule-profile",
    scheduleKeyFor: (profile: string) => `swm-schedule-${profile}`,
  },
  defaultBgSrc: "assets/default-bg.jpg",
  zoom: { min: 1, max: 6 },
  customSize: { min: 200, max: 8000 },
  timeRange: { start: 8.5, end: 16.5 },
  validProfiles: ["bank", "mickey", "film"] as ProfileKey[],
  validThemes: ["dark", "light", "system"] as const,
  dayLabels: { Mon: "MON", Tue: "TUE", Wed: "WED", Thu: "THU", Fri: "FRI", Sat: "SAT", Sun: "SUN" } as Record<string, string>,
  profileTitles: {
    bank: "iCPE 2/2025 (Bank)",
    mickey: "iCPE 2/2025 (Mickey)",
    film: "iCPE 2/2025 (Film)",
  } as Record<ProfileKey, string>,
};

export const DEVICE_PRESETS: DevicePreset[] = [
  { id: "1320x2868_17pm", label: "iPhone 17 Pro Max (1320×2868)", width: 1320, height: 2868 },
  { id: "1206x2622_17p", label: "iPhone 17 / 17 Pro (1206×2622)", width: 1206, height: 2622 },
  { id: "1320x2868_16pm", label: "iPhone 16 Pro Max (1320×2868)", width: 1320, height: 2868 },
  { id: "1206x2622_16p", label: "iPhone 16 Pro (1206×2622)", width: 1206, height: 2622 },
  { id: "1290x2796_16plus", label: "iPhone 16 Plus (1290×2796)", width: 1290, height: 2796 },
  { id: "1179x2556_16", label: "iPhone 16 (1179×2556)", width: 1179, height: 2556 },
  { id: "1290x2796_1415pm", label: "iPhone 14/15 Pro Max (1290×2796)", width: 1290, height: 2796 },
  { id: "1179x2556_1415p", label: "iPhone 14/15 Pro (1179×2556)", width: 1179, height: 2556 },
  { id: "1284x2778_1213pm", label: "iPhone 12/13 Pro Max (1284×2778)", width: 1284, height: 2778 },
  { id: "1170x2532_121314", label: "iPhone 12/13/14 (1170×2532)", width: 1170, height: 2532 },
  { id: "1125x2436_xxs11p", label: "iPhone X/XS/11 Pro (1125×2436)", width: 1125, height: 2436 },
];

export const DEFAULT_SCHEDULES: Record<ProfileKey, ScheduleItem[]> = {
  bank: [
    { day: "Mon", start: 10.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9d7a5" },
    { day: "Tue", start: 11.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9a9d9" },
    { day: "Tue", start: 13.5, end: 16.5, title: "GEN121 S42", room: "ONLINE", color: "#d9a9d9" },
    { day: "Wed", start: 10.5, end: 12.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
    { day: "Wed", start: 13.5, end: 15.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
    { day: "Thu", start: 8.5, end: 11.5, title: "MTH102 S32", room: "CB2507", color: "#d9bfa9" },
    { day: "Thu", start: 13.5, end: 15.5, title: "CPE121 S31", room: "CPE1115", color: "#d9bfa9" },
    { day: "Fri", start: 8.5, end: 10.5, title: "CPE121 S31", room: "CPE1119", color: "#a9cfe0" },
    { day: "Fri", start: 13.5, end: 16.5, title: "LNG222 S9", room: "CB1301", color: "#a9cfe0" },
  ],
  mickey: [
    { day: "Mon", start: 10.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9d7a5" },
    { day: "Tue", start: 11.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9a9d9" },
    { day: "Tue", start: 13.5, end: 16.5, title: "GEN121 S43", room: "ONLINE", color: "#d9a9d9" },
    { day: "Wed", start: 10.5, end: 12.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
    { day: "Wed", start: 13.5, end: 15.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
    { day: "Thu", start: 8.5, end: 11.5, title: "MTH102 S31", room: "CB2506", color: "#d9bfa9" },
    { day: "Thu", start: 13.5, end: 15.5, title: "CPE121 S31", room: "CPE1115", color: "#d9bfa9" },
    { day: "Fri", start: 8.5, end: 10.5, title: "CPE121 S31", room: "CPE1119", color: "#a9cfe0" },
    { day: "Fri", start: 13.5, end: 16.5, title: "LNG222 S9", room: "CB1301", color: "#a9cfe0" },
  ],
  film: [
    { day: "Mon", start: 10.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9d7a5" },
    { day: "Tue", start: 11.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9a9d9" },
    { day: "Tue", start: 13.5, end: 16.5, title: "GEN121 S42", room: "ONLINE", color: "#d9a9d9" },
    { day: "Wed", start: 10.5, end: 12.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
    { day: "Wed", start: 13.5, end: 15.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
    { day: "Thu", start: 8.5, end: 11.5, title: "MTH102 S32", room: "CB2507", color: "#d9bfa9" },
    { day: "Thu", start: 13.5, end: 15.5, title: "CPE121 S31", room: "CPE1115", color: "#d9bfa9" },
    { day: "Fri", start: 8.5, end: 10.5, title: "CPE121 S31", room: "CPE1119", color: "#a9cfe0" },
    { day: "Fri", start: 13.5, end: 16.5, title: "LNG222 S9", room: "CB1301", color: "#a9cfe0" },
  ],
};
