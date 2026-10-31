"use client";

import { useEffect, useState } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";

/** True on devices with a precise hovering pointer (desktop mouse / trackpad). */
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

/**
 * Spring-smoothed rotateX / rotateY that follow the cursor across an element (desktop only,
 * off when the user prefers reduced motion). maxX / maxY are the tilt in degrees at the edges.
 */
export default function usePointerTilt({ maxX = 9, maxY = 9, stiffness = 180, damping = 18 } = {}) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const enabled = fine && !reduce;
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness, damping });
  const rotateY = useSpring(ry, { stiffness, damping });

  function onPointerMove(e) {
    if (!enabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-y * maxX);
    ry.set(x * maxY);
  }
  function onPointerLeave() {
    rx.set(0);
    ry.set(0);
  }
  return { enabled, rotateX, rotateY, handlers: enabled ? { onPointerMove, onPointerLeave } : {} };
}
