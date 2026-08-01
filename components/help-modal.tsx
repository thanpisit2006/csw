"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X, CheckCircle2, Sparkles, Smartphone } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  // Handle ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-[32px] bg-[color-mix(in_oklab,var(--card)_85%,transparent)] border border-white/20 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-[var(--text)] select-none z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close guide modal"
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[var(--text)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Lightbulb className="w-6 h-6 fill-amber-400" />
              </div>
              <div>
                <h2 id="help-modal-title" className="text-xl font-bold tracking-tight">
                  How to Use
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  Create your own iPhone-style class schedule wallpaper in just a few steps.
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Steps
              </h3>

              <div className="grid gap-2.5 text-xs">
                {[
                  "Enter your Student ID.",
                  "Choose your class schedule.",
                  "Upload your wallpaper photo.",
                  "Drag to reposition the image.",
                  "Pinch or scroll to zoom.",
                  "Download the high-resolution wallpaper.",
                  "Apply it as your Lock Screen wallpaper."
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-[11px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium pt-0.5 leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" /> Pro Tips
              </div>
              <ul className="space-y-1.5 text-[var(--muted)] list-disc list-inside text-[11px] leading-relaxed">
                <li>Double tap to reset the wallpaper image.</li>
                <li>Your uploaded wallpaper is saved automatically.</li>
                <li>Your class schedule syncs from Firebase.</li>
                <li>Your previous wallpapers can be restored later.</li>
                <li>Designed to feel right at home on iOS.</li>
              </ul>
            </div>

            {/* Footer Action */}
            <div className="mt-6">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-[var(--accent)] text-white font-semibold text-xs shadow-lg hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent)] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Got it, let&apos;s go!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
