import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This rule's static analysis flags an effect the moment its callback
      // transitively reaches a state setter, even through an async fetch — so
      // it can't distinguish "fetch data on mount" (standard, legitimate) from
      // the derived-state antipatterns it's meant to catch. Confirmed by
      // reading eslint-plugin-react-hooks's validateNoSetStateInEffects: it
      // walks LoadLocal/StoreLocal/FunctionExpression chains looking for any
      // setState reference reachable from the effect body, with no allowance
      // for a `.then()`/await boundary in between.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
