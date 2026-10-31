import Reveal from "@/components/motion/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import Bubble from "@/components/ui/Bubble";

const PILLARS = [
  {
    tone: "coral",
    label: "Mission",
    icon: "target",
    title: "Unify American sports medicine",
    text: "Unite American athletes and sports medicine practitioners under trusted, evidence-based standards that protect and elevate every competitor.",
  },
  {
    tone: "blue",
    label: "Vision",
    icon: "eye",
    title: "Lead America to excellence",
    text: "Lead America toward international excellence and the highest level of athlete protection by setting the standard in sports medicine and athlete care.",
    mid: true,
    delay: 0.08,
    bob: "1.4s",
  },
  {
    tone: "mint",
    label: "Goals",
    icon: "rocket",
    title: "Build safer athletic ecosystems",
    text: "Build safer, fairer, stronger athletic ecosystems while expanding participation and ensuring comprehensive athlete protection nationwide.",
    delay: 0.16,
    bob: "2.6s",
  },
];

export default function Pillars() {
  return (
    <section className="sec" id="mission" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="sec-head center">
          <Eyebrow tone="coral">Federation pillars</Eyebrow>
          <h2 className="h2">
            Mission, vision &amp; <span className="grad">goals.</span>
          </h2>
          <p className="sub">The three commitments behind everything U.S.S.M.F. does.</p>
        </Reveal>
        <div className="pillars">
          {PILLARS.map((p) => (
            <Reveal
              as="article"
              key={p.label}
              className={`pillar ${p.mid ? "mid " : ""}clay t-${p.tone}`}
              delay={p.delay || 0}
              style={p.bob ? { "--dl": p.bob } : undefined}
            >
              <span className="lbl">{p.label}</span>
              <Bubble icon={p.icon} large />
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
