"use client";

import { motion } from "motion/react";
import { EASE } from "@/components/motion/easing";

/** The paper plane that swoops in and lands beside "Fly." (the design's planein keyframes). */
export function PlaneIn() {
  return (
    <motion.svg
      className="plane"
      viewBox="0 0 24 24"
      aria-hidden="true"
      initial={{ opacity: 0, x: "-3.4em", y: "-1.6em", rotate: -30, scale: 0.6 }}
      animate={{
        opacity: [0, 1, 1],
        x: ["-3.4em", "0.35em", "0em"],
        y: ["-1.6em", "-0.4em", "0em"],
        rotate: [-30, 18, 0],
        scale: [0.6, 1.05, 1],
      }}
      transition={{ duration: 1.6, delay: 0.6, times: [0, 0.55, 1], ease: [EASE, EASE] }}
    >
      <path
        d="M21.5 2.5 2.5 10l7.2 2.6L12.3 20z"
        fill="#fff"
        stroke="#3B82F6"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.7 12.6 21.5 2.5 12.3 20l-1.2-5.3z"
        fill="#DCE9FF"
        stroke="#3B82F6"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}
