import "server-only";
import { fieldErrors } from "@/lib/validators";
import { badRequest, validationError } from "./errors";

function check(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fields = fieldErrors(result.error);
    const first = Object.values(fields)[0] || "Check the highlighted fields.";
    throw validationError(first, fields);
  }
  return result.data;
}

export async function parseJson(req, schema) {
  let body;
  try {
    body = await req.json();
  } catch {
    throw badRequest("The request body must be valid JSON.");
  }
  return check(schema, body ?? {});
}

export function parseQuery(req, schema) {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  return check(schema, params);
}

export function parseValue(schema, value) {
  return check(schema, value);
}
