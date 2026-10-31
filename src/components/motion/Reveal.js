"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cx } from "@/lib/format";
import usePointerTilt from "@/hooks/usePointerTilt";
import { EASE, SPRING } from "./easing";

const TAGS = {
  div: motion.div,
  article: motion.article,
  section: motion.section,
  span: motion.span,
  p: motion.p,
  h2: motion.h2,
  ul: motion.ul,
  form: motion.form,
  blockquote: motion.blockquote,
};

const HOVERS = {
  lift: { y: -6 },
  "lift-tilt": { y: -6, rotate: -0.6 },
};

const HOVER_TRANSITION = { duration: 0.5, ease: SPRING };

/**
 * Scroll reveal from the design (.rv): rises 34px and scales from .94 once, when 12% visible.
 * Optional spring hover lift (`hover="lift"`), and cursor tilt (`tilt`) for the service cards.
 * Adds the "in" class once revealed, for CSS that keys off it (the integrity strike-through).
 */
export default function Reveal({
  as = "div",
  delay = 0,
  hover,
  tilt = false,
  className,
  style,
  children,
  ...rest
}) {
  const Comp = TAGS[as] || motion.div;
  const [seen, setSeen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const pointer = usePointerTilt({ maxX: 9, maxY: 9 });
  const tilting = tilt && pointer.enabled;

  return (
    <Comp
      className={cx(className, seen && "in")}
      initial={{ opacity: 0, y: 34, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      onViewportEnter={() => setSeen(true)}
      onAnimationComplete={() => setRevealed(true)}
      whileHover={hover || tilting ? HOVERS[hover || "lift"] : undefined}
      transition={
        revealed
          ? HOVER_TRANSITION
          : { opacity: { duration: 0.7, ease: EASE, delay }, default: { duration: 0.9, ease: SPRING, delay } }
      }
      style={
        tilting
          ? { ...style, rotateX: pointer.rotateX, rotateY: pointer.rotateY, transformPerspective: 900 }
          : style
      }
      {...(tilting ? pointer.handlers : {})}
      {...rest}
    >
      {children}
    </Comp>
  );
}
