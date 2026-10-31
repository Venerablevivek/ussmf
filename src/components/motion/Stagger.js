"use client";

import { motion } from "motion/react";
import { SPRING } from "./easing";

/** Variants for a child of <Stagger>: rises 16px and fades in on the design's spring. */
export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: SPRING } },
};

/** Children with `variants={staggerItem}` rise in one after another (the design's 55ms menu cascade). */
export function Stagger({ step = 0.055, className, style, children, ...rest }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{ hidden: {}, show: { transition: { staggerChildren: step, delayChildren: step } } }}
      initial="hidden"
      animate="show"
      {...rest}
    >
      {children}
    </motion.div>
  );
}
