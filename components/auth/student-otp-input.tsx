"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/use-auth-store";
import { setSessionCookie } from "@/lib/session";
import { logActivity } from "@/lib/logger";
import { upsertStudentOnLogin, createSession, checkStudentAccess } from "@/lib/firebase/firestore-service";
import { parseDeviceSpecs, getRealClientIp } from "@/lib/logger";
import { getDeviceId } from "@/lib/utils";
import { toast } from "sonner";
import { GraduationCap, Loader2, AlertCircle, ArrowRight } from "lucide-react";

const OTP_LENGTH = 11;
const VALID_PREFIXES = ["6807050", "6907050"];

interface OtpSegmentedInputProps {
  onComplete?: (fullStudentId: string) => void;
  isLoading?: boolean;
}

export function OtpSegmentedInput({ onComplete, isLoading = false }: OtpSegmentedInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const numeric = value.replace(/\D/g, "");
    if (!numeric) {
      const updated = [...digits];
      updated[index] = "";
      setDigits(updated);
      return;
    }

    const lastChar = numeric[numeric.length - 1];
    const updated = [...digits];
    updated[index] = lastChar;
    setDigits(updated);

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = updated.join("");
    if (fullCode.length === OTP_LENGTH && onComplete) {
      onComplete(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pastedData) return;

    const newDigits = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);

    const focusIdx = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();

    if (pastedData.length === OTP_LENGTH && onComplete) {
      onComplete(pastedData);
    }
  };

  return (
    <div className="w-full flex items-center justify-between gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto no-scrollbar py-1">
      {digits.map((digit, idx) => (
        <motion.div
          key={idx}
          whileFocus={{ scale: 1.05 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="flex-1 min-w-[24px] max-w-[42px] aspect-[1/1.3] relative shrink-0"
        >
          <input
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={isLoading}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            aria-label={`Student ID digit ${idx + 1}`}
            className={`w-full h-full rounded-lg sm:rounded-xl border text-center font-mono font-black text-sm sm:text-base md:text-lg outline-none transition-all ${
              digit
                ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] text-[var(--text)] shadow-sm"
                : "border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-[var(--text)]"
            } focus:border-[var(--accent)] focus:ring-2 sm:focus:ring-4 focus:ring-[var(--accent2)]`}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function StudentOtpInput() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCompleteLogin = async (fullStudentId: string) => {
    const cleanId = fullStudentId.trim();
    setIsLoading(true);
    setErrorMessage(null);

    // Admin Access Code override
    const adminAccessCode = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE;
    if (adminAccessCode && cleanId === adminAccessCode) {
      toast.info("Admin Access Code Recognized. Redirecting to Admin Portal…");
      router.push("/admin-login");
      return;
    }

    // Validate prefix & length
    const prefix = cleanId.slice(0, 7);
    if (!VALID_PREFIXES.includes(prefix) || cleanId.length !== OTP_LENGTH) {
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
        metadata: { method: "Segmented OTP Student ID Entry", loginCount: studentRecord.loginCount, deviceId },
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

  return (
    <div className="grid gap-6 w-full max-w-full overflow-hidden">
      {/* 11-digit OTP segmented input grid */}
      <OtpSegmentedInput onComplete={handleCompleteLogin} isLoading={isLoading} />

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
      <div className="p-3.5 rounded-2xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--chip)_50%,transparent)] text-xs text-[var(--muted)] text-center font-medium flex items-center justify-center gap-1.5">
        <GraduationCap className="w-4 h-4 text-[var(--accent)] shrink-0" />
        <span>Format: <strong className="font-mono text-[var(--text)]">6807050XXXX</strong> / <strong className="font-mono text-[var(--text)]">6907050XXXX</strong></span>
      </div>
    </div>
  );
}
