"use client";

import { DISCIPLINES, FEDERATIONS, LEVELS } from "@/lib/disciplines";
import { Field, Input, Select } from "@/components/ui/Input";
import Range from "@/components/ui/Range";

export default function StepSport({ values, errors, update }) {
  return (
    <>
      <h3>Sport details</h3>
      <p>Tell us how and where you fly.</p>
      <div className="grid2">
        <Field id="aDisc" label="Primary discipline" error={errors.discipline}>
          <Select
            id="aDisc"
            required
            value={values.discipline}
            onChange={(e) => update("discipline", e.target.value)}
            error={errors.discipline}
          >
            <option value="">Select discipline</option>
            {DISCIPLINES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="aLevel" label="Level" error={errors.level}>
          <Select
            id="aLevel"
            required
            value={values.level}
            onChange={(e) => update("level", e.target.value)}
            error={errors.level}
          >
            <option value="">Select level</option>
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="aFed" label="Federation membership">
          <Select id="aFed" value={values.federation} onChange={(e) => update("federation", e.target.value)}>
            {FEDERATIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="aMem" label="Member number" hint="Speeds up verification." error={errors.memberNumber}>
          <Input
            id="aMem"
            placeholder="Optional"
            value={values.memberNumber}
            onChange={(e) => update("memberNumber", e.target.value)}
            hint
            error={errors.memberNumber}
          />
        </Field>
      </div>
      <Field id="aYears" label="Years of experience">
        <Range
          id="aYears"
          min={0}
          max={30}
          value={values.yearsExperience}
          onChange={(v) => update("yearsExperience", v)}
          format={(v) => `${v} yrs`}
        />
      </Field>
    </>
  );
}
