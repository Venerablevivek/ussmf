"use client";

import Link from "next/link";
import { motion } from "motion/react";
import Entrance from "@/components/motion/Entrance";
import { EASE } from "@/components/motion/easing";
import { Icon } from "@/components/ui/Icon";
import Confetti from "../Confetti";

/** Inflating check, confetti and the new application ID. */
export default function StepSuccess({ application }) {
  return (
    <div className="m-step success">
      <Confetti />
      <Entrance variant="inflate" as="span" className="bigcheck">
        <motion.svg
          className="ico"
          aria-hidden="true"
          initial={{ strokeDashoffset: 30 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
        >
          <use href="#i-check" />
        </motion.svg>
      </Entrance>
      <h3 style={{ fontSize: "clamp(24px,3vw,32px)" }}>Application submitted</h3>
      <p style={{ margin: 0, maxWidth: "46ch", color: "var(--ink-2)" }}>
        A U.S.S.M.F. physician will review your records. Keep your application ID to track progress.
      </p>
      <span className="appid">{application.publicId}</span>
      <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-3)" }}>We also emailed you a confirmation.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link className="btn btn-primary" href={`/dashboard/applications/${application.id}`}>
          Track status <Icon name="arrow" className="arrow" />
        </Link>
        <Link className="btn btn-glass" href="/dashboard">
          Done
        </Link>
      </div>
    </div>
  );
}
