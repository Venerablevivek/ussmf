import Reveal from "@/components/motion/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import Bubble from "@/components/ui/Bubble";
import { LinkButton } from "@/components/ui/Button";

const SERVICES = [
  {
    tone: "sun",
    icon: "trophy",
    title: "Championship & General Medicine",
    text: "Medical care for athletes from international competition to recreational flying, across every air sports discipline.",
    href: "#disciplines",
  },
  {
    tone: "mint",
    icon: "shield",
    title: "Injury Prevention",
    text: "Evidence-based protocols for landing impacts, spinal loading, G-force exposure and hypoxia, applied before injuries happen.",
    href: "#disciplines",
    delay: 0.06,
  },
  {
    tone: "blue",
    icon: "steth",
    title: "Diagnosis & Treatment",
    text: "Advanced evaluation of flight-related injuries and conditions using current diagnostic technology.",
    href: "#certification",
    delay: 0.12,
  },
  {
    tone: "coral",
    icon: "pulse",
    title: "Rehabilitation",
    text: "Personalized programs that bring athletes back to the air safely, with clear medical clearance at each stage.",
    href: "#certification",
  },
  {
    tone: "lav",
    icon: "flask",
    title: "Research & Education",
    text: "Research, professional education and clinical training that grow the science of air sports medicine.",
    href: "#mission",
    delay: 0.06,
  },
  {
    tone: "sun",
    icon: "doc",
    title: "Insurance & Compensation",
    text: "Athlete insurance support, accident documentation and compensation assistance for sports-related injuries.",
    href: "#related",
    delay: 0.12,
  },
];

export default function Services() {
  return (
    <section className="sec" id="services" style={{ paddingTop: "clamp(40px,6vw,80px)" }}>
      <div className="wrap">
        <Reveal className="sec-head center">
          <Eyebrow tone="mint">What we do</Eyebrow>
          <h2 className="h2">
            Comprehensive <span className="grad">air sports medicine.</span>
          </h2>
          <p className="sub">
            Six pillars of athlete care, from the first pre-flight screening to the return to competition.
          </p>
        </Reveal>
        <div className="svc-grid">
          {SERVICES.map((s, i) => (
            <Reveal as="article" key={s.title} className={`svc clay t-${s.tone}`} delay={s.delay || 0} tilt>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <Bubble icon={s.icon} large />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <LinkButton href={s.href}>Learn more</LinkButton>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
