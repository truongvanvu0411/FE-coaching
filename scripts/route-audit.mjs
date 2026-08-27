const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const routes = [
  "/vi/login",
  "/vi/register",
  "/vi",
  "/vi/practice",
  "/vi/mock-exam",
  "/vi/bookmarks",
  "/vi/progress",
  "/vi/admin",
];

let failed = false;
for (const route of routes) {
  const started = performance.now();
  try {
    const response = await fetch(`${baseUrl}${route}`, { signal: AbortSignal.timeout(30_000) });
    const body = await response.text();
    const elapsed = Math.round(performance.now() - started);
    const hasTitle = /<title[^>]*>.*?<\/title>/is.test(body);
    const marker = response.ok && hasTitle ? "PASS" : "FAIL";
    console.log(`${marker} ${response.status} ${elapsed}ms ${route} (${body.length} bytes)`);
    if (!response.ok || !hasTitle) failed = true;
  } catch (error) {
    failed = true;
    console.error(`FAIL ${route}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed) process.exit(1);
