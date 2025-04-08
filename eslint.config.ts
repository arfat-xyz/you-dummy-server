// eslint.config.js
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    ".eslintignore",
    "node_modules",
    "dist",
    ".env",
    "git-commit.js",
  ]),
]);
