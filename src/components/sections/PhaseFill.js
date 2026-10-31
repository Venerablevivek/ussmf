"use client";

import { motion } from "motion/react";
import { EASE } from "@/components/motion/easing";

/** The phase track's progress bar, filling (scaleX) once the track is 40% in view. */
export default function PhaseFill() {
  return (
    <motion.span
      className="fillbar"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1.8, ease: EASE }}
    />
  );
}
