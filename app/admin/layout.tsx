"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { getSessionFromCookie } from "@/lib/session";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    // Sync session from cookie if store is empty
    if (!user) {
      const cookieSession = getSessionFromCookie("admin");
      if (cookieSession && cookieSession.role === "admin") {
        setUser(cookieSession);
        return;
      }
      router.push("/admin-login");
    } else if (user.role !== "admin") {
      router.push("/admin-login");
    }
  }, [user, setUser, router]);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg)] text-center gap-4">
        <ShieldCheck className="w-12 h-12 text-[#ff3b30] animate-bounce" />
        <h2 className="text-xl font-black text-[var(--text)]">
          Verifying Admin Credentials…
        </h2>
        <p className="text-xs text-[var(--muted)]">
          Redirecting to Admin Portal if authorized.
        </p>
        <Link href="/admin-login" className="text-xs text-[var(--accent)] hover:underline font-bold flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Login
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
