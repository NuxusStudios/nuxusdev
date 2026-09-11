import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored third-party registry code — imported verbatim from upstream MIT
    // registries by scripts/import-registry.mjs. Restyling it here would be
    // undone on the next import, and it isn't ours to lint.
    "src/registry/imported/**",
    ".import-cache/**",
  ]),
]);

export default eslintConfig;
