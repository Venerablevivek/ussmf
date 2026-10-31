"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import useFocusTrap from "@/hooks/useFocusTrap";
import { Icon, Seal } from "@/components/ui/Icon";
import { Stagger, staggerItem } from "@/components/motion/Stagger";

/** Full-screen clay menu for small screens, with a focus trap and Escape to close. */
export default function MobileNav({ links, account, onClose }) {
  const ref = useRef(null);
  useFocusTrap(ref, true, onClose);
  return (
    <motion.div
      ref={ref}
      className="mnav"
      id="mnav"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mnav-top">
        <span className="brand">
          <span className="logo-slot">
            <Seal />
          </span>
          U.S.S.M.F.
        </span>
        <button className="round" onClick={onClose} aria-label="Close menu" data-autofocus>
          <Icon name="x" />
        </button>
      </div>
      <Stagger style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {links.map((link) => (
          <motion.a
            key={link.href}
            variants={staggerItem}
            className="ml clay-sm"
            href={link.href}
            onClick={onClose}
          >
            {link.label} <Icon name="arrow" />
          </motion.a>
        ))}
        {account ? (
          <motion.div variants={staggerItem}>
            <Link className="ml clay-sm" href={account.href} onClick={onClose}>
              {account.label} <Icon name={account.icon || "user"} />
            </Link>
          </motion.div>
        ) : null}
        <motion.div variants={staggerItem}>
          <Link
            className="btn btn-primary"
            href="/apply"
            onClick={onClose}
            style={{ marginTop: 8, width: "100%" }}
          >
            Apply for Certificate <Icon name="arrow" className="arrow" />
          </Link>
        </motion.div>
      </Stagger>
    </motion.div>
  );
}
