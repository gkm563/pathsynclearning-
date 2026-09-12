import { routes } from "@/lib/routes";

const STATIC = new Set<string>(Object.values(routes.app));

function pathOnly(href: string): string {
  return href.trim().split("?")[0].split("#")[0];
}

/** Only in-app portal destinations the copilot may suggest. */
export function isAllowedCopilotHref(href: string): boolean {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  const path = pathOnly(href);
  if (!path.startsWith("/")) return false;
  if (STATIC.has(path)) return true;

  const problemsPrefix = `${routes.app.problems}/`;
  if (path.startsWith(problemsPrefix)) {
    const slug = path.slice(problemsPrefix.length);
    return Boolean(slug) && !slug.includes("/");
  }

  const newsPrefix = `${routes.app.techNews}/`;
  if (path.startsWith(newsPrefix)) {
    const id = path.slice(newsPrefix.length);
    return Boolean(id) && !id.includes("/");
  }

  const interviewPrefix = `${routes.app.interview}/`;
  if (path.startsWith(interviewPrefix)) {
    const rest = path.slice(interviewPrefix.length);
    const parts = rest.split("/").filter(Boolean);
    return parts.length >= 1 && parts.length <= 2;
  }

  return false;
}

export function normalizeCopilotHref(href: string): string | null {
  const trimmed = href.trim();
  if (!isAllowedCopilotHref(trimmed)) return null;
  const [path, query] = trimmed.split("?");
  const cleanPath = path.split("#")[0];
  if (!query) return cleanPath;
  return `${cleanPath}?${query.split("#")[0]}`;
}

export function parseCopilotPageEntity(pathname: string): {
  entity: import("./copilot-types").CopilotPageEntity;
} {
  const path = pathOnly(pathname || "");
  const newsPrefix = `${routes.app.techNews}/`;
  if (path.startsWith(newsPrefix)) {
    const id = path.slice(newsPrefix.length);
    if (id && id !== "saved" && !id.includes("/")) {
      return { entity: { type: "news", id } };
    }
  }
  const problemsPrefix = `${routes.app.problems}/`;
  if (path.startsWith(problemsPrefix)) {
    const slug = path.slice(problemsPrefix.length);
    if (slug && !slug.includes("/")) {
      return { entity: { type: "problem", slug } };
    }
  }
  return { entity: { type: "none" } };
}
