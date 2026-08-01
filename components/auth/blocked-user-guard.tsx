"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/use-auth-store";
import { checkStudentAccess } from "@/lib/firebase/firestore-service";
import { getDeviceId } from "@/lib/utils";
import type { UserStatus } from "@/lib/db/mock-data";
import { ShieldAlert, Clock, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BlockedUserGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [accessState, setAccessState] = useState<{
    isBlocked: boolean;
    status: UserStatus;
    reason: string;
  }>({
    isBlocked: false,
    status: "active",
    reason: "",
  });

  useEffect(() => {
    if (!user || user.role === "admin") {
      setAccessState({ isBlocked: false, status: "active", reason: "" });
      return;
    }

    const deviceId = getDeviceId();
    checkStudentAccess(user.studentId, deviceId).then((res) => {
      if (!res.allowed) {
        setAccessState({
          isBlocked: true,
          status: res.status || "suspended",
          reason: res.reason || "Access restricted by system policy.",
        });
      } else {
        setAccessState({ isBlocked: false, status: "active", reason: "" });
      }
    });
  }, [user]);

  if (accessState.isBlocked) {
    const isExpired = accessState.status === "expired";
    const isBannedOrSuspended = accessState.status === "banned" || accessState.status === "suspended";

    return (
      <div className="fixed inset-0 z-[99999] bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] rounded-[32px] border border-[color-mix(in_oklab,var(--border)_80%,transparent)] bg-gradient-to-b from-[var(--card)] to-[var(--card2)] shadow-2xl p-8 grid gap-6 text-center animate-in zoom-in-95 duration-200">
          <div
            className={`w-20 h-20 rounded-3xl border flex items-center justify-center mx-auto shadow-inner ${
              isExpired
                ? "bg-amber-500/15 border-amber-500/30 text-amber-500"
                : "bg-rose-500/15 border-rose-500/30 text-rose-500"
            }`}
          >
            {isExpired ? <Clock className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
          </div>

          <div className="grid gap-2">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text)]">
              {isExpired ? "MEMBERSHIP EXPIRED" : "ACCESS DENIED"}
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {isExpired
                ? "Your access has expired. Please contact the administrator to renew your membership."
                : "Your account has been suspended."}
            </p>
          </div>

          {isBannedOrSuspended && accessState.reason && (
            <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold text-center">
              <span className="text-[var(--muted)] block text-[10px] uppercase tracking-wider mb-0.5">Reason</span>
              {accessState.reason}
            </div>
          )}

          <div className="p-4 rounded-2xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--chip)_60%,transparent)] grid gap-1 text-xs">
            <div className="text-[var(--muted)] font-medium flex items-center justify-center gap-1.5">
              <Mail className="w-4 h-4 text-[var(--accent)]" /> Administrator Contact
            </div>
            <div className="font-mono font-bold text-sm text-[var(--text)]">
              admin@example.com
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-1">
              If you believe this is a mistake, please contact the administrator.
            </div>
          </div>

          <Button
            type="button"
            variant="default"
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="h-11 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
