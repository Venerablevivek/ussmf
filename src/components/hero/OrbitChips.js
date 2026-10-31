"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ORBIT_CHIPS, SELECT_DISCIPLINE_EVENT } from "@/lib/disciplines";
import { SPRING } from "@/components/motion/easing";
import { Icon } from "@/components/ui/Icon";

/**
 * Six discipline chips orbiting the certificate on an ellipse, scaled by depth.
 * Hover or focus pauses the orbit and shows the tooltip; clicking selects that discipline
 * in the Disciplines section and scrolls to it.
 */
export default function OrbitChips() {
  const ref = useRef(null);
  const slots = useRef([]);
  const paused = useRef(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let t = 0;
    let last = performance.now();
    let frame = 0;
    const place = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const n = slots.current.length;
      slots.current.forEach((slot, i) => {
        if (!slot) return;
        const a = t + i * ((Math.PI * 2) / n) + 0.4;
        const x = w / 2 + Math.cos(a) * w * 0.43;
        const y = h / 2 + Math.sin(a) * h * 0.38;
        const depth = (Math.sin(a) + 1) / 2;
        slot.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${(0.82 + depth * 0.26).toFixed(3)})`;
        slot.style.zIndex = Math.sin(a) > -0.15 ? 5 : 2;
      });
    };
    if (reduce) {
      place();
      const ro = new ResizeObserver(place);
      ro.observe(el);
      return () => ro.disconnect();
    }
    const loop = (now) => {
      const dt = Math.min(now - last, 50);
      last = now;
      if (!paused.current) t += dt * 0.00011;
      place();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  function select(id) {
    window.dispatchEvent(new CustomEvent(SELECT_DISCIPLINE_EVENT, { detail: { id, scroll: true } }));
  }

  const pause = () => (paused.current = true);
  const resume = () => (paused.current = false);

  return (
    <div className="chip-orbit" ref={ref}>
      {ORBIT_CHIPS.map((chip, i) => (
        <div
          key={chip.id}
          className="dchip-slot"
          style={{ "--s": `${chip.size}px` }}
          ref={(el) => (slots.current[i] = el)}
        >
          <motion.button
            type="button"
            className={`dchip t-${chip.tone}`}
            aria-label={chip.ariaLabel || chip.label}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: SPRING, delay: 1.6 + i * 0.12 }}
            onPointerEnter={pause}
            onPointerLeave={resume}
            onFocus={pause}
            onBlur={resume}
            onClick={() => select(chip.id)}
          >
            <Icon name={chip.icon} />
            <span className="tip">{chip.label}</span>
          </motion.button>
        </div>
      ))}
    </div>
  );
}
