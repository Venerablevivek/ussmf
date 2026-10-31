"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DEFAULT_DISCIPLINE, DISCIPLINES, SELECT_DISCIPLINE_EVENT, getDiscipline } from "@/lib/disciplines";
import Reveal from "@/components/motion/Reveal";
import { SPRING } from "@/components/motion/easing";
import Eyebrow from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { ActivePill } from "@/components/ui/Tabs";

/** Discipline tabs (arrow-key navigation, layoutId active pill) and the animated panel. */
export default function Disciplines() {
  const [selected, setSelected] = useState(DEFAULT_DISCIPLINE);
  const tabRefs = useRef({});
  const sectionRef = useRef(null);
  const reduce = useReducedMotion();
  const d = getDiscipline(selected);

  const select = useCallback(
    (id, { scroll = false, focus = false } = {}) => {
      if (!getDiscipline(id)) return;
      setSelected(id);
      const tab = tabRefs.current[id];
      if (focus) tab?.focus();
      if (scroll) sectionRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      else tab?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
    },
    [reduce],
  );

  useEffect(() => {
    const onSelect = (e) => select(e.detail.id, { scroll: !!e.detail.scroll });
    window.addEventListener(SELECT_DISCIPLINE_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_DISCIPLINE_EVENT, onSelect);
  }, [select]);

  function onKeyDown(e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = DISCIPLINES.findIndex((x) => x.id === selected);
    const next =
      DISCIPLINES[(i + (e.key === "ArrowRight" ? 1 : -1) + DISCIPLINES.length) % DISCIPLINES.length];
    select(next.id, { focus: true });
    e.preventDefault();
  }

  return (
    <section className="sec" id="disciplines" style={{ paddingTop: 0 }} ref={sectionRef}>
      <div className="wrap">
        <Reveal className="sec-head">
          <Eyebrow tone="sun">Air sports we cover</Eyebrow>
          <h2 className="h2">
            Every discipline has its own <span className="grad">physiology.</span>
          </h2>
          <p className="sub">
            Pick a discipline to see its main medical risks and the screenings our physicians look at during
            certification.
          </p>
        </Reveal>
        <div className="disc-tabs" role="tablist" aria-label="Air sports disciplines" onKeyDown={onKeyDown}>
          {DISCIPLINES.map((x) => {
            const on = x.id === selected;
            return (
              <button
                key={x.id}
                ref={(el) => (tabRefs.current[x.id] = el)}
                className={`dtab t-${x.tone}`}
                role="tab"
                id={`tab-${x.id}`}
                aria-selected={on}
                aria-controls="discPanel"
                tabIndex={on ? 0 : -1}
                onClick={() => select(x.id)}
              >
                {on ? <ActivePill layoutId="disc-tab" /> : null}
                <span className="bubble">
                  <Icon name={x.icon} />
                </span>
                {x.name}
              </button>
            );
          })}
        </div>
        <div
          className={`disc-panel clay t-${d.tone}`}
          id="discPanel"
          role="tabpanel"
          aria-live="polite"
          aria-labelledby={`tab-${d.id}`}
        >
          <Fragment key={d.id}>
            <motion.div
              className="dp-visual"
              initial={{ opacity: 0.2, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: SPRING }}
            >
              <span className="huge">
                <Icon name={d.icon} />
              </span>
              <span className="alt">{d.altitude}</span>
            </motion.div>
            <motion.div
              className="dp-copy"
              initial={{ opacity: 0.2, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: SPRING }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <h3>{d.name}</h3>
                <span className="demo-tag">Draft guidance</span>
              </div>
              <p className="lead">{d.lead}</p>
              <div className="dp-cols">
                <div>
                  <h4>Key medical risks</h4>
                  <ul>
                    {d.risks.map((r) => (
                      <li key={r}>
                        <Icon name="alert" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Recommended screenings</h4>
                  <ul>
                    {d.screenings.map((r) => (
                      <li key={r}>
                        <Icon name="check" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="dp-class">
                <Icon name="medal" />
                <span>
                  Certificate required: <b>{d.certificateClass}</b>
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                Final protocols are set by the U.S.S.M.F. Medical Board.
              </p>
            </motion.div>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
