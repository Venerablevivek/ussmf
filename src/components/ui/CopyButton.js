"use client";

import { useCopy } from "./Toast";
import { Icon } from "./Icon";

export default function CopyButton({ text, label }) {
  const copy = useCopy();
  return (
    <button
      type="button"
      className="copybtn"
      onClick={() => copy(text, label)}
      aria-label={`Copy ${label || text}`}
    >
      <Icon name="copy" />
    </button>
  );
}
