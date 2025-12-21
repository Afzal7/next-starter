"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

interface FadeInRightProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

// Simple fade-in (opacity only) for global use
export function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration,
        delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Fade-in from left to right for dashboard pages
export function FadeInRight({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
}: FadeInRightProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
