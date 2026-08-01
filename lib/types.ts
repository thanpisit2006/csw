export type ProfileKey = "bank" | "mickey" | "film";
export type ThemeChoice = "dark" | "light" | "system";
export type EffectiveTheme = "dark" | "light";
export type UserRole = "student" | "admin";

export interface ScheduleItem {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" | string;
  start: number;
  end: number;
  title: string;
  room?: string;
  color?: string;
}

export interface DevicePreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface CropState {
  zoom: number;
  sx: number;
  sy: number;
  key: string;
}
