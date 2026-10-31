"use client";

import { useState } from "react";
import Link from "next/link";
import { DISCIPLINES } from "@/lib/disciplines";
import {
  AGE_OPTIONS,
  CONDITION_OPTIONS,
  DEFAULT_ANSWERS,
  LEVEL_OPTIONS,
  evaluateEligibility,
} from "@/lib/eligibility";
import Bubble from "@/components/ui/Bubble";
import { Icon } from "@/components/ui/Icon";

const QUESTIONS = [
  { key: "disc", label: "Your discipline", options: DISCIPLINES.map((d) => ({ id: d.id, label: d.name })) },
  { key: "age", label: "Age group", options: AGE_OPTIONS },
  { key: "level", label: "Competition level", options: LEVEL_OPTIONS },
  {
    key: "cond",
    label: "Any current heart, seizure, vision or inner-ear condition?",
    options: CONDITION_OPTIONS,
  },
];

/** Four quick questions, evaluated in the browser only (rules in src/lib/eligibility.js). */
export default function EligibilityCheck() {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const result = evaluateEligibility(answers);

  return (
    <>
      <div className="tool-head">
        <Bubble icon="check" tone="mint" />
        <h3>Check your eligibility</h3>
        <p>Four quick questions. Nothing is saved or sent.</p>
      </div>
      {QUESTIONS.map((q) => (
        <div className="q" key={q.key} role="group" aria-labelledby={`q-${q.key}`}>
          <span className="q-label" id={`q-${q.key}`}>
            {q.label}
          </span>
          <div className="opts">
            {q.options.map((o) => (
              <button
                key={o.id}
                type="button"
                className="opt"
                aria-pressed={answers[q.key] === o.id}
                onClick={() => setAnswers((a) => ({ ...a, [q.key]: o.id }))}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div aria-live="polite">
        <div className={`elig-result t-${result.tone}`}>
          <h4>{result.title}</h4>
          <p>
            {result.disciplineName} at your level needs a <b>{result.cls}</b> certificate. Have these ready:
          </p>
          <ul>
            {result.docs.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          {result.notes.length ? <p>{result.notes.join(" ")}</p> : null}
        </div>
      </div>
      <Link className="btn btn-primary" href="/apply" style={{ justifySelf: "start" }}>
        Start application <Icon name="arrow" className="arrow" />
      </Link>
    </>
  );
}
