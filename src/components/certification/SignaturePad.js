"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

const EXPORT_WIDTH = 600;

/**
 * Signature canvas (mouse, pen or finger). The ref exposes toDataURL(), returning a small PNG
 * scaled to at most 600px wide, and isEmpty().
 */
export default function SignaturePad({ ref, onChange, describedBy }) {
  const canvas = useRef(null);
  const drawing = useRef(false);
  const inked = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const setup = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    if (!r.width) return;
    const dpr = window.devicePixelRatio || 1;
    const previous = inked.current ? c.toDataURL() : null;
    c.width = r.width * dpr;
    c.height = r.height * dpr;
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = "#1E3A8A";
    if (previous) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height);
      img.src = previous;
    }
  }, []);

  useEffect(() => {
    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(canvas.current);
    return () => ro.disconnect();
  }, [setup]);

  const point = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  function clear() {
    const c = canvas.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    inked.current = false;
    setHasInk(false);
    onChange?.(false);
  }

  useImperativeHandle(ref, () => ({
    isEmpty: () => !inked.current,
    clear,
    toDataURL: () => {
      const c = canvas.current;
      const scale = Math.min(1, EXPORT_WIDTH / c.width);
      const out = document.createElement("canvas");
      out.width = Math.round(c.width * scale);
      out.height = Math.round(c.height * scale);
      out.getContext("2d").drawImage(c, 0, 0, out.width, out.height);
      return out.toDataURL("image/png");
    },
  }));

  return (
    <div className="sigpad">
      <canvas
        ref={canvas}
        aria-label="Signature pad"
        aria-describedby={describedBy}
        role="img"
        onPointerDown={(e) => {
          drawing.current = true;
          canvas.current.setPointerCapture(e.pointerId);
          const p = point(e);
          const ctx = canvas.current.getContext("2d");
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const p = point(e);
          const ctx = canvas.current.getContext("2d");
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          if (!inked.current) {
            inked.current = true;
            setHasInk(true);
            onChange?.(true);
          }
        }}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
      />
      <span className="ph" style={{ opacity: hasInk ? 0 : 1 }}>
        Sign here with your mouse or finger
      </span>
      <button type="button" className="link-btn clear" onClick={clear}>
        Clear
      </button>
    </div>
  );
}
