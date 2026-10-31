import { Fragment } from "react";
import Link from "next/link";
import { appUrl } from "@/server/env";
import Entrance from "@/components/motion/Entrance";
import CountUp from "@/components/motion/CountUp";
import { Icon } from "@/components/ui/Icon";
import FallbackImage from "@/components/ui/FallbackImage";
import Clouds from "@/components/hero/Clouds";
import HeroScene from "@/components/hero/HeroScene";
import HeroCertificate from "@/components/hero/HeroCertificate";
import { PlaneIn } from "@/components/hero/PlaneIn";

const WORDS_1 = ["Fit", "to"];
const WORDS_2 = ["Certified", "by", "Science."];
const wordDelay = (i) => 0.15 + i * 0.08;

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <Clouds />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div>
            <Entrance
              as="span"
              variant="fadeup"
              duration={0.7}
              className="pill"
              style={{ display: "inline-flex" }}
            >
              <i className="dot" /> Launching Phase IV · Air Sports Medicine
            </Entrance>
          </div>
          <h1 className="hero-h">
            {WORDS_1.map((w, i) => (
              <Fragment key={w}>
                <Entrance as="span" variant="word" delay={wordDelay(i)} className="w">
                  {w}
                </Entrance>{" "}
              </Fragment>
            ))}
            <Entrance as="span" variant="word" delay={wordDelay(2)} className="w fly">
              Fly.
              <PlaneIn />
            </Entrance>
            <br />
            {WORDS_2.map((w, i) => (
              <Fragment key={w}>
                <Entrance as="span" variant="word" delay={wordDelay(i + 3)} className="w">
                  {w}
                </Entrance>
                {i < WORDS_2.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h1>
          <Entrance as="p" variant="fadeup" delay={0.65} className="lede">
            The United States Sports Medicine Federation protects air-sports athletes with evidence-based
            medical review, injury prevention, rehabilitation and an official fitness certificate recognized
            across the sport.
          </Entrance>
          <Entrance variant="fadeup" delay={0.8} className="cta-row">
            <Link className="btn btn-primary" href="/apply">
              Apply for Certificate <Icon name="arrow" className="arrow" />
            </Link>
            <a className="btn btn-glass" href="#verify">
              <Icon name="qr" /> Verify a Certificate
            </a>
          </Entrance>
          <Entrance variant="fadeup" delay={0.95} className="hero-stats">
            <div className="hstat clay-sm t-blue">
              <CountUp to={2025} plain onMount delay={1} />
              <span>Founded</span>
            </div>
            <div className="hstat clay-sm t-coral">
              <CountUp to={50} onMount delay={1} />
              <span>States in our vision</span>
            </div>
            <div className="hstat clay-sm t-mint">
              <CountUp to={100} suffix="%" onMount delay={1} />
              <span>Athlete focused</span>
            </div>
          </Entrance>
          <Entrance variant="fadeup" delay={1.1} className="allied-strip">
            <span>Allied with</span>
            <span className="ally-badge t-blue">
              <span className="mono-badge">
                WASF
                <FallbackImage src="/assets/wasflogo.png" alt="" fill sizes="64px" />
              </span>
              W.A.S.F.
            </span>
            <span className="ally-badge t-coral">
              <span className="mono-badge">
                USASF
                <FallbackImage src="/assets/usasflogo.jpg" alt="" fill sizes="64px" />
              </span>
              U.S.A.S.F.
            </span>
          </Entrance>
        </div>
        <HeroScene certificate={<HeroCertificate verifyUrl={`${appUrl()}/verify/USSMF-AS-2026-10482`} />} />
      </div>
      <div className="scroll-cue" aria-hidden="true">
        <i />
        Scroll
      </div>
    </section>
  );
}
