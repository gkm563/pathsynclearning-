import { routes } from "@/lib/routes";
import { parseCopilotPageEntity } from "./copilot-href";

export type CopilotChip = {
  label: string;
  prompt: string;
};

export function copilotChipsForPath(
  pathname: string,
  extra?: CopilotChip,
): CopilotChip[] {
  const base = copilotChipsForPathInner(pathname);
  if (!extra) return base;
  if (base.some((chip) => chip.label === extra.label)) return base;
  return [extra, ...base].slice(0, 4);
}

function copilotChipsForPathInner(pathname: string): CopilotChip[] {
  const path = (pathname || "").split("?")[0];
  const { entity } = parseCopilotPageEntity(path);

  if (path.startsWith(routes.app.challenges) || path.startsWith(routes.app.problems)) {
    const chips: CopilotChip[] = [
      { label: "What next?", prompt: "What should I practice next?" },
      { label: "Today's challenge", prompt: "Open today’s featured challenge." },
      { label: "Explain this pack", prompt: "Explain my daily challenge pack and what to start with." },
    ];
    if (entity.type === "problem") {
      chips[2] = {
        label: "How to approach",
        prompt: "How should I approach this problem? Give hints, not a full solution.",
      };
    }
    return chips;
  }

  if (path.startsWith(routes.app.roadmap)) {
    return [
      { label: "Next node", prompt: "What’s my next roadmap node and why?" },
      { label: "How far am I?", prompt: "How far am I on this roadmap?" },
      { label: "Study room", prompt: "Point me to the study room for my next topic." },
    ];
  }

  if (path.startsWith(routes.app.techNews)) {
    const chips: CopilotChip[] = [
      { label: "What to read", prompt: "What in tech news is most useful for my target role?" },
      { label: "Feed recap", prompt: "Summarize what’s in my tech news feed." },
    ];
    if (entity.type === "news") {
      chips.push({
        label: "Bookmark this",
        prompt: "Bookmark this article for me.",
      });
    } else {
      chips.push({
        label: "Saved articles",
        prompt: "Show my saved tech news and open that page.",
      });
    }
    return chips;
  }

  if (path.startsWith(routes.app.memoryLane)) {
    return [
      { label: "Save a note", prompt: "Save a short private note from what I’m working on." },
      { label: "My CRI", prompt: "Explain my Career Readiness Index and how to raise it." },
      { label: "Recent wins", prompt: "What have I accomplished lately?" },
    ];
  }

  if (path.startsWith(routes.app.progress)) {
    return [
      { label: "My CRI", prompt: "Explain my Career Readiness Index and how to raise it." },
      { label: "What next?", prompt: "What should I do next based on my progress?" },
      { label: "Weak spots", prompt: "Where am I falling behind?" },
    ];
  }

  if (path.startsWith(routes.app.interview)) {
    return [
      { label: "Start a mock", prompt: "Start an AI mock interview for my target role." },
      { label: "What is this?", prompt: "Explain the AI Interview feature and how to prepare." },
      { label: "Weak spots", prompt: "What should I practice before my next mock interview?" },
    ];
  }

  return [
    { label: "What next?", prompt: "What should I do next on PathED?" },
    { label: "Explain my CRI", prompt: "Explain my Career Readiness Index and how to raise it." },
    { label: "Today's challenge", prompt: "Open today’s featured challenge." },
    { label: "Tech news", prompt: "Summarize what’s in my PathED tech news feed." },
  ];
}
