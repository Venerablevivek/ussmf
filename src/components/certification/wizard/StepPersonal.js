"use client";

import Image from "next/image";
import { STATES } from "@/lib/states";
import { Field, Input, Select } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

export default function StepPersonal({ values, errors, update, photo, onPhoto }) {
  return (
    <>
      <h3>Personal details</h3>
      <p>Use your legal name. It will appear on your certificate.</p>
      <div className="grid2">
        <Field id="aName" label="Full legal name" error={errors.legalName}>
          <Input
            id="aName"
            autoComplete="name"
            required
            value={values.legalName}
            onChange={(e) => update("legalName", e.target.value)}
            error={errors.legalName}
          />
        </Field>
        <Field id="aDob" label="Date of birth" error={errors.dateOfBirth}>
          <Input
            id="aDob"
            type="date"
            required
            value={values.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
            error={errors.dateOfBirth}
          />
        </Field>
        <Field id="aEmail" label="Email" hint="Your account email. We send updates here.">
          <Input id="aEmail" type="email" autoComplete="email" value={values.email} readOnly hint />
        </Field>
        <Field id="aPhone" label="Phone" error={errors.phone}>
          <Input
            id="aPhone"
            type="tel"
            autoComplete="tel"
            required
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            error={errors.phone}
          />
        </Field>
        <Field id="aState" label="State" error={errors.state}>
          <Select
            id="aState"
            required
            value={values.state}
            onChange={(e) => update("state", e.target.value)}
            error={errors.state}
          >
            <option value="">Select your state</option>
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <div className="field">
          <span className="flabel" id="aPhotoLabel">
            Photo for certificate
          </span>
          <div className="photo-row">
            <span className="photo-prev">
              {photo.url ? (
                <Image src={photo.url} alt="Your photo" width={68} height={68} unoptimized />
              ) : (
                <Icon name="user" />
              )}
            </span>
            <label className="btn btn-glass btn-sm" htmlFor="aPhoto" style={{ cursor: "pointer" }}>
              {photo.busy ? "Uploading…" : photo.url ? "Change photo" : "Upload photo"}
            </label>
            <input
              id="aPhoto"
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              aria-labelledby="aPhotoLabel"
              onChange={(e) => {
                onPhoto(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
          <span className="err" role={photo.error ? "alert" : undefined}>
            {photo.error || ""}
          </span>
        </div>
      </div>
    </>
  );
}
