"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { setSessionCookie } from "@/lib/session";
import { logActivity } from "@/lib/logger";
import { upsertStudentOnLogin, createSession, checkStudentAccess } from "@/lib/firebase/firestore-service";
import { parseDeviceSpecs, getRealClientIp } from "@/lib/logger";
import { getDeviceId } from "@/lib/utils";
import { toast } from "sonner";
import { GraduationCap, Loader2, AlertCircle, ArrowRight } from "lucide-react";

// Regex: Exactly 11 digits starting with 6807050 or 6907050
const VALID_STUDENT_ID_REGEX = /^(6807050|6907050)\d{4}$/;

export function StudentOtpInput() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [studentId, setStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCompleteLogin = async (idToSubmit: string) => {
    const cleanId = idToSubmit.trim();
    setIsLoading(true);
    setErrorMessage(null);

    // Admin Access Code override
    const adminAccessCode = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE;
    if (adminAccessCode && cleanId === adminAccessCode) {
      toast.info("Admin Access Code Recognized. Redirecting to Admin Portal…");
      router.push("/admin-login");
      return;
    }

    // Strict 11-digit prefix & length validation
    if (!VALID_STUDENT_ID_REGEX.test(cleanId)) {
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

      // Check User Block & Device Protection Status in Firestore
      const accessCheck = await checkStudentAccess(cleanId, deviceId);
      if (!accessCheck.allowed) {
        const blockMsg = accessCheck.reason || "Your account has been suspended. Please contact the administrator.";
        setErrorMessage(blockMsg);
        toast.error(blockMsg);
        setIsLoading(false);
        return;
      }

      // Upsert student record in Firestore with real client IP & device specs
      const studentRecord = await upsertStudentOnLogin(cleanId, deviceId, realIp, specs);

      const authUser = {
        userId: studentRecord.id,
        studentId: cleanId,
        name: studentRecord.name,
        role: "student" as const,
        token: `tok_student_${cleanId}_${Date.now()}`,
      };

      setUser(authUser);
      setSessionCookie(authUser);

      // Create session record with real IP
      createSession({
        userId: authUser.userId,
        studentId: cleanId,
        role: "student",
        token: authUser.token || "",
        browser: specs.browser,
        os: specs.os,
        screenSize: specs.screenSize,
        ip: realIp,
      }).catch(() => {});

      // Log activity to Firestore
      logActivity({
        userId: authUser.userId,
        studentId: cleanId,
        action: "LOGIN",
        resource: "/",
        metadata: { method: "Single Input Student ID Entry", loginCount: studentRecord.loginCount, deviceId },
      }).catch(() => {});

      toast.success(`Welcome! Student ID: ${cleanId}`);
      router.push("/");
    } catch (err) {
      console.error("Student login error:", err);
      const errText = "Please enter a valid student ID.";
      setErrorMessage(errText);
      toast.error(errText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    // Numbers only, maximum length 11, trim spaces automatically
    const val = e.target.value.replace(/\D/g, "").slice(0, 11);
    setStudentId(val);

    // Auto-submit when exactly 11 valid digits are entered
    if (val.length === 11) {
      if (VALID_STUDENT_ID_REGEX.test(val)) {
        handleCompleteLogin(val);
      } else {
        setErrorMessage("Please enter a valid student ID.");
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 11);
    setStudentId(pastedText);

    if (pastedText.length === 11) {
      if (VALID_STUDENT_ID_REGEX.test(pastedText)) {
        handleCompleteLogin(pastedText);
      } else {
        setErrorMessage("Please enter a valid student ID.");
      }
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = studentId.trim();
    if (!VALID_STUDENT_ID_REGEX.test(cleanId)) {
      setErrorMessage("Please enter a valid student ID.");
      toast.error("Please enter a valid student ID.");
      return;
    }
    handleCompleteLogin(cleanId);
  };

  return (
    <form onSubmit={handleSubmitForm} className="grid gap-6 w-full max-w-full">
      {/* Single 11-digit Student ID Input */}
      <div className="w-full relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={11}
          value={studentId}
          placeholder="68070501234"
          disabled={isLoading}
          onChange={handleInputChange}
          onPaste={handlePaste}
          aria-label="Student ID"
          className={`w-full h-14 sm:h-16 px-4 rounded-2xl border text-center font-mono font-black text-xl sm:text-2xl tracking-wider outline-none transition-all ${
            errorMessage
              ? "border-rose-500 bg-rose-500/10 text-rose-500"
              : studentId
              ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] text-[var(--text)] shadow-sm"
              : "border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-[var(--text)]"
          } focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent2)]`}
        />
        <span className="absolute -top-2.5 left-4 px-1.5 text-[10px] font-extrabold text-[var(--muted)] bg-[var(--card)] rounded-md border border-[color-mix(in_oklab,var(--border)_60%,transparent)]">
          STUDENT ID (11 DIGITS)
        </span>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted)] animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> Verifying Student ID Authorization…
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-semibold flex items-center justify-center gap-2 text-center leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
        </div>
      )}

      {/* Helper Footer Card */}
      <div className="p-3.5 rounded-2xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--chip)_50%,transparent)] text-xs text-[var(--muted)] text-center font-medium flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <GraduationCap className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <span className="truncate">Format: <strong className="font-mono text-[var(--text)]">6807050XXXX</strong> / <strong className="font-mono text-[var(--text)]">6907050XXXX</strong></span>
        </div>
        <button
          type="submit"
          disabled={isLoading || studentId.length !== 11}
          className="h-8 px-3 rounded-xl bg-[var(--accent)] text-white font-bold text-xs flex items-center gap-1 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 cursor-pointer"
        >
          Verify <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
