"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { adminLoginSchema, AdminLoginValues } from "@/lib/schemas";
import { useAuthStore } from "@/stores/use-auth-store";
import { setSessionCookie } from "@/lib/session";
import { logActivity } from "@/lib/logger";
import { auth } from "@/lib/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { checkStudentAccess, upsertStudentOnLogin } from "@/lib/firebase/firestore-service";
import { parseDeviceSpecs, getRealClientIp } from "@/lib/logger";
import { getDeviceId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpSegmentedInput } from "@/components/auth/student-otp-input";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";

const VALID_PREFIXES = ["6807050", "6907050"];

export function AdminLoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loginMethod, setLoginMethod] = useState<"otp" | "credentials">("otp");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleAdminStudentIdComplete = async (fullStudentId: string) => {
    const cleanId = fullStudentId.trim();
    setIsLoading(true);
    setErrorMessage(null);

    const prefix = cleanId.slice(0, 7);
    if (!VALID_PREFIXES.includes(prefix) || cleanId.length !== 11) {
      const msg = "Please enter a valid student ID.";
      setErrorMessage(msg);
      toast.error(msg);
      setIsLoading(false);
      return;
    }

    try {
      const deviceId = getDeviceId();
      const specs = parseDeviceSpecs();
      const realIp = await getRealClientIp();

      const accessCheck = await checkStudentAccess(cleanId, deviceId);
      if (!accessCheck.allowed) {
        const blockMsg = accessCheck.reason || "Account suspended. Contact administrator.";
        setErrorMessage(blockMsg);
        toast.error(blockMsg);
        setIsLoading(false);
        return;
      }

      const studentRecord = await upsertStudentOnLogin(cleanId, deviceId, realIp, specs);

      const authUser = {
        userId: studentRecord.id,
        studentId: cleanId,
        name: studentRecord.name,
        role: "admin" as const,
        token: `tok_admin_student_${cleanId}_${Date.now()}`,
      };

      setUser(authUser);
      setSessionCookie(authUser);

      logActivity({
        userId: authUser.userId,
        studentId: cleanId,
        action: "LOGIN",
        resource: "/admin/dashboard",
        metadata: { method: "Segmented OTP Admin Student ID", deviceId },
      }).catch(() => {});

      toast.success(`Admin Login Successful! ID: ${cleanId}`);
      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Admin Student ID login error:", err);
      const errText = "Please enter a valid student ID.";
      setErrorMessage(errText);
      toast.error(errText);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitCredentials = async (values: AdminLoginValues) => {
    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const fbUser = credential.user;

      const authUser = {
        userId: fbUser.uid,
        studentId: "ADMIN",
        name: fbUser.displayName || values.email.split("@")[0] || "Administrator",
        role: "admin" as const,
        consentStatus: "accepted" as const,
        token: await fbUser.getIdToken(),
      };

      setUser(authUser);
      setSessionCookie(authUser);

      logActivity({
        userId: fbUser.uid,
        studentId: "ADMIN",
        action: "LOGIN",
        resource: "/admin/dashboard",
        metadata: { email: values.email, method: "Firebase Email/Password" },
      }).catch(() => {});

      toast.success("Admin Authorization Granted.");
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      console.error("Admin login error:", err);

      logActivity({
        userId: "unknown",
        studentId: "ADMIN",
        action: "FAILED_LOGIN",
        resource: "/admin-login",
        metadata: { email: values.email, reason: "Invalid credentials" },
      }).catch(() => {});

      const code = (err as { code?: string })?.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        toast.error("Invalid admin credentials. Access denied.");
      } else if (code === "auth/too-many-requests") {
        toast.error("Too many failed attempts. Account temporarily locked.");
      } else {
        toast.error("Authentication error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-5">
      {/* Login Mode Selector Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[color-mix(in_oklab,var(--chip)_70%,transparent)] border border-[color-mix(in_oklab,var(--border)_70%,transparent)] text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setLoginMethod("otp");
          }}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            loginMethod === "otp"
              ? "bg-[var(--card)] text-[var(--text)] shadow-sm border border-[color-mix(in_oklab,var(--border)_60%,transparent)]"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-[var(--accent)]" /> Student ID OTP
        </button>
        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setLoginMethod("credentials");
          }}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            loginMethod === "credentials"
              ? "bg-[var(--card)] text-[var(--text)] shadow-sm border border-[color-mix(in_oklab,var(--border)_60%,transparent)]"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-[var(--accent)]" /> Email & Password
        </button>
      </div>

      {loginMethod === "otp" ? (
        <div className="grid gap-5">
          <OtpSegmentedInput onComplete={handleAdminStudentIdComplete} isLoading={isLoading} />

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted)] animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> Verifying Admin Student ID…
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-semibold flex items-center justify-center gap-2 text-center leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmitCredentials)} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-xs text-[var(--muted)] flex items-center gap-1.5 font-medium">
              <Mail className="w-4 h-4 text-[var(--accent)]" /> Admin Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@domain.com"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <span className="text-xs text-[#ff3b30] font-medium">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-xs text-[var(--muted)] flex items-center gap-1.5 font-medium">
              <Lock className="w-4 h-4 text-[var(--accent)]" /> Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <span className="text-xs text-[#ff3b30] font-medium">
                {errors.password.message}
              </span>
            )}
          </div>

          <Button type="submit" variant="primary" disabled={isLoading} className="w-full mt-2 h-11">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Authenticating Admin…
              </>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Admin Sign In
              </span>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
