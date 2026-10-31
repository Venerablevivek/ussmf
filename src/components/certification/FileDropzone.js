"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cx, formatBytes } from "@/lib/format";
import { SPRING } from "@/components/motion/easing";
import { Icon } from "@/components/ui/Icon";

const RING = 75.4;

function statusText(item) {
  if (item.state === "done") return "Encrypted & uploaded";
  if (item.state === "error") return item.error;
  return item.progress >= 0.98 ? "Checking file…" : "Uploading…";
}

/** Drag-and-drop zone with per-file progress rings and remove buttons (uploads via useUpload). */
export default function FileDropzone({ upload, error, id = "aFiles" }) {
  const [over, setOver] = useState(false);
  const { items, addFiles, remove } = upload;

  return (
    <>
      <label
        className={cx("drop", over && "over")}
        htmlFor={id}
        onDragEnter={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          addFiles(e.dataTransfer?.files);
        }}
      >
        <input
          type="file"
          id={id}
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          aria-describedby={`${id}-err`}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="bubble lg t-blue">
          <Icon name="upload" />
        </span>
        <b>Drag files here or tap to browse</b>
        <span>Files are encrypted before review</span>
      </label>
      <div className="files" aria-live="polite">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.key}
              className="fchip t-blue"
              layout
              initial={{ opacity: 0.2, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4, ease: SPRING }}
            >
              <span className="bubble">
                <Icon name={item.mimeType === "application/pdf" ? "file" : "doc"} />
              </span>
              <div className="fn">
                <b>{item.name}</b>
                <span className={item.state === "error" ? "bad" : undefined}>
                  {formatBytes(item.size)} · <i>{statusText(item)}</i>
                </span>
              </div>
              <svg
                className={cx("fring", item.state === "done" && "done", item.state === "error" && "failed")}
                viewBox="0 0 30 30"
                role="progressbar"
                aria-label={`Upload progress for ${item.name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(item.progress * 100)}
              >
                <circle className="bg" cx="15" cy="15" r="12" />
                <circle
                  className="fg"
                  cx="15"
                  cy="15"
                  r="12"
                  strokeDashoffset={(RING * (1 - item.progress)).toFixed(1)}
                />
              </svg>
              <button
                type="button"
                className="xbtn"
                aria-label={`Remove ${item.name}`}
                onClick={() => remove(item)}
              >
                <Icon name="x" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <span className="err" id={`${id}-err`} role={error ? "alert" : undefined}>
        {error || ""}
      </span>
    </>
  );
}
