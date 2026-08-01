import { useThemeStore } from "@/stores/use-theme-store";

export function useTheme() {
  const choice = useThemeStore((s) => s.choice);
  const effectiveTheme = useThemeStore((s) => s.effectiveTheme);
  const setChoice = useThemeStore((s) => s.setChoice);
  const syncSystemTheme = useThemeStore((s) => s.syncSystemTheme);

  return {
    choice,
    effectiveTheme,
    setChoice,
    syncSystemTheme,
  };
}
