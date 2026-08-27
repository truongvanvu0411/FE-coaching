import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  // Dev server is reached via 127.0.0.1 (see README — localhost resolves to ::1 on
  // this machine and gets an empty reply), which otherwise trips Next's cross-origin
  // dev-resource block and silently breaks client-side hydration.
  allowedDevOrigins: ["127.0.0.1"],
  // The dev indicator's default bottom-left spot sits right on top of the app
  // shell's own sidebar controls (locale switcher / theme toggle) in that corner.
  devIndicators: { position: "top-right" },
  // admin-review-artifacts.ts resolves storage/review from process.cwd(), which
  // makes file tracing pull all 185 MB of rendered review pages into
  // .next/standalone. Those are runtime data on a mounted volume, never a build
  // artifact — excluding them takes the standalone output from 214 MB to ~29 MB.
  outputFileTracingExcludes: {
    "/*": ["storage/**/*"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Caddy terminates TLS in front of the app; HSTS is safe once the
          // subdomain only ever serves https.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
