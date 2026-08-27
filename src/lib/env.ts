/**
 * Fail fast, and loudly, on missing configuration.
 *
 * Without this a missing DATABASE_URL reaches the pg driver as `undefined` and
 * surfaces at the first query as `SASL: SCRAM-SERVER-FIRST-MESSAGE: client
 * password must be a string` — which says nothing about the actual cause. On a
 * fresh deploy that is the single most likely misconfiguration, so it should
 * read as one.
 */
function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Set it in the container environment (see .env.example) before starting the app.`,
    );
  }
  return value;
}

export function databaseUrl() {
  return required("DATABASE_URL");
}

/**
 * Checked at startup rather than on first use, so a bad deploy fails the
 * container healthcheck instead of serving 500s on the first real request.
 * AUTH_SECRET is only mandatory in production — next-auth derives a dev secret
 * on its own otherwise.
 */
export function assertProductionEnv() {
  required("DATABASE_URL");
  if (process.env.NODE_ENV === "production") {
    required("AUTH_SECRET");
    required("NEXTAUTH_URL");
  }
}
