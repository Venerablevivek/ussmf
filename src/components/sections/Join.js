import Reveal from "@/components/motion/Reveal";
import { JoinClouds } from "@/components/hero/Clouds";
import NewsletterForm from "./NewsletterForm";

export default function Join() {
  return (
    <section className="sec" id="join" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="join">
          <JoinClouds />
          <div className="join-in">
            <div>
              <h2>Join the future of sports medicine.</h2>
              <p>
                Be the first to know when U.S.S.M.F. officially launches. Together we build a healthier,
                stronger athletic America.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
