import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import noSecrets from "eslint-plugin-no-secrets";
import security from "eslint-plugin-security";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "jsx-a11y": jsxA11y,
      "no-secrets": noSecrets,
      security,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      ...security.configs.recommended.rules,
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-ignore": true, "ts-expect-error": "allow-with-description" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "no-secrets/no-secrets": "error",
      "security/detect-object-injection": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    ignores: [".sanity/**", "dist/**", "node_modules/**", "sanity.types.ts"],
  },
);
