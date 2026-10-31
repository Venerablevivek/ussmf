"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cx } from "@/lib/format";
import { SPRING } from "@/components/motion/easing";
import { Icon } from "./Icon";

/** Shared clay "pressed" pill that glides between tabs (layoutId). */
export function ActivePill({ layoutId }) {
  return (
    <motion.span layoutId={layoutId} className="tab-active" transition={{ duration: 0.5, ease: SPRING }} />
  );
}

/**
 * Accessible tablist: arrow keys move between tabs, Home/End jump. Items: { id, label, icon? }.
 * With `hrefs`, renders navigation links (aria-current) instead of tabs.
 */
export default function Tabs({ items, value, onChange, label, layoutId = "app-tab", className }) {
  const refs = useRef([]);
  const isNav = items.some((i) => i.href);

  function onKeyDown(e, index) {
    const keys = { ArrowRight: 1, ArrowLeft: -1, Home: "first", End: "last" };
    if (!(e.key in keys)) return;
    e.preventDefault();
    let next = keys[e.key] === "first" ? 0 : keys[e.key] === "last" ? items.length - 1 : index + keys[e.key];
    next = (next + items.length) % items.length;
    refs.current[next]?.focus();
    if (!isNav) onChange?.(items[next].id);
  }

  return (
    <div className={cx("app-tabs", className)} role={isNav ? undefined : "tablist"} aria-label={label}>
      {items.map((item, i) => {
        const active = item.id === value;
        const inner = (
          <>
            {active ? <ActivePill layoutId={layoutId} /> : null}
            {item.icon ? <Icon name={item.icon} /> : null}
            {item.label}
            {item.count ? (
              <span className="badge t-coral" style={{ padding: "1px 8px" }}>
                {item.count}
              </span>
            ) : null}
          </>
        );
        if (item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              ref={(el) => (refs.current[i] = el)}
              aria-current={active ? "page" : undefined}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {inner}
            </Link>
          );
        }
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            ref={(el) => (refs.current[i] = el)}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange?.(item.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
