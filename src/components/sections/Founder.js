import Reveal from "@/components/motion/Reveal";
import Bubble from "@/components/ui/Bubble";
import FallbackImage from "@/components/ui/FallbackImage";
import Timeline from "./Timeline";

const CHIPS = [
  { cls: "fc1", tone: "coral", icon: "star", label: "First Persian-Descent President" },
  { cls: "fc2", tone: "blue", icon: "building", label: "Founded U.S.S.M.F. 2025", delay: "1.2s" },
  { cls: "fc3", tone: "mint", icon: "pulse", label: "Lifelong Athlete", delay: "2.1s" },
  { cls: "fc4", tone: "lav", icon: "steth", label: "Medical & Therapeutic Expert", delay: ".6s" },
];

export default function Founder() {
  return (
    <section className="sec" id="founder">
      <div
        className="blob"
        style={{ width: 460, height: 460, background: "var(--coral-t)", right: -160, top: 40 }}
      />
      <div className="wrap">
        <div className="founder-grid">
          <Reveal className="f-photo">
            <div className="f-frame">
              <div className="f-img">
                <span className="mono">SD</span>
                <FallbackImage
                  src="/assets/sanaz.jpg"
                  alt="Dr. Sanaz Derakhshani Jan, President of U.S.S.M.F."
                  fill
                  sizes="(max-width: 900px) 90vw, 440px"
                />
              </div>
            </div>
            {CHIPS.map((c) => (
              <span
                key={c.cls}
                className={`f-chip clay-sm t-${c.tone} ${c.cls}`}
                style={c.delay ? { "--dl": c.delay } : undefined}
              >
                <Bubble icon={c.icon} />
                {c.label}
              </span>
            ))}
          </Reveal>
          <Reveal className="f-copy" delay={0.08}>
            <span className="role">Founder · CEO · President</span>
            <h2>Dr. Sanaz Derakhshani Jan</h2>
            <p className="sub">First President of the United States Sports Medicine Federation</p>
            <p className="bio">
              Sport has been her passion since childhood. She began competing at age seven in gymnastics,
              swimming and basketball, and later combined that athletic background with medical and
              therapeutic education to establish U.S.S.M.F., a first-of-its-kind national institution
              dedicated entirely to athlete health and performance.
            </p>
            <blockquote className="quote clay t-lav">
              <span className="qm" aria-hidden="true">
                “
              </span>
              An athlete’s greatest victory is the one they live to celebrate.
              <cite>Dr. Sanaz Derakhshani Jan</cite>
            </blockquote>
          </Reveal>
        </div>
        <Timeline />
      </div>
    </section>
  );
}
