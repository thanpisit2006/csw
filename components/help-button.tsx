"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { HelpModal } from "./help-modal";

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        aria-label="Open how to use guide"
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -3, 0]
        }}
        transition={{
          opacity: { duration: 0.3 },
          scale: { duration: 0.3 },
          y: {
            duration: 3,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }
        }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 shadow-[0_8px_32px_rgba(245,158,11,0.25)] backdrop-blur-xl text-amber-200 hover:text-white font-medium text-xs tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        <div className="p-1 rounded-full bg-amber-400/30 flex items-center justify-center">
          <Lightbulb className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
        </div>
        <span className="font-semibold text-white drop-shadow-sm">How to Use</span>
      </motion.button>

      {/* Instructions Modal */}
      <HelpModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
