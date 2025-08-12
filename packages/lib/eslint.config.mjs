import base from "@cadence/eslint-config";
import globals from "globals";
import tsEslint from "typescript-eslint";

export default tsEslint.config([
  {
    files: ["**/*.{ts}"],
    extends: [
      base,
      tsEslint.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
