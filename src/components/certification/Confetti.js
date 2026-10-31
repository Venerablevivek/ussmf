"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const COLORS = ["#3B82F6", "#FF7A6B", "#34D399", "#FFC857", "#A78BFA", "#60A5FA"];

/** One burst of clay-colored confetti (skipped when the user prefers reduced motion). */
export default function Confetti() {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return undefined;
    const c = ref.current;
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    ctx.scale(dpr, dpr);
    const parts = Array.from({ length: 160 }, (_, i) => ({
      x: w / 2 + (Math.random() - 0.5) * 120,
      y: h * 0.42,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 15 - 5,
      r: Math.random() * 6 + 4,
      c: COLORS[i % COLORS.length],
      a: Math.random() * 6,
      va: (Math.random() - 0.5) * 0.3,
      round: Math.random() < 0.5,
    }));
    const t0 = performance.now();
    let frame;
    const tick = (t) => {
      const elapsed = t - t0;
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.vy += 0.38;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.va;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 3200);
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 2, 0, 7);
          ctx.fill();
        } else {
          ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        }
        ctx.restore();
      });
      if (elapsed < 3200) frame = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  return <canvas ref={ref} className="confetti" aria-hidden="true" />;
}
