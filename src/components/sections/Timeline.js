"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { cx } from "@/lib/format";
import Reveal from "@/components/motion/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";

const ITEMS = [
  {
    tone: "coral",
    knob: "Age 7",
    title: "First athletic journey",
    text: "Began competing in gymnastics, swimming and basketball.",
  },
  {
    tone: "sun",
    knob: "Youth",
    title: "Professional basketball",
    text: "Played at professional level and learned elite athletes’ needs first-hand.",
  },
  {
    tone: "mint",
    knob: "Study",
    title: "Medical & therapeutic studies",
    text: "Advanced education bridging sport and healthcare.",
  },
  {
    tone: "lav",
    knob: "2024",
    title: "Vision for U.S.S.M.F.",
    text: "Conceived a national federation to close gaps in athlete health and protection.",
  },
  {
    tone: "blue",
    knob: "Phase III",
    title: "Founder · CEO · President",
    text: "Established U.S.S.M.F. and became its first president.",
  },
  {
    tone: "coral",
    knob: "2026",
    title: "National network expansion",
    text: "Launching a coast-to-coast sports medicine network for all 50 states.",
  },
];

const PATH = "M30 0 C150 60 250 -20 360 20 S560 60 660 10 S860 -10 980 30";
const litCount = (p, n) =>
  Array.from({ length: n }, (_, i) => p >= i / (n - 1) - 0.02).filter(Boolean).length;

/** The founder's journey: the flight-path line draws and each milestone lights up as you scroll. */
export default function Timeline() {
  const rail = useRef(null);
  const { scrollYProgress } = useScroll({ target: rail, offset: ["start 0.85", "start 0.3"] });
  const dashoffset = useTransform(scrollYProgress, (p) => 100 - p * 100);
  const [lit, setLit] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => setLit(litCount(p, ITEMS.length)));
  useEffect(() => setLit(litCount(scrollYProgress.get(), ITEMS.length)), [scrollYProgress]);

  return (
    <div className="tl" id="timeline">
      <Reveal className="tl-title">
        <h3>A path built on passion &amp; purpose.</h3>
        <Eyebrow tone="lav">The journey</Eyebrow>
      </Reveal>
      <div className="tl-rail" ref={rail}>
        <div className="tl-path" aria-hidden="true">
          <svg viewBox="0 0 1000 60" preserveAspectRatio="none">
            <path className="base" d={PATH} vectorEffect="non-scaling-stroke" />
            <motion.path
              className="prog"
              d={PATH}
              pathLength="100"
              strokeDasharray="100"
              style={{ strokeDashoffset: dashoffset }}
            />
          </svg>
        </div>
        {ITEMS.map((item, i) => (
          <div key={item.title} className={cx("tl-item", `t-${item.tone}`, i < lit && "lit")}>
            <span className="tl-knob">{item.knob}</span>
            <div>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
