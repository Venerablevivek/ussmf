"use client";

import { useEffect, useState } from "react";

function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

// Hypotrochoid rosettes and wave lines, as in the design's security pattern.
function buildPattern() {
  const colors = ["#93C5FD", "#C4B5FD", "#FDBA9F", "#86EFAC"];
  const rosettes = [];
  for (let k = 0; k < 4; k++) {
    const R = 170 + k * 24;
    const rr = 26 + k * 7;
    const dd = 58 + k * 5;
    const tm = Math.PI * 2 * Math.min(rr / gcd(R, rr), 9);
    const pts = [];
    for (let t = 0; t <= tm + 0.01; t += 0.04) {
      pts.push(
        `${(400 + (R - rr) * Math.cos(t) + dd * Math.cos(((R - rr) / rr) * t)).toFixed(1)},${(260 + ((R - rr) * Math.sin(t) - dd * Math.sin(((R - rr) / rr) * t)) * 0.62).toFixed(1)}`,
      );
    }
    rosettes.push({ points: pts.join(" "), color: colors[k] });
  }
  const waves = [];
  for (let j = 0; j < 14; j++) {
    let d = `M-10 ${20 + j * 36}`;
    for (let x = 0; x <= 820; x += 20) d += ` L${x} ${(20 + j * 36 + Math.sin(x / 38 + j) * 9).toFixed(1)}`;
    waves.push(d);
  }
  return { rosettes, waves };
}

/** Guilloche linework, generated after mount so the server HTML stays small. */
export default function Guilloche() {
  const [pattern, setPattern] = useState(null);
  useEffect(() => setPattern(buildPattern()), []);
  return (
    <svg className="guil" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {pattern?.rosettes.map((r) => (
        <polyline
          key={r.color}
          points={r.points}
          fill="none"
          stroke={r.color}
          strokeWidth=".7"
          opacity=".7"
        />
      ))}
      {pattern?.waves.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#DCE6F7" strokeWidth=".8" />
      ))}
    </svg>
  );
}
