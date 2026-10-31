// Runs once when the server starts: fail fast with a clear message if configuration is missing.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { getEnv } = await import("./server/env.js");
  getEnv();
}
