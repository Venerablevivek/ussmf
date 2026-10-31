"use client";

import { disciplineName, federationName, levelName } from "@/lib/disciplines";
import { formatDate, pluralize } from "@/lib/format";
import Checkbox from "@/components/ui/Checkbox";
import SignaturePad from "../SignaturePad";

export default function StepReview({
  values,
  documentCount,
  consents,
  setConsent,
  errors,
  signatureRef,
  onSignature,
}) {
  const dash = (v) => (v && String(v).trim()) || "—";
  const rows = [
    ["Name", dash(values.legalName)],
    ["Date of birth", values.dateOfBirth ? formatDate(values.dateOfBirth) : "—"],
    ["Email", dash(values.email)],
    ["State", dash(values.state)],
    ["Discipline", values.discipline ? disciplineName(values.discipline) : "—"],
    ["Level", values.level ? levelName(values.level) : "—"],
    [
      "Federation",
      federationName(values.federation) + (values.memberNumber ? ` · ${values.memberNumber}` : ""),
    ],
    ["Experience", `${values.yearsExperience} years`],
    ["Conditions", values.conditions.length ? values.conditions.join(", ") : "—"],
    ["Documents", pluralize(documentCount, "file")],
  ];
  return (
    <>
      <h3>Review &amp; consent</h3>
      <p>Check your details, then sign to submit.</p>
      <div className="sum">
        {rows.map(([label, value]) => (
          <div key={label}>
            <small>{label}</small>
            <b>{value}</b>
          </div>
        ))}
      </div>
      <Checkbox id="c1" checked={consents.review} onChange={(v) => setConsent("review", v)}>
        I consent to U.S.S.M.F. physicians reviewing my medical records for certification.
      </Checkbox>
      <Checkbox id="c2" checked={consents.accurate} onChange={(v) => setConsent("accurate", v)}>
        The information I provided is accurate and complete to the best of my knowledge.
      </Checkbox>
      <Checkbox id="c3" checked={consents.suspension} onChange={(v) => setConsent("suspension", v)}>
        I understand that a certificate can be suspended if my health status changes.
      </Checkbox>
      <span className="err" id="consentErr" role={errors.consents ? "alert" : undefined}>
        {errors.consents || ""}
      </span>
      <div className="field">
        <span className="flabel">Signature</span>
        <SignaturePad ref={signatureRef} onChange={onSignature} describedBy="sigErr" />
        <span className="err" id="sigErr" role={errors.signature ? "alert" : undefined}>
          {errors.signature || ""}
        </span>
      </div>
    </>
  );
}
