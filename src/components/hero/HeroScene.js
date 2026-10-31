"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useFinePointer } from "@/hooks/usePointerTilt";
import FlightPath from "./FlightPath";
import OrbitChips from "./OrbitChips";
import GlassWidgets from "./GlassWidgets";
import { SPRING } from "@/components/motion/easing";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * The orchestrated hero scene: flight path, dropping + bobbing certificate that tilts toward
 * the cursor, orbiting chips, glass widgets. Moving the pointer over the hero also drives the
 * cloud parallax; scrolling eases the whole scene down and out.
 */
export default function HeroScene({ certificate }) {
  const ref = useRef(null);
  const heroHeight = useRef(800);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, (y) => (reduce ? 0 : clamp(y / (heroHeight.current * 0.9), 0, 1)));
  const y = useTransform(progress, (p) => p * 90);
  const scale = useTransform(progress, (p) => 1 - p * 0.08);
  const opacity = useTransform(progress, (p) => 1 - p * 0.7);

  useEffect(() => {
    const scene = ref.current;
    const hero = scene?.closest(".hero");
    if (!hero) return undefined;
    const measure = () => (heroHeight.current = hero.offsetHeight);
    measure();
    window.addEventListener("resize", measure);
    if (!fine || reduce) return () => window.removeEventListener("resize", measure);

    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      const s = scene.getBoundingClientRect();
      const sx = (e.clientX - (s.left + s.width / 2)) / s.width;
      const sy = (e.clientY - (s.top + s.height / 2)) / s.height;
      scene.style.setProperty("--ry", `${clamp(sx * 22, -16, 16).toFixed(2)}deg`);
      scene.style.setProperty("--rx", `${clamp(-sy * 22, -16, 16).toFixed(2)}deg`);
    };
    const onLeave = () => {
      hero.style.setProperty("--mx", 0);
      hero.style.setProperty("--my", 0);
      scene.style.setProperty("--rx", "0deg");
      scene.style.setProperty("--ry", "0deg");
    };
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("resize", measure);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, [fine, reduce]);

  return (
    <motion.div className="hero-scene" id="scene" ref={ref} style={{ y, scale, opacity }}>
      <FlightPath />
      <div className="cert-stage" id="certStage">
        <motion.div
          initial={{ opacity: 0, y: -140, rotate: -14, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: SPRING, delay: 0.55 }}
        >
          <div className="cert-bob">{certificate}</div>
        </motion.div>
      </div>
      <OrbitChips />
      <GlassWidgets />
    </motion.div>
  );
}
