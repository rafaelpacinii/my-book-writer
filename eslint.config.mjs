import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // This app uses DOM editing refs, not React Compiler. Keep the core Hooks rules.
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      // Local asset/data URLs are decoded explicitly; no remote image optimizer is used.
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
    },
  },
  {
    files: ["src/tests/**/*.ts"],
    // Playwright's fixture callback is named `use`; it is not a React Hook.
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
  {
    files: ["src/components/books/editor/useMainEditorState.ts"],
    // Existing editor effects intentionally subscribe to individual state fields.
    rules: { "react-hooks/exhaustive-deps": "off" },
  },
  globalIgnores([".next/**", "out/**", "src/prototype/**", "src/tests/playwright-report/**", "src/tests/test-results/**"]),
]);
