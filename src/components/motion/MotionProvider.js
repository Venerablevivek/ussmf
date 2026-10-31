"use client";

import { MotionConfig } from "motion/react";

/** Honors the OS "reduce motion" setting for every Framer Motion animation in the app. */
export default function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
