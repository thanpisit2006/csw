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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = async (values: AdminLoginValues) => {
    setIsLoading(true);
    try {
      // Authenticate admin with Firebase Authentication
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

      // Log admin login audit event to Firestore
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

      // Log failed login attempt
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
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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
  );
}
