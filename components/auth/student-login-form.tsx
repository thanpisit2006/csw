"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { studentLoginSchema, StudentLoginValues } from "@/lib/schemas";
import { useAuthStore } from "@/stores/use-auth-store";
import { setSessionCookie } from "@/lib/session";
import { logActivity } from "@/lib/logger";
import { getStudentById } from "@/lib/firebase/firestore-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, GraduationCap, KeyRound } from "lucide-react";

export function StudentLoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentLoginValues>({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: {
      studentId: "",
      verificationCode: "",
    },
  });

  const onSubmit = async (values: StudentLoginValues) => {
    setIsLoading(true);
    try {
      // Query student record from Firestore
      const match = await getStudentById(values.studentId.trim());

      if (!match) {
        toast.error("Student ID not found. Please check your ID.");
        setIsLoading(false);
        return;
      }

      // Verify the verification code if the student has one
      if (match.verificationCode && match.verificationCode !== values.verificationCode.trim()) {
        toast.error("Invalid Verification Code.");

        logActivity({
          userId: match.id,
          studentId: match.studentId,
          action: "FAILED_LOGIN",
          resource: "/login",
          metadata: { reason: "Invalid verification code" },
        }).catch(() => {});

        setIsLoading(false);
        return;
      }

      const authUser = {
        userId: match.id,
        studentId: match.studentId,
        name: match.name,
        role: "student" as const,
        token: `tok_student_${match.studentId}_${Date.now()}`,
      };

      setUser(authUser);
      setSessionCookie(authUser);

      logActivity({
        userId: match.id,
        studentId: match.studentId,
        action: "LOGIN",
        resource: "/",
        metadata: { method: "StudentLoginForm" },
      }).catch(() => {});

      toast.success(`Welcome back, ${match.name}!`);
      router.push("/");
    } catch (err) {
      console.error("Student login error:", err);
      toast.error("An error occurred during student login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="studentId" className="text-xs text-[var(--muted)] flex items-center gap-1.5 font-medium">
          <GraduationCap className="w-4 h-4 text-[var(--accent)]" /> Student ID
        </label>
        <Input
          id="studentId"
          placeholder="Enter your Student ID"
          disabled={isLoading}
          {...register("studentId")}
        />
        {errors.studentId && (
          <span className="text-xs text-[#ff3b30] font-medium">
            {errors.studentId.message}
          </span>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="verificationCode" className="text-xs text-[var(--muted)] flex items-center gap-1.5 font-medium">
          <KeyRound className="w-4 h-4 text-[var(--accent)]" /> Verification Code
        </label>
        <Input
          id="verificationCode"
          type="password"
          placeholder="••••••"
          disabled={isLoading}
          {...register("verificationCode")}
        />
        {errors.verificationCode && (
          <span className="text-xs text-[#ff3b30] font-medium">
            {errors.verificationCode.message}
          </span>
        )}
      </div>

      <Button type="submit" variant="primary" disabled={isLoading} className="w-full mt-2 h-11">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Authenticating…
          </>
        ) : (
          "Sign In as Student"
        )}
      </Button>
    </form>
  );
}
