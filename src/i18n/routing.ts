import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ja", "vi"],
  defaultLocale: "ja",
});

export type AppLocale = (typeof routing.locales)[number];
