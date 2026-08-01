import { AuthUser } from "@/stores/use-auth-store";

const STUDENT_COOKIE_NAME = "csw_student_session";
const ADMIN_COOKIE_NAME = "csw_admin_session";

export function setSessionCookie(user: AuthUser) {
  if (typeof document === "undefined") return;
  const cookieName = user.role === "admin" ? ADMIN_COOKIE_NAME : STUDENT_COOKIE_NAME;
  const sessionData = encodeURIComponent(JSON.stringify(user));
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${cookieName}=${sessionData}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearSessionCookie(role: "student" | "admin" = "student") {
  if (typeof document === "undefined") return;
  const cookieName = role === "admin" ? ADMIN_COOKIE_NAME : STUDENT_COOKIE_NAME;
  document.cookie = `${cookieName}=; path=/; max-age=0; SameSite=Lax`;
}

export function getSessionFromCookie(role: "student" | "admin" = "student"): AuthUser | null {
  if (typeof document === "undefined") return null;
  const cookieName = role === "admin" ? ADMIN_COOKIE_NAME : STUDENT_COOKIE_NAME;
  const match = document.cookie.match(new RegExp("(^| )" + cookieName + "=([^;]+)"));
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch {
      return null;
    }
  }
  return null;
}
