import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const PORTAL_SHELL_BAN = {
  paths: [
    {
      name: "@/components/dashboard/PortalShell",
      message:
        "Portal chrome is owned solely by app/(app)/(portal)/layout.tsx. Do not wrap views/pages in PortalShell (causes double nav).",
    },
    {
      name: "@/components/dashboard/DashboardLayout",
      message:
        "DashboardLayout is deprecated. Portal chrome is owned by (portal)/layout.tsx via PortalShell — never wrap views/pages.",
    },
    {
      name: "@/components/dashboard/AppNavbar",
      message:
        "AppNavbar is part of PortalShell. Import it only inside components/dashboard shell files.",
    },
    {
      name: "@/components/dashboard/DashboardSidebar",
      message:
        "DashboardSidebar is part of PortalShell. Import it only inside components/dashboard shell files.",
    },
  ],
  patterns: [
    {
      group: [
        "**/components/dashboard/PortalShell",
        "**/components/dashboard/DashboardLayout",
        "**/components/dashboard/AppNavbar",
        "**/components/dashboard/DashboardSidebar",
      ],
      message:
        "Portal chrome components are layout-owned. Do not import them from views or page routes.",
    },
  ],
};

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
      "@next/next/no-head-element": "off",
    },
  },
  {
    files: ["src/views/**/*.{ts,tsx}", "src/app/**/page.tsx"],
    rules: {
      "no-restricted-imports": ["error", PORTAL_SHELL_BAN],
    },
  },
  {
    files: [
      "src/app/(app)/(portal)/dashboard/**/layout.tsx",
      "src/app/(app)/(portal)/dashboard/layout.tsx",
    ],
    rules: {
      "no-restricted-imports": ["error", PORTAL_SHELL_BAN],
    },
  },
];

export default eslintConfig;
