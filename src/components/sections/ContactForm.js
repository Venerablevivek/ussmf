"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { CONTACT_TOPICS, contactSchema, fieldErrors } from "@/lib/validators";
import Reveal from "@/components/motion/Reveal";
import { useToast } from "@/components/ui/Toast";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

const EMPTY = { name: "", email: "", topic: CONTACT_TOPICS[0], message: "" };

export default function ContactForm() {
  const toast = useToast();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      document
        .getElementById(`c${Object.keys(errs)[0][0].toUpperCase()}${Object.keys(errs)[0].slice(1)}`)
        ?.focus();
      return;
    }
    setBusy(true);
    try {
      await api("/api/contact", { method: "POST", body: parsed.data });
      setValues(EMPTY);
      setErrors({});
      toast("Message sent. We’ll reply by email soon.", { icon: "mail" });
    } catch (err) {
      setErrors(err.fields || {});
      toast(err.message, { icon: "alert", tone: "bad" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Reveal as="form" className="cform clay" noValidate onSubmit={onSubmit} id="contactForm">
      <div className="row2">
        <Field id="cName" label="Full name" error={errors.name}>
          <Input
            id="cName"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            error={errors.name}
          />
        </Field>
        <Field id="cEmail" label="Email" error={errors.email}>
          <Input
            id="cEmail"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            error={errors.email}
          />
        </Field>
      </div>
      <Field id="cTopic" label="Topic">
        <Select id="cTopic" value={values.topic} onChange={set("topic")}>
          {CONTACT_TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
      </Field>
      <Field id="cMessage" label="Message" error={errors.message}>
        <Textarea id="cMessage" value={values.message} onChange={set("message")} error={errors.message} />
      </Field>
      <button className="btn btn-primary" type="submit" style={{ justifySelf: "start" }} disabled={busy}>
        {busy ? "Sending…" : "Send message"} <Icon name="arrow" className="arrow" />
      </button>
    </Reveal>
  );
}
