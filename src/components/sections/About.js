import Reveal from "@/components/motion/Reveal";
import CountUp from "@/components/motion/CountUp";
import Eyebrow from "@/components/ui/Eyebrow";
import Bubble from "@/components/ui/Bubble";
import { LinkButton } from "@/components/ui/Button";

const VALUES = [
  { tone: "blue", icon: "dna", label: "Evidence-Based" },
  { tone: "sun", icon: "medal", label: "Sovereign Excellence" },
  { tone: "mint", icon: "shield", label: "Athlete Protection" },
  { tone: "lav", icon: "book", label: "Research-Driven" },
  { tone: "coral", icon: "globe", label: "Nationwide" },
  { tone: "blue", icon: "cross", label: "Medical Excellence" },
];

export default function About() {
  return (
    <section className="sec" id="about">
      <div
        className="blob"
        style={{ width: 420, height: 420, background: "var(--lav-t)", right: -120, top: 60 }}
      />
      <div className="wrap">
        <div className="about-grid">
          <Reveal className="about-copy">
            <Eyebrow tone="blue" style={{ justifySelf: "start" }}>
              About U.S.S.M.F.
            </Eyebrow>
            <h2 className="h2">
              Protecting athletes at <span className="grad">every altitude.</span>
            </h2>
            <p>
              The United States Sports Medicine Federation is dedicated to maintaining and promoting athlete
              health, preventing injuries, providing rehabilitation services, supporting research and
              education, and ensuring access to sports insurance and medical protection.
            </p>
            <p>
              From elite aerobatic pilots to weekend paraglider pilots and youth drone racers, U.S.S.M.F.
              delivers a unified, trusted, science-backed framework that every American athlete deserves.
            </p>
            <div>
              <LinkButton href="#services">Explore our services</LinkButton>
            </div>
          </Reveal>
          <div className="bento">
            <Reveal className="btile big clay t-blue" delay={0.05} hover="lift">
              <Bubble icon="globe" large />
              <CountUp to={50} as="div" className="bignum" />
              <h3>National coverage vision</h3>
              <p>
                A coast-to-coast network of physicians, clinics and state boards serving athletes in every
                state.
              </p>
            </Reveal>
            <Reveal className="btile clay t-sun" delay={0.12} hover="lift">
              <Bubble icon="star" />
              <h3>Elite</h3>
              <p>Medical standards built for the demands of flight.</p>
            </Reveal>
            <Reveal className="btile clay t-lav" delay={0.19} hover="lift">
              <Bubble icon="micro" />
              <h3>Research</h3>
              <p>Driven programs that turn data into safer sport.</p>
            </Reveal>
          </div>
        </div>
      </div>
      <div className="marquee" aria-label="Our values">
        <div className="marquee-track">
          {[0, 1].map((copy) =>
            VALUES.map((v) => (
              <span
                key={`${copy}-${v.label}`}
                className={`vpill clay-sm t-${v.tone}`}
                aria-hidden={copy === 1 ? "true" : undefined}
              >
                <Bubble icon={v.icon} />
                {v.label}
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
