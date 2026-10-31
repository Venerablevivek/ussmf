"use client";

import { motion } from "motion/react";
import usePointerTilt from "@/hooks/usePointerTilt";

const TAGS = { div: motion.div, article: motion.article };

/** Element that tilts toward the cursor in 3D (desktop only, off with reduced motion). */
export default function Tilt({ as = "div", maxX = 8, maxY = 10, className, style, children, ...rest }) {
  const Comp = TAGS[as] || motion.div;
  const { rotateX, rotateY, handlers } = usePointerTilt({ maxX, maxY, stiffness: 120, damping: 20 });
  return (
    <Comp className={className} style={{ ...style, rotateX, rotateY }} {...handlers} {...rest}>
      {children}
    </Comp>
  );
}
