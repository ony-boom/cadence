// https://docs.expo.dev/guides/using-eslint/

// noinspection JSFileReferences
import expoConfig from "eslint-config-expo/flat.js";
import base from "@cadence/eslint-config";
import tsEslint from "typescript-eslint";

export default tsEslint.config([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    extends: [base],
  },
]);
