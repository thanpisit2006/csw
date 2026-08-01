import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserRole } from "@/lib/types";

export interface AuthUser {
  userId: string;
  studentId: string;
  name: string;
  role: UserRole;
  consentStatus: "pending" | "accepted" | "declined";
  token?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  consentStatus: "pending" | "accepted" | "declined";
  setUser: (user: AuthUser | null) => void;
  setConsentStatus: (status: "accepted" | "declined") => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      consentStatus: "pending",

      setUser: (user) => {
        if (!user) {
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            consentStatus: "pending",
          });
          return;
        }

        set({
          user,
          isAuthenticated: true,
          isAdmin: user.role === "admin",
          consentStatus: user.consentStatus || "pending",
        });
      },

      setConsentStatus: (status) => {
        set((state) => ({
          consentStatus: status,
          user: state.user ? { ...state.user, consentStatus: status } : null,
        }));
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          consentStatus: "pending",
        });
      },
    }),
    {
      name: "csw-auth-session-store",
      // Session-Only storage requirement: Session ends when browser tab/window closes
      storage: createJSONStorage(() => (typeof window !== "undefined" ? sessionStorage : localStorage)),
    }
  )
);
