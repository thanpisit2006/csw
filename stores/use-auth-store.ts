import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserRole } from "@/lib/types";

export interface AuthUser {
  userId: string;
  studentId: string;
  name: string;
  role: UserRole;
  token?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      setUser: (user) => {
        if (!user) {
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
          });
          return;
        }

        set({
          user,
          isAuthenticated: true,
          isAdmin: user.role === "admin",
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },
    }),
    {
      name: "csw-auth-session-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? sessionStorage : localStorage)),
    }
  )
);
