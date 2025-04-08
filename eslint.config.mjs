import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    rules: {
      "no-unused-vars": "error",
      "no-console": "warn",
      "no-undef": "error",
      "no-unused-expressions": "error",
      "no-unreachable": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  },
  tseslint.configs.recommended,
]);
