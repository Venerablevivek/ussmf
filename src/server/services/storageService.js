import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../env";

// Private bucket. The browser uploads and downloads with short-lived presigned URLs, so
// file bodies never pass through the API (Vercel limits request bodies to 4.5 MB).

function s3() {
  if (!globalThis.__ussmfS3) {
    globalThis.__ussmfS3 = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      // Path-style keeps one predictable origin for the CSP and works with R2, Supabase and MinIO.
      forcePathStyle: true,
      credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
      // Default CRC32 checksums would be baked into presigned PUT URLs and break browser uploads.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return globalThis.__ussmfS3;
}

function isNotFound(err) {
  return err?.name === "NotFound" || err?.name === "NoSuchKey" || err?.$metadata?.httpStatusCode === 404;
}

/** Presigned PUT the browser uploads to directly. Expires in 5 minutes by default. */
export function presignUpload(key, contentType, expiresIn = 300) {
  return getSignedUrl(
    s3(),
    new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, ContentType: contentType }),
    {
      expiresIn,
    },
  );
}

/** Short-lived presigned GET for viewing (inline) or downloading a stored object. */
export function presignDownload(key, { expiresIn = 60, contentType, fileName, inline = true } = {}) {
  const safeName = fileName ? fileName.replace(/[^\w.\- ]+/g, "_") : undefined;
  return getSignedUrl(
    s3(),
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ResponseContentType: contentType,
      ResponseContentDisposition: safeName
        ? `${inline ? "inline" : "attachment"}; filename="${safeName}"`
        : undefined,
      ResponseCacheControl: "private, no-store",
    }),
    { expiresIn },
  );
}

/** Size and type of an uploaded object, or null when it doesn't exist. */
export async function headObject(key) {
  try {
    const res = await s3().send(new HeadObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
    return { size: Number(res.ContentLength ?? 0), contentType: res.ContentType || null };
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

/** The first `bytes` of an object (ranged GET) for magic-byte type detection. */
export async function readObjectStart(key, bytes = 4096) {
  const res = await s3().send(
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Range: `bytes=0-${bytes - 1}` }),
  );
  return Buffer.from(await res.Body.transformToByteArray());
}

/** Whole object as a Buffer (used for small images embedded in certificate PDFs). */
export async function readObject(key) {
  try {
    const res = await s3().send(new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
    return Buffer.from(await res.Body.transformToByteArray());
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

export async function putObject(key, body, contentType) {
  await s3().send(
    new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body: body, ContentType: contentType }),
  );
}

export async function deleteObject(key) {
  try {
    await s3().send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
  } catch (err) {
    if (!isNotFound(err)) throw err;
  }
}
