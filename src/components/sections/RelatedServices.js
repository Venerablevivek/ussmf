import Reveal from "@/components/motion/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import Bubble from "@/components/ui/Bubble";
import { LinkButton } from "@/components/ui/Button";

const ITEMS = [
  {
    tone: "blue",
    w: 3,
    icon: "shield",
    title: "Sports Insurance",
    text: "Coverage for athletes at every level, from first flight to world championships.",
  },
  {
    tone: "coral",
    w: 3,
    icon: "doc",
    title: "Accident Claims Support",
    text: "Guided assistance through every step of the claims process.",
    delay: 0.06,
  },
  {
    tone: "mint",
    w: 2,
    icon: "file",
    title: "Medical Documentation",
    text: "Professional records for injury and recovery tracking.",
  },
  {
    tone: "sun",
    w: 2,
    icon: "building",
    title: "Board Coordination",
    text: "Integration support with state medical and sports boards.",
    delay: 0.06,
  },
  {
    tone: "lav",
    w: 2,
    icon: "users",
    title: "Athlete Protection",
    text: "Rights, advocacy and welfare programs.",
    delay: 0.12,
  },
  {
    tone: "coral",
    w: 3,
    icon: "heart",
    title: "Sports Health Initiatives",
    text: "Community and nationwide wellness programs for athletes and families.",
  },
];

export default function RelatedServices() {
  return (
    <section className="sec" id="related" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <Eyebrow tone="lav">Related services</Eyebrow>
          <h2 className="h2">
            All-encompassing <span className="grad">care.</span>
          </h2>
        </Reveal>
        <div className="rel-grid">
          {ITEMS.map((it) => (
            <Reveal
              as="article"
              key={it.title}
              className={`rel clay t-${it.tone} w${it.w}`}
              delay={it.delay || 0}
              hover="lift-tilt"
            >
              <Bubble icon={it.icon} large={it.w === 3} />
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </Reveal>
          ))}
          <Reveal as="article" className="rel clay t-blue w3" delay={0.06} hover="lift-tilt">
            <Bubble icon="medal" large />
            <h3>Medical Fitness Certification</h3>
            <p>
              The official U.S.S.M.F. certificate for air sports athletes.{" "}
              <LinkButton href="#certification" style={{ display: "inline-flex" }}>
                Start here
              </LinkButton>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
