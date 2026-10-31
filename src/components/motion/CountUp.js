"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { easeOutQuart } from "./easing";

function format(value, { plain, suffix }) {
  const n = Math.round(value);
  return (plain ? String(n) : n.toLocaleString("en-US")) + (suffix || "");
}

/**
 * Counts up to `to` over 1.6s with an ease-out-quart, like the design's data-count.
 * `plain` (years) counts from to − 30 without thousands separators. Server-renders the final value.
 */
export default function CountUp({
  to,
  suffix = "",
  plain = false,
  delay = 0.15,
  onMount = false,
  as: Tag = "b",
  className,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || reduce || !(onMount || inView) || !ref.current) return undefined;
    started.current = true;
    const from = plain ? to - 30 : 0;
    ref.current.textContent = format(from, { plain, suffix });
    const controls = animate(from, to, {
      duration: 1.6,
      delay,
      ease: easeOutQuart,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v, { plain, suffix });
      },
    });
    return () => controls.stop();
  }, [inView, onMount, reduce, to, plain, suffix, delay]);

  return (
    <Tag ref={ref} className={className}>
      {format(to, { plain, suffix })}
    </Tag>
  );
}
