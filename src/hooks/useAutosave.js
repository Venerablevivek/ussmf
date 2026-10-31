"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Debounced autosave. queue(patch) merges changes and saves them after `delay` ms of quiet;
 * flush() saves immediately and resolves when everything queued so far is stored.
 * status: "idle" | "saving" | "saved" | "error".
 */
export default function useAutosave(save, { delay = 800 } = {}) {
  const pending = useRef({});
  const timer = useRef(null);
  const chain = useRef(Promise.resolve());
  const saveRef = useRef(save);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const patch = pending.current;
    if (!Object.keys(patch).length) return chain.current;
    pending.current = {};
    setStatus("saving");
    chain.current = chain.current
      .catch(() => {})
      .then(() => saveRef.current(patch))
      .then(
        () => {
          setStatus("saved");
          setError(null);
        },
        (err) => {
          // Keep the unsaved changes so the next save retries them.
          pending.current = { ...patch, ...pending.current };
          setStatus("error");
          setError(err);
          throw err;
        },
      );
    return chain.current;
  }, []);

  const queue = useCallback(
    (patch) => {
      Object.assign(pending.current, patch);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => flush().catch(() => {}), delay);
    },
    [flush, delay],
  );

  // Save whatever is pending if the tab is hidden or closed.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flush().catch(() => {});
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      clearTimeout(timer.current);
    };
  }, [flush]);

  return { queue, flush, status, error };
}
