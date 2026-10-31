"use client";

import { useCallback, useRef, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { DOCUMENT_TYPES, MAX_DOCUMENTS, MAX_UPLOAD_BYTES } from "@/lib/validators";

let seq = 0;

function contentTypeOf(file) {
  if (DOCUMENT_TYPES.includes(file.type)) return file.type;
  const ext = file.name.split(".").pop().toLowerCase();
  return { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png" }[ext] || null;
}

function put(url, file, contentType, onProgress, register) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    register(xhr);
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(
            new ApiError(
              xhr.status,
              "upload_failed",
              "The upload didn’t finish. Remove the file and try again.",
            ),
          );
    xhr.onerror = () =>
      reject(new ApiError(0, "upload_failed", "The upload failed. Check your connection and try again."));
    xhr.onabort = () => reject(new ApiError(0, "upload_aborted", "Upload cancelled."));
    xhr.send(file);
  });
}

/**
 * Direct-to-storage uploads with real progress:
 * presign (server checks type, size, count) → PUT to the bucket via XHR → complete (server checks
 * the object's size and magic bytes). `getApplicationId` returns (or creates) the draft's ID.
 */
export default function useUpload({ getApplicationId, initial = [], onError }) {
  const [items, setItems] = useState(() =>
    initial.map((d) => ({
      key: `doc-${d.id}`,
      id: d.id,
      name: d.name,
      size: d.size,
      mimeType: d.mimeType,
      progress: 1,
      state: "done",
    })),
  );
  const xhrs = useRef({});
  const countRef = useRef(initial.length);

  const patch = (key, changes) =>
    setItems((list) => list.map((it) => (it.key === key ? { ...it, ...changes } : it)));

  const uploadOne = useCallback(
    async (file) => {
      const contentType = contentTypeOf(file);
      if (!contentType) {
        onError?.(`${file.name} is not a PDF, JPG or PNG.`);
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        onError?.(`${file.name} is larger than 10 MB.`);
        return;
      }
      if (countRef.current >= MAX_DOCUMENTS) {
        onError?.(`You can upload up to ${MAX_DOCUMENTS} files. Remove one to add another.`);
        return;
      }
      countRef.current += 1;
      const key = `up-${++seq}`;
      setItems((list) => [
        ...list,
        {
          key,
          id: null,
          name: file.name,
          size: file.size,
          mimeType: contentType,
          progress: 0,
          state: "uploading",
        },
      ]);
      try {
        const applicationId = await getApplicationId();
        const { document, uploadUrl } = await api(`/api/applications/${applicationId}/documents/presign`, {
          method: "POST",
          body: { fileName: file.name, contentType, size: file.size },
        });
        patch(key, { id: document.id, applicationId });
        await put(
          uploadUrl,
          file,
          contentType,
          (p) => patch(key, { progress: Math.min(p, 0.98) }),
          (xhr) => (xhrs.current[key] = xhr),
        );
        const done = await api(`/api/applications/${applicationId}/documents/${document.id}/complete`, {
          method: "POST",
        });
        patch(key, { progress: 1, state: "done", mimeType: done.document.mimeType });
      } catch (err) {
        if (err.code === "upload_aborted") return;
        patch(key, { state: "error", error: err.message });
      } finally {
        delete xhrs.current[key];
      }
    },
    [getApplicationId, onError],
  );

  const addFiles = useCallback(
    (fileList) => {
      Array.from(fileList || []).forEach((f) => uploadOne(f));
    },
    [uploadOne],
  );

  const remove = useCallback(
    async (item) => {
      xhrs.current[item.key]?.abort();
      setItems((list) => list.filter((it) => it.key !== item.key));
      countRef.current = Math.max(0, countRef.current - 1);
      if (item.id) {
        try {
          const applicationId = item.applicationId || (await getApplicationId());
          await api(`/api/applications/${applicationId}/documents/${item.id}`, { method: "DELETE" });
        } catch (err) {
          if (err.status !== 404) {
            onError?.(err.message);
            setItems((list) => [...list, item]);
            countRef.current += 1;
          }
        }
      }
    },
    [getApplicationId, onError],
  );

  const busy = items.some((it) => it.state === "uploading");
  const ready = items.filter((it) => it.state === "done").length;
  const failed = items.some((it) => it.state === "error");
  return { items, addFiles, remove, busy, ready, failed };
}
