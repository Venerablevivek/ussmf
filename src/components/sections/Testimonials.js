"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Reveal from "@/components/motion/Reveal";
import { SPRING } from "@/components/motion/easing";
import Eyebrow from "@/components/ui/Eyebrow";
import Bubble from "@/components/ui/Bubble";
import { Icon } from "@/components/ui/Icon";

const QUOTES = [
  {
    tone: "sun",
    icon: "medal",
    quote:
      "“The U.S.S.M.F. represents a transformative shift in how we approach athlete healthcare. A national standard has long been overdue.”",
    who: "Future Member Athlete",
    role: "Elite Track & Field Competitor",
  },
  {
    tone: "blue",
    icon: "steth",
    quote:
      "“An organization that finally bridges the gap between high-performance sport and quality medical care for every athlete.”",
    who: "Future Partner Physician",
    role: "Sports Medicine Specialist",
  },
  {
    tone: "coral",
    icon: "pulse",
    quote:
      "“The insurance and rehabilitation frameworks alone will change lives. Athletes deserve this kind of structured, professional support.”",
    who: "Future Certified Coach",
    role: "Strength & Conditioning Expert",
  },
];

/**
 * Draggable, snap-scrolling testimonial carousel with arrows, dots and autoplay.
 * Autoplay pauses while hovered or focused and is off with reduced motion.
 */
export default function Testimonials() {
  const track = useRef(null);
  const cards = useRef([]);
  const drag = useRef(null);
  const paused = useRef(false);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const reduce = useReducedMotion();

  const go = useCallback(
    (i) => {
      const n = QUOTES.length;
      const next = (i + n) % n;
      const el = track.current;
      const card = cards.current[next];
      if (!el || !card) return;
      el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 6, behavior: reduce ? "auto" : "smooth" });
      setIndex(next);
    },
    [reduce],
  );

  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => {
      if (!paused.current && !drag.current) go(indexRef.current + 1);
    }, 5500);
    return () => clearInterval(id);
  }, [go, reduce]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  function onScroll() {
    const el = track.current;
    let best = 0;
    let bestDistance = Infinity;
    cards.current.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - el.offsetLeft - 6 - el.scrollLeft);
      if (d < bestDistance) {
        bestDistance = d;
        best = i;
      }
    });
    setIndex(best);
  }

  useEffect(() => {
    const move = (e) => {
      if (drag.current) track.current.scrollLeft = drag.current.scroll - (e.clientX - drag.current.x);
    };
    const up = () => {
      if (!drag.current) return;
      drag.current = null;
      track.current.classList.remove("drag");
      go(indexRef.current);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [go]);

  return (
    <section className="sec" id="voices" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="tnav" style={{ marginBottom: 26, alignItems: "end" }}>
          <div className="sec-head" style={{ margin: 0 }}>
            <Eyebrow tone="mint">Community voice</Eyebrow>
            <h2 className="h2">
              Building trust across the <span className="grad">sports community.</span>
            </h2>
          </div>
          <div className="tarrows">
            <button className="round" aria-label="Previous testimonial" onClick={() => go(index - 1)}>
              <Icon name="arrow" style={{ transform: "scaleX(-1)" }} />
            </button>
            <button className="round" aria-label="Next testimonial" onClick={() => go(index + 1)}>
              <Icon name="arrow" />
            </button>
          </div>
        </Reveal>
        <div
          className="tcar"
          ref={track}
          role="region"
          aria-roledescription="carousel"
          aria-label="Testimonials"
          tabIndex={0}
          onScroll={onScroll}
          onPointerEnter={() => (paused.current = true)}
          onPointerLeave={() => (paused.current = false)}
          onFocus={() => (paused.current = true)}
          onBlur={() => (paused.current = false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              go(index + 1);
              e.preventDefault();
            } else if (e.key === "ArrowLeft") {
              go(index - 1);
              e.preventDefault();
            }
          }}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") return;
            drag.current = { x: e.clientX, scroll: track.current.scrollLeft };
            track.current.classList.add("drag");
          }}
        >
          {QUOTES.map((q, i) => (
            <article
              key={q.who}
              ref={(el) => (cards.current[i] = el)}
              className={`tcard clay t-${q.tone}`}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${QUOTES.length}`}
            >
              <blockquote>{q.quote}</blockquote>
              <div className="who">
                <Bubble icon={q.icon} />
                <div>
                  <b>{q.who}</b>
                  <span>{q.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="tdots" style={{ justifyContent: "center" }}>
          {QUOTES.map((q, i) => (
            <motion.button
              key={q.who}
              layout
              transition={{ duration: 0.4, ease: SPRING }}
              aria-label={`Show testimonial ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
