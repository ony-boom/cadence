import base from "./index.js";
import globals from "globals";
import tsEslint from "typescript-eslint";

import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tsEslint.config([
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
