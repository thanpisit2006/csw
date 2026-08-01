"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/use-auth-store";
import { logActivity } from "@/lib/logger";
import { updateStudentConsentStatus } from "@/lib/firebase/firestore-service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck, Info, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function ConsentModal() {
  const user = useAuthStore((s) => s.user);
  const setConsentStatus = useAuthStore((s) => s.setConsentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || user.consentStatus !== "pending") {
    return null;
  }

  const handleDecision = async (status: "accepted" | "declined") => {
    setIsSubmitting(true);
    try {
      // Update consent status in Firestore
      await updateStudentConsentStatus(user.userId, status);

      // Update local Zustand store
      setConsentStatus(status);

      // Log consent decision to Firestore audit trail
      await logActivity({
        userId: user.userId,
        studentId: user.studentId,
        action: "UPDATE_CONSENT",
        resource: "consentStatus",
        metadata: { status },
      });

      if (status === "accepted") {
        toast.success("Dataset agreement accepted. Optional upload enabled.");
      } else {
        toast.info("Dataset agreement declined.");
      }
    } catch (err) {
      console.error("Consent update error:", err);
      toast.error("Failed to save consent decision. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
      <div className="w-full max-w-[480px] rounded-[24px] border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--card2)] shadow-2xl p-6 grid gap-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[color-mix(in_oklab,var(--accent)_20%,transparent)] border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] flex items-center justify-center text-[var(--accent)] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[var(--text)] tracking-tight">
              Optional Image Dataset Collection
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Student Consent Agreement
            </p>
          </div>
        </div>

        <div className="text-xs text-[var(--muted)] leading-relaxed space-y-2 p-3.5 rounded-xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--chip)_60%,transparent)]">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
            <p className="m-0">
              We offer an optional image dataset contribution feature to help train and improve wallpaper layout resolution models for future devices.
            </p>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Participation is completely <strong>optional</strong>.</li>
            <li>Files are <strong>never uploaded automatically</strong>.</li>
            <li>No files are accessed without your explicit manual action.</li>
          </ul>
        </div>

        <div className="flex items-center gap-3 justify-end flex-wrap">
          <Button
            type="button"
            variant="default"
            disabled={isSubmitting}
            onClick={() => handleDecision("declined")}
            className="flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 text-[#ff3b30]" />
            )}
            Decline
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={isSubmitting}
            onClick={() => handleDecision("accepted")}
            className="flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Accept Agreement
          </Button>
        </div>
      </div>
    </div>
  );
}
