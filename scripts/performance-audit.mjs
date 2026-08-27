const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const routes = ["/vi/login", "/vi/practice", "/vi/mock-exam", "/vi/progress"];
const samples = Number(process.env.AUDIT_SAMPLES || 3);

for (const route of routes) {
  const timings = [];
  for (let i = 0; i < samples; i += 1) {
    const started = performance.now();
    const response = await fetch(`${baseUrl}${route}`, { signal: AbortSignal.timeout(30_000) });
    await response.arrayBuffer();
    timings.push(Math.round(performance.now() - started));
    if (!response.ok) throw new Error(`${route} returned ${response.status}`);
  }
  timings.sort((a, b) => a - b);
  const p50 = timings[Math.floor(timings.length * 0.5)];
  const p95 = timings[Math.min(timings.length - 1, Math.ceil(timings.length * 0.95) - 1)];
  console.log(`${route} samples=${timings.join(",")}ms p50=${p50}ms p95=${p95}ms`);
}
