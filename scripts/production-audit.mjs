const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3101").replace(/\/$/, "");
const maxP95 = Number(process.env.AUDIT_MAX_P95_MS || 2500);
const routes = ["/vi/login", "/vi/register", "/vi/practice", "/vi/mock-exam", "/vi/progress"];

try {
  const ready = await fetch(`${baseUrl}/vi/login`, { signal: AbortSignal.timeout(10_000) });
  if (!ready.ok) throw new Error(`server returned ${ready.status}`);
} catch (error) {
  console.error(`Production server is not reachable at ${baseUrl}. Start it first with: npm run start -- --port 3101`);
  throw error;
}

for (const route of routes) {
  const timings = [];
  for (let i = 0; i < 3; i += 1) {
    const started = performance.now();
    const response = await fetch(`${baseUrl}${route}`, { signal: AbortSignal.timeout(30_000) });
    await response.arrayBuffer();
    if (!response.ok) throw new Error(`${route} returned ${response.status}`);
    timings.push(Math.round(performance.now() - started));
  }
  timings.sort((a, b) => a - b);
  const p95 = timings[timings.length - 1];
  const status = p95 <= maxP95 ? "PASS" : "WARN";
  console.log(`${status} ${route} samples=${timings.join(",")}ms p95=${p95}ms target<=${maxP95}ms`);
}
