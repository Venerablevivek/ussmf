"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SPRING } from "@/components/motion/easing";
import { Icon } from "./Icon";

const ToastContext = createContext({ toast: () => {} });

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const seq = useRef(0);

  const toast = useCallback((message, { icon = "check", tone } = {}) => {
    const id = ++seq.current;
    setItems((list) => [...list.slice(-3), { id, message, icon, tone }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 3400);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite" role="status">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              className={t.tone === "bad" ? "toast bad" : "toast"}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, transition: { duration: 0.4 } }}
              transition={{ duration: 0.5, ease: SPRING }}
            >
              <Icon name={t.icon} />
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext).toast;
}

/** Copies text with a toast, falling back to a hidden textarea where the Clipboard API is unavailable. */
export function useCopy() {
  const toast = useToast();
  return useCallback(
    async (text, label) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } catch {
          // Nothing else to try; the toast still confirms what was selected.
        }
        ta.remove();
      }
      toast(`${label || text} copied`);
    },
    [toast],
  );
}
