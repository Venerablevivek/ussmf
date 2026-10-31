import Reveal from "@/components/motion/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import Bubble from "@/components/ui/Bubble";
import CopyButton from "@/components/ui/CopyButton";
import ContactForm from "./ContactForm";

export default function Contact() {
  return (
    <section className="sec" id="contact" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <Eyebrow tone="sun">Get in touch</Eyebrow>
          <h2 className="h2">
            Contact the <span className="grad">federation.</span>
          </h2>
          <p className="sub">
            Questions about certification, partnership or getting involved? We would love to hear from you.
          </p>
        </Reveal>
        <div className="contact-grid">
          <div className="cinfo">
            <Reveal className="ci clay t-blue">
              <Bubble icon="mail" />
              <h3>Federation email</h3>
              {["info@ussmf.org", "president@ussmf.org"].map((email) => (
                <div className="copyline" key={email}>
                  <code>{email}</code>
                  <CopyButton text={email} />
                </div>
              ))}
            </Reveal>
            <Reveal className="ci clay t-coral" delay={0.06}>
              <Bubble icon="building" />
              <h3>Headquarters</h3>
              <p>United States of America. Full address available at launch.</p>
            </Reveal>
            <Reveal className="ci clay t-mint">
              <Bubble icon="cal" />
              <h3>Official launch</h3>
              <p>Phase IV. Nationwide operations commence.</p>
            </Reveal>
            <Reveal className="ci clay t-lav" delay={0.06}>
              <Bubble icon="phone" />
              <h3>Phone</h3>
              <p>Contact details available upon official launch.</p>
            </Reveal>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
