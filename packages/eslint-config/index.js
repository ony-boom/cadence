import js from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import neverThrowPlugin from "eslint-plugin-neverthrow";
import tsEslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tsEslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      prettier: prettierPlugin,
      neverthrow: neverThrowPlugin,
    },
    extends: [js.configs.recommended],
    rules: {
      "prettier/prettier": "error",
    },
    languageOptions: {
      ecmaVersion: 2020,
    },
  },
  prettierConfig,
]);
