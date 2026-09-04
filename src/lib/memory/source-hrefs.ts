import { routes } from "@/lib/routes";
import type { SourceType } from "@/lib/memory/types";

/** Resolve a deep-link back to the original PathEd activity. */
export function hrefForSource(
  sourceType: string | null | undefined,
  sourceId: string | null | undefined,
): string | null {
  if (!sourceType || !sourceId) return null;

  switch (sourceType as SourceType | string) {
    case "challenge":
    case "coding_session":
      return `${routes.app.challenges}?q=${encodeURIComponent(sourceId)}`;
    case "project":
    case "project_run":
      return `${routes.app.challenges}?project=${encodeURIComponent(sourceId)}`;
    case "roadmap":
      return routes.app.roadmap;
    case "roadmap_node":
    case "lesson":
    case "course":
      return `${routes.app.roadmap}?node=${encodeURIComponent(sourceId)}`;
    case "mentorship":
      return routes.app.mentorship;
    case "event":
    case "hackathon":
      return routes.app.events;
    case "career":
      return routes.app.advancedCareer;
    case "certification":
      return routes.app.recordsCerts;
    case "collaboration":
      return routes.app.projectCollab;
    case "note":
      return `${routes.app.memoryLane}?note=${encodeURIComponent(sourceId)}`;
    default:
      return null;
  }
}
