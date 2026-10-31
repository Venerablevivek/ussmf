import Reveal from "@/components/motion/Reveal";
import { Tag } from "@/components/ui/Eyebrow";

export default function Integrity() {
  return (
    <section className="sec integrity" id="integrity">
      <div className="wrap">
        <div className="int-grid">
          <div className="int-copy">
            <Reveal as="span" className="eyebrow t-coral" style={{ justifySelf: "start" }}>
              Declaration of integrity
            </Reveal>
            <Reveal as="h2" className="int-h" id="intH">
              American sports are <span className="strike">not for sale.</span>
            </Reveal>
            <Reveal as="p">
              American sports belong to the athletes and the people who love them. U.S.S.M.F. is built so that
              sports medicine is run by science, healthcare professionals and integrity, with every decision
              made in the athlete’s interest.
            </Reveal>
            <Reveal as="p">
              We commit to open finances, independent medical judgment and zero tolerance for conflicts of
              interest. We are here to restore the honor and values of American sport.
            </Reveal>
            <Reveal className="int-pills">
              <Tag tone="coral" icon="scale">
                Justice &amp; transparency
              </Tag>
              <Tag tone="blue" icon="shield">
                Athlete protection
              </Tag>
              <Tag tone="mint" icon="flask">
                Science-driven
              </Tag>
              <Tag tone="lav" icon="lock">
                Financial transparency
              </Tag>
            </Reveal>
            <div className="int-stats">
              <Reveal className="istat clay t-coral" hover="lift">
                <b>0</b>
                <span>Tolerance for corruption</span>
              </Reveal>
              <Reveal className="istat clay t-blue" delay={0.06} hover="lift">
                <b>100%</b>
                <span>Athlete focused</span>
              </Reveal>
              <Reveal className="istat clay t-lav" delay={0.12} hover="lift">
                <b>∞</b>
                <span>Commitment to integrity</span>
              </Reveal>
            </div>
          </div>
          <div className="ptag-wrap" aria-hidden="true">
            <div className="ptag">
              <span className="string" />
              <span className="hole" />
              <span className="stamp">NOT FOR SALE</span>
              <small>Price</small>
              <span className="price">$ —</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
