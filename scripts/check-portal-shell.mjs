/**
 * Temporary guard: fails CI/local if a view or page re-imports portal chrome.
 * Prefer the ESLint no-restricted-imports rule; this is a belt-and-suspenders check.
 */
import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const SCAN_DIRS = [join(ROOT, "src", "views"), join(ROOT, "src", "app")];
const FORBIDDEN = [
  "components/dashboard/PortalShell",
  "components/dashboard/DashboardLayout",
  "components/dashboard/DashboardHeader",
  "components/dashboard/DashboardSidebar",
];

const ALLOWED_LAYOUT = join(
  ROOT,
  "src",
  "app",
  "(app)",
  "(portal)",
  "layout.tsx",
).replace(/\\/g, "/");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts|jsx|js)$/.test(name)) out.push(p);
  }
  return out;
}

const offenders = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const norm = file.replace(/\\/g, "/");
    if (norm === ALLOWED_LAYOUT) continue;
    if (norm.includes("/components/dashboard/")) continue;
    // Only page.tsx under app, plus all views
    const isView = norm.includes("/src/views/");
    const isPage = /\/page\.(tsx|ts|jsx|js)$/.test(norm);
    const isNestedDashLayout =
      /\/\(portal\)\/dashboard\/.*layout\.(tsx|ts)$/.test(norm);
    if (!isView && !isPage && !isNestedDashLayout) continue;

    const src = readFileSync(file, "utf8");
    for (const token of FORBIDDEN) {
      if (src.includes(token)) {
        offenders.push(`${relative(ROOT, file)} → ${token}`);
      }
    }
  }
}

if (offenders.length) {
  console.error("Portal chrome ownership violated:\n" + offenders.join("\n"));
  console.error(
    "\nChrome must only mount in src/app/(app)/(portal)/layout.tsx via PortalShell.",
  );
  process.exit(1);
}

console.log("Portal shell ownership check passed.");
