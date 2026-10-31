"use client";

import { useCallback, useState } from "react";
import Image from "next/image";

/**
 * next/image that removes itself when the file is missing or fails to load, revealing whatever
 * sits underneath (the SVG seal or initials) — the design's `onerror="this.remove()"` fallback.
 */
export default function FallbackImage({ alt = "", ...props }) {
  const [failed, setFailed] = useState(false);
  // The image may have failed before hydration attached onError; check once mounted.
  const ref = useCallback((img) => {
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  if (failed) return null;
  return <Image ref={ref} alt={alt} onError={() => setFailed(true)} {...props} />;
}
