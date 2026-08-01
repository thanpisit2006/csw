import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ThemeChoice, EffectiveTheme } from "@/lib/types";
import { CONFIG } from "@/lib/constants";

interface ThemeState {
  choice: ThemeChoice;
  effectiveTheme: EffectiveTheme;
  setChoice: (choice: ThemeChoice) => void;
  syncSystemTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      choice: "system",
      effectiveTheme: "dark",
      setChoice: (choice: ThemeChoice) => {
        const validChoice = CONFIG.validThemes.includes(choice) ? choice : "system";
        let eff: EffectiveTheme = "dark";
        if (typeof window !== "undefined") {
          const isLight = window.matchMedia("(prefers-color-scheme: light)").matches;
          eff = validChoice === "system" ? (isLight ? "light" : "dark") : validChoice;
          
          if (validChoice === "dark" || validChoice === "light") {
            document.documentElement.dataset.theme = validChoice;
          } else {
            delete document.documentElement.dataset.theme;
          }
        }
        set({ choice: validChoice, effectiveTheme: eff });
      },
      syncSystemTheme: () => {
        const { choice } = get();
        if (choice === "system" && typeof window !== "undefined") {
          const isLight = window.matchMedia("(prefers-color-scheme: light)").matches;
          set({ effectiveTheme: isLight ? "light" : "dark" });
        }
      },
    }),
    {
      name: CONFIG.storageKeys.theme,
    }
  )
);
