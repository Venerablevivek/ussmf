"use client";

import { useEffect } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab focus inside `ref` while `active`, closes on Escape, locks page scroll and
 * returns focus to the previously focused element afterwards.
 */
export default function useFocusTrap(ref, active, onEscape) {
  useEffect(() => {
    if (!active) return undefined;
    const previous = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(ref.current?.querySelectorAll(FOCUSABLE) || []).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
    const first = setTimeout(() => {
      const target = ref.current?.querySelector("[data-autofocus]") || focusables()[0];
      target?.focus();
    }, 40);

    function onKey(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape?.();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        lastEl.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        firstEl.focus();
        e.preventDefault();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(first);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (previous && typeof previous.focus === "function") previous.focus();
    };
  }, [active, ref, onEscape]);
}
