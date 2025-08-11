import base from "@cadence/eslint-config";
import globals from "globals";
import tsEslint from "typescript-eslint";

import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { globalIgnores } from "eslint/config";

export default tsEslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      base,
      reactRefresh.configs.vite,
      tsEslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
