import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsxA11y from "eslint-plugin-jsx-a11y";
import noSecrets from "eslint-plugin-no-secrets";
import security from "eslint-plugin-security";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
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
      "security/detect-object-injection": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-ignore": true, "ts-expect-error": "allow-with-description" },
      ],
      "react/no-danger": "error",
      "no-secrets/no-secrets": [
        "error",
        {
          ignoreContent: [
            /^https:\/\/www\.facebook\.com\//,
            /^https:\/\/player\.vimeo\.com\//,
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["scripts/scan-secrets.mjs"],
    rules: {
      "security/detect-non-literal-fs-filename": "off",
    },
  },
  {
    files: ["src/components/json-ld.tsx"],
    rules: {
      "react/no-danger": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "studio/**",
      "out/**",
      "test-results/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
