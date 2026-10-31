"use client";

import { motion } from "motion/react";
import { EASE, SPRING } from "./easing";

const TAGS = { div: motion.div, span: motion.span, p: motion.p };

// The design's page-load entrance keyframes, as Framer Motion presets.
const PRESETS = {
  fadeup: { from: { opacity: 0, y: 18 }, duration: 0.9, ease: EASE },
  word: { from: { opacity: 0, y: 46, rotate: 4 }, duration: 0.9, ease: SPRING },
  slidein: { from: { opacity: 0, y: 24, scale: 0.9 }, duration: 0.9, ease: SPRING },
  drop: { from: { opacity: 0, y: -140, rotate: -14, scale: 0.8 }, duration: 1.2, ease: SPRING },
  pop: { from: { opacity: 0, scale: 0.2 }, duration: 0.7, ease: SPRING },
  inflate: { from: { opacity: 0, scale: 0.2, rotate: -20 }, duration: 0.9, ease: SPRING },
  panel: { from: { opacity: 0.2, y: 14, scale: 0.985 }, duration: 0.55, ease: SPRING },
  result: { from: { opacity: 0.2, y: 14, scale: 0.985 }, duration: 0.5, ease: SPRING },
};

/** Plays a one-time entrance when mounted (hero sequence, result cards, success states). */
export default function Entrance({
  as = "div",
  variant = "fadeup",
  delay = 0,
  duration,
  className,
  style,
  children,
  ...rest
}) {
  const Comp = TAGS[as] || motion.div;
  const preset = PRESETS[variant];
  const to = Object.fromEntries(
    Object.keys(preset.from).map((k) => [k, k === "opacity" ? 1 : k === "scale" ? 1 : 0]),
  );
  return (
    <Comp
      className={className}
      style={style}
      initial={preset.from}
      animate={to}
      transition={{ duration: duration ?? preset.duration, ease: preset.ease, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
