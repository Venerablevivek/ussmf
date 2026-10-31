"use client";

import FileDropzone from "../FileDropzone";

export default function StepDocuments({ upload, error }) {
  return (
    <>
      <h3>Upload medical records</h3>
      <p>
        Recent physical exam, ECG, vision test and any specialist reports. PDF, JPG or PNG up to 10 MB each.
      </p>
      <FileDropzone upload={upload} error={error} />
    </>
  );
}
