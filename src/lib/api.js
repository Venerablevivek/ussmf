// Browser fetch wrapper for the /api route handlers. Errors come back as
// { error: { code, message, fields? } } and are thrown as ApiError.

export class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields || {};
  }
}

const NETWORK_MESSAGE = "We couldn’t reach the server. Check your connection and try again.";

export async function api(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      signal,
      credentials: "same-origin",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new ApiError(0, "network_error", NETWORK_MESSAGE);
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error?.code || "error",
      data?.error?.message || "Something went wrong. Please try again.",
      data?.error?.fields,
    );
  }
  return data;
}

// PUT a file straight to object storage with real progress (presigned URL).
export function uploadToStorage(url, file, contentType, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(
            new ApiError(
              xhr.status,
              "upload_failed",
              "The upload was interrupted. Remove the file and try again.",
            ),
          );
    xhr.onerror = () =>
      reject(new ApiError(0, "upload_failed", "The upload failed. Check your connection and try again."));
    xhr.onabort = () => reject(new ApiError(0, "upload_aborted", "Upload cancelled."));
    xhr.send(file);
  });
}
