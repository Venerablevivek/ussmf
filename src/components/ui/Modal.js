"use client";

import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cx } from "@/lib/format";
import useFocusTrap from "@/hooks/useFocusTrap";
import { SPRING } from "@/components/motion/easing";
import { Icon } from "./Icon";

function ModalInner({ onClose, title, subtitle, size, children, footer }) {
  const ref = useRef(null);
  const titleId = useId();
  useFocusTrap(ref, true, onClose);
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <motion.div
        className="modal-bg"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        ref={ref}
        className={cx("modal-card", size === "sm" && "sm")}
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.6, ease: SPRING }}
      >
        <div className="m-head">
          <div className="m-title">
            <h2 id={titleId}>
              {title}
              {subtitle ? <small>{subtitle}</small> : null}
            </h2>
            <button className="round" onClick={onClose} aria-label="Close" style={{ width: 44, height: 44 }}>
              <Icon name="x" />
            </button>
          </div>
        </div>
        <div className="m-body">{children}</div>
        {footer ? <div className="m-foot">{footer}</div> : null}
      </motion.div>
    </div>
  );
}

/** Clay modal dialog with focus trap, Escape to close and a spring entrance. */
export default function Modal({ open, ...props }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>{open ? <ModalInner key="modal" {...props} /> : null}</AnimatePresence>,
    document.body,
  );
}
