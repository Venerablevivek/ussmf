import "server-only";

export class HttpError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export const badRequest = (message, fields) => new HttpError(400, "bad_request", message, fields);
export const validationError = (message, fields) => new HttpError(422, "validation_error", message, fields);
export const unauthorized = (message = "Sign in to continue.") => new HttpError(401, "unauthorized", message);
export const forbidden = (message = "You don’t have access to this.") =>
  new HttpError(403, "forbidden", message);
export const notFound = (message = "We couldn’t find that.") => new HttpError(404, "not_found", message);
export const conflict = (message) => new HttpError(409, "conflict", message);
export const tooMany = (message = "Too many attempts. Wait a minute and try again.") =>
  new HttpError(429, "rate_limited", message);
