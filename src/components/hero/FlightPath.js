"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/components/motion/easing";

const TRAIL =
  "M-10 330 H52 L66 330 L76 296 L88 368 L102 228 L118 410 L132 330 H176 C238 330 250 470 340 474 C452 480 548 384 520 262 C496 150 378 116 312 150 C246 184 230 66 318 34 C372 14 420 6 486 -18";
const DASHES =
  "M176 330 C238 330 250 470 340 474 C452 480 548 384 520 262 C496 150 378 116 312 150 C246 184 230 66 318 34 C372 14 420 6 486 -18";

/** The ECG line draws itself, becomes a dashed flight path, and a glowing dot loops along it. */
export default function FlightPath() {
  const reduce = useReducedMotion();
  return (
    <svg className="fp" viewBox="0 0 560 560" aria-hidden="true">
      <defs>
        <linearGradient id="fpg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="320" y2="0">
          <stop offset="0" stopColor="#FF7A6B" />
          <stop offset=".55" stopColor="#FF7A6B" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <path id="flightPath" d={TRAIL} fill="none" stroke="none" />
      <motion.path
        d={TRAIL}
        fill="none"
        stroke="url(#fpg)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.4, ease: EASE, delay: 1.05 }}
      />
      <motion.path
        d={DASHES}
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeDasharray="2 14"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: reduce ? 0 : 3.2 }}
      />
      {reduce ? null : (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 3.3 }}
        >
          <circle r="11" fill="#60A5FA" opacity=".55" filter="url(#glow)">
            <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
              <mpath href="#flightPath" />
            </animateMotion>
          </circle>
          <circle r="6" fill="#fff" stroke="#3B82F6" strokeWidth="3">
            <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
              <mpath href="#flightPath" />
            </animateMotion>
          </circle>
        </motion.g>
      )}
    </svg>
  );
}
