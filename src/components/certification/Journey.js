"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { cx } from "@/lib/format";
import Bubble from "@/components/ui/Bubble";

const STEPS = [
  {
    tone: "blue",
    icon: "user",
    title: "Create profile",
    text: "Your details, discipline and federation membership.",
  },
  {
    tone: "lav",
    icon: "upload",
    title: "Upload records",
    text: "Recent physical, ECG, vision and any specialist reports.",
  },
  {
    tone: "sun",
    icon: "steth",
    title: "Physician review",
    text: "A U.S.S.M.F. physician reviews your file against the standard.",
  },
  {
    tone: "coral",
    icon: "pulse",
    title: "Fitness assessment",
    text: "An in-person or tele-assessment when the review calls for one.",
  },
  {
    tone: "mint",
    icon: "medal",
    title: "Certificate issued",
    text: "A digital certificate with a QR code anyone can verify.",
  },
];

const WAVE = "M0 12 C120 -6 180 30 250 12 S380 -6 500 12 S620 30 750 12 S880 -6 1000 12";

const litCount = (p, n) =>
  Array.from({ length: n }, (_, i) => p >= i / (n - 1) - 0.02).filter(Boolean).length;

/** Five-step journey whose connecting line fills, and steps lift, as you scroll. */
export default function Journey() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "start 0.25"] });
  const dashoffset = useTransform(scrollYProgress, (p) => 100 - p * 100);
  const [lit, setLit] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => setLit(litCount(p, STEPS.length)));
  useEffect(() => setLit(litCount(scrollYProgress.get(), STEPS.length)), [scrollYProgress]);

  return (
    <div className="journey" id="journey" ref={ref}>
      <div className="journey-line" aria-hidden="true">
        <svg viewBox="0 0 1000 24" preserveAspectRatio="none">
          <path
            d={WAVE}
            fill="none"
            stroke="#DCE6F7"
            strokeWidth="4"
            strokeDasharray="3 12"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <motion.path
            d={WAVE}
            fill="none"
            stroke="url(#tlg)"
            strokeWidth="5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength="100"
            strokeDasharray="100"
            style={{ strokeDashoffset: dashoffset }}
          />
        </svg>
      </div>
      {STEPS.map((s, i) => (
        <div key={s.title} className={cx("jstep", `t-${s.tone}`, i < lit && "lit")}>
          <Bubble icon={s.icon} />
          <span className="n">STEP {i + 1}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </div>
      ))}
    </div>
  );
}
