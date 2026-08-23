import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "node_modules/**", "out/**", ".agents/**", "scripts/**"],
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "prefer-const": "off",
      "react/jsx-no-comment-textnodes": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-head-element": "off"
    }
  },
];

export default eslintConfig;
