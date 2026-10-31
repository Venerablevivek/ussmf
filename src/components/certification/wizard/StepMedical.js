"use client";

import { CONDITIONS, toggleCondition } from "@/lib/conditions";
import ChipCheck from "@/components/ui/ChipCheck";
import { Field, Input, Textarea } from "@/components/ui/Input";

export default function StepMedical({ values, errors, update }) {
  return (
    <>
      <h3>Medical history</h3>
      <p>
        Select anything that applies now or in the past. Your answers are read only by U.S.S.M.F. physicians.
      </p>
      <div className="field">
        <span className="flabel" id="condLabel">
          Conditions
        </span>
        <div aria-labelledby="condLabel">
          <ChipCheck
            name="cond"
            options={CONDITIONS}
            value={values.conditions}
            describedBy="condErr"
            onToggle={(value, checked) =>
              update("conditions", toggleCondition(values.conditions, value, checked))
            }
          />
        </div>
        <span className="err" id="condErr" role={errors.conditions ? "alert" : undefined}>
          {errors.conditions || ""}
        </span>
      </div>
      <div className="grid2">
        <Field id="aMeds" label="Current medications" error={errors.medications}>
          <Textarea
            id="aMeds"
            placeholder="Name, dose and reason. Write “None” if none."
            value={values.medications}
            onChange={(e) => update("medications", e.target.value)}
            error={errors.medications}
          />
        </Field>
        <Field id="aInj" label="Past injuries or surgeries" error={errors.injuries}>
          <Textarea
            id="aInj"
            placeholder="Include year and recovery status."
            value={values.injuries}
            onChange={(e) => update("injuries", e.target.value)}
            error={errors.injuries}
          />
        </Field>
      </div>
      <Field
        id="aLast"
        label="Date of last full physical"
        error={errors.lastPhysicalDate}
        style={{ maxWidth: 320 }}
      >
        <Input
          id="aLast"
          type="date"
          required
          value={values.lastPhysicalDate}
          onChange={(e) => update("lastPhysicalDate", e.target.value)}
          error={errors.lastPhysicalDate}
        />
      </Field>
    </>
  );
}
