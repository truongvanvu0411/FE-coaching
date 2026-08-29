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
  const value = process.env.DATABASE_URL;
  if (value) return value;

  // `next build` evaluates every route module to collect page data, and it does
  // so with no runtime environment — the image deliberately has no .env. Nothing
  // touches the database in that phase, so the adapter gets a syntactically valid
  // placeholder instead of failing the build. Next sets NEXT_PHASE itself
  // (next/dist/build/index.js), so this cannot be spoofed by a missing variable
  // at runtime, where the throw below still applies.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return "postgresql://build:build@127.0.0.1:5432/build";
  }

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

/**
 * Registration is open to anyone who finds the URL, and every account it
 * creates can spend DeepSeek credit through /api/tutor. This app has one user,
 * so the endpoint is closed unless explicitly opened.
 */
export function registrationOpen() {
  return process.env.ALLOW_REGISTRATION === "true";
}
