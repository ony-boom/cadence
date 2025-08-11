import js from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import tsEslint from "typescript-eslint";

export default tsEslint.config([
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      prettier: prettierPlugin,
    },
    extends: [
      js.configs.recommended,
    ],
    rules: {
      "prettier/prettier": "error",
    },
    languageOptions: {
      ecmaVersion: 2020,
    },
  },
  prettierConfig,
]);
