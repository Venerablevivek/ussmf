import Reveal from "@/components/motion/Reveal";
import CountUp from "@/components/motion/CountUp";
import Eyebrow, { Tag } from "@/components/ui/Eyebrow";

const STATS = [
  { tone: "blue", to: 50, label: "States in the network plan" },
  { tone: "coral", to: 8, label: "Air sports disciplines covered", delay: 0.06 },
  { tone: "mint", to: 6, label: "Pillars of athlete care", delay: 0.12 },
  { tone: "lav", to: 100, suffix: "%", label: "Athlete-centered approach", delay: 0.18 },
];

const OUTLINE =
  "M118 92 L300 72 L470 82 L560 94 L600 116 L642 104 L702 132 L756 124 L818 94 L872 82 L902 112 L884 152 L862 172 L834 202 L824 242 L794 284 L782 332 L744 370 L726 410 L762 470 L782 528 L752 540 L722 482 L684 444 L624 442 L564 462 L524 502 L502 540 L470 520 L432 470 L392 452 L332 462 L292 422 L232 402 L172 382 L132 342 L102 272 L84 202 L92 142 Z";

const HUBS = [
  { x: 200, y: 240, color: "#FF7A6B", label: "West Coast", delay: "0s" },
  { x: 520, y: 210, color: "#A78BFA", label: "Midwest", delay: ".6s" },
  { x: 580, y: 400, color: "#FFC857", label: "South", delay: "1.2s" },
  { x: 800, y: 200, color: "#3B82F6", label: "East Coast", delay: "1.8s" },
];

export default function Impact() {
  return (
    <section className="sec" id="impact" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="impact">
          <div style={{ display: "grid", gap: 26 }}>
            <Reveal className="sec-head" style={{ margin: 0 }}>
              <Eyebrow tone="blue">Our impact</Eyebrow>
              <h2 className="h2">
                Designed for <span className="grad">national scale.</span>
              </h2>
              <p className="sub">
                Network figures go live at launch. These are the building blocks we are launching with.
              </p>
            </Reveal>
            <div className="istats">
              {STATS.map((s) => (
                <Reveal key={s.label} className={`istat clay t-${s.tone}`} delay={s.delay || 0} hover="lift">
                  <CountUp to={s.to} suffix={s.suffix} />
                  <span>{s.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal className="map-card clay" delay={0.1}>
            <svg
              viewBox="0 0 960 600"
              role="img"
              aria-label="Stylized map of the United States with regional network hubs"
            >
              <defs>
                <linearGradient id="mapG" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#EEF4FF" />
                  <stop offset="1" stopColor="#DCE8FF" />
                </linearGradient>
                <filter id="mapSh" x="-10%" y="-10%" width="130%" height="130%">
                  <feDropShadow dx="14" dy="18" stdDeviation="16" floodColor="#3B82F6" floodOpacity=".18" />
                </filter>
                <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="8" cy="8" r="2" fill="#BFD3F5" />
                </pattern>
              </defs>
              <path
                filter="url(#mapSh)"
                fill="url(#mapG)"
                stroke="#fff"
                strokeWidth="18"
                strokeLinejoin="round"
                d={OUTLINE}
              />
              <path fill="url(#dots)" opacity=".7" d={OUTLINE} />
              <g
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeDasharray="3 9"
                strokeLinecap="round"
                opacity=".55"
              >
                <path d="M200 240 Q360 150 520 210" />
                <path d="M520 210 Q660 150 800 200" />
                <path d="M520 210 Q560 320 580 400" />
                <path d="M200 240 Q380 360 580 400" />
                <path d="M800 200 Q700 330 580 400" />
              </g>
              {HUBS.map((h) => (
                <g className="mdot" key={h.label}>
                  <circle
                    className="halo"
                    cx={h.x}
                    cy={h.y}
                    r="16"
                    fill={h.color}
                    opacity=".5"
                    style={{ animationDelay: h.delay }}
                  />
                  <circle cx={h.x} cy={h.y} r="12" fill={h.color} stroke="#fff" strokeWidth="4" />
                </g>
              ))}
              <g fontWeight="800" fontSize="22" fill="#0F1B3D" style={{ fontFamily: "var(--f-body)" }}>
                {HUBS.map((h) => (
                  <text key={h.label} x={h.x} y={h.y + 45} textAnchor="middle">
                    {h.label}
                  </text>
                ))}
              </g>
            </svg>
            <div className="map-legend">
              <Tag tone="blue" icon="pin">
                Regional hubs planned for Phase IV
              </Tag>
              <Tag tone="mint">All 50 states</Tag>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
