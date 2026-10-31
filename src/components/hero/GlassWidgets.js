"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Entrance from "@/components/motion/Entrance";
import { EASE } from "@/components/motion/easing";
import { Icon } from "@/components/ui/Icon";

/** Glass "Resting heart rate" (beating heart, live bpm) and "Physician review · Approved" (filling ring). */
export default function GlassWidgets() {
  const reduce = useReducedMotion();
  const [bpm, setBpm] = useState(62);

  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => setBpm(60 + Math.round(Math.random() * 5)), 1800);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <>
      <Entrance variant="slidein" delay={2.2} className="gw glass gw-heart">
        <span className="heart-ic">
          <Icon name="heart" />
        </span>
        <span>
          Resting heart rate
          <b>
            <span>{bpm}</span> bpm
          </b>
        </span>
      </Entrance>
      <Entrance variant="slidein" delay={2.4} className="gw glass gw-status">
        <svg className="ring" viewBox="0 0 40 40" aria-hidden="true">
          <circle className="bg" cx="20" cy="20" r="17" />
          <motion.circle
            className="fg"
            cx="20"
            cy="20"
            r="17"
            initial={{ strokeDashoffset: reduce ? 0 : 107 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.6, ease: EASE, delay: 2.8 }}
          />
        </svg>
        <span>
          Physician review<b style={{ color: "var(--mint-d)" }}>Approved</b>
        </span>
      </Entrance>
    </>
  );
}
