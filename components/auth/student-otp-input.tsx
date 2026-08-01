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
import { GraduationCap, Loader2, AlertCircle } from "lucide-react";

const OTP_LENGTH = 11;
const REQUIRED_PREFIX = "6807050";
const PREFILLED_DIGITS = ["6", "8", "0", "7", "0", "5", "0", "", "", "", ""];

export function StudentOtpInput() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [digits, setDigits] = useState<string[]>(PREFILLED_DIGITS);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first empty box (index 7) or first box on mount
    inputRefs.current[7]?.focus();
  }, []);

  const handleComplete = async (studentIdCode: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Admin Access Code override
    const adminAccessCode = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE;
    if (adminAccessCode && studentIdCode === adminAccessCode) {
      toast.info("Admin Access Code Recognized. Redirecting to Admin Portal…");
      router.push("/admin-login");
      return;
    }

    // Client-side Prefix Validation Rule 2: Must begin with 6807050
    if (!studentIdCode.startsWith(REQUIRED_PREFIX)) {
      const msg = "Student ID not found in the database.";
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
      const accessCheck = await checkStudentAccess(studentIdCode, deviceId);
      if (!accessCheck.allowed) {
        const blockMsg = accessCheck.reason || "Your account has been suspended. Please contact the administrator.";
        setErrorMessage(blockMsg);
        toast.error(blockMsg);
        setIsLoading(false);
        return;
      }

      // Upsert student record in Firestore with real client IP & device specs
      const studentRecord = await upsertStudentOnLogin(studentIdCode, deviceId, realIp, specs);

      const authUser = {
        userId: studentRecord.id,
        studentId: studentIdCode,
        name: studentRecord.name,
        role: "student" as const,
        consentStatus: studentRecord.consentStatus,
        token: `tok_student_${studentIdCode}_${Date.now()}`,
      };

      setUser(authUser);
      setSessionCookie(authUser);

      // Create session record with real IP
      createSession({
        userId: authUser.userId,
        studentId: studentIdCode,
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
        studentId: studentIdCode,
        action: "LOGIN",
        resource: "/",
        metadata: { method: "OTP Student ID Entry", loginCount: studentRecord.loginCount, deviceId },
      }).catch(() => {});

      toast.success(`Welcome! Student ID: ${studentIdCode}`);
      router.push("/");
    } catch (err) {
      console.error("Student login error:", err);
      const errText = "Student ID not found in the database.";
      setErrorMessage(errText);
      toast.error(errText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    setErrorMessage(null);
    const numeric = value.replace(/\D/g, "");
    if (!numeric) {
      const updated = [...digits];
      updated[index] = "";
      setDigits(updated);
      return;
    }

    const char = numeric[numeric.length - 1];
    const updated = [...digits];
    updated[index] = char;
    setDigits(updated);

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const completeCode = updated.join("");
    if (completeCode.length === OTP_LENGTH) {
      handleComplete(completeCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      setErrorMessage(null);
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pastedData) return;

    const newDigits = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);

    const targetIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[targetIndex]?.focus();

    if (pastedData.length === OTP_LENGTH) {
      handleComplete(pastedData);
    }
  };

  return (
    <div className="grid gap-6 w-full max-w-full overflow-hidden">
      {/* Mobile OTP Single-Row Layout: flex nowrap, space-x-1, flex-1 width to prevent wrapping */}
      <div className="w-full flex items-center justify-between gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto no-scrollbar py-1 px-0.5">
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
              maxLength={1}
              value={digit}
              disabled={isLoading}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              aria-label={`Student ID digit ${idx + 1}`}
              className={`w-full h-full rounded-lg sm:rounded-xl border text-center font-mono font-black text-sm sm:text-base md:text-lg outline-none transition-all ${
                errorMessage
                  ? "border-rose-500 bg-rose-500/10 text-rose-500"
                  : digit
                  ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] text-[var(--text)] shadow-sm"
                  : "border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-[var(--text)]"
              } focus:border-[var(--accent)] focus:ring-2 sm:focus:ring-4 focus:ring-[var(--accent2)]`}
            />
          </motion.div>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted)] animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /> Checking Student ID Authorization…
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-semibold flex items-center justify-center gap-2 text-center leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
        </div>
      )}

      <div className="p-3.5 rounded-xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--chip)_50%,transparent)] text-xs text-[var(--muted)] text-center font-medium flex items-center justify-center gap-1.5">
        <GraduationCap className="w-4 h-4 text-[var(--accent)]" /> Enter 11-digit Student ID starting with 6807050
      </div>
    </div>
  );
}
