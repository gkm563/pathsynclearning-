import { routes } from "@/lib/routes";
import type { CopilotChip } from "./copilot-chips";

export type CopilotPresenceInput = {
  seed: string;
  companionName: string;
  studentFirstName: string;
  pathname: string;
  streak: number;
  cri: number;
  hasRoadmap: boolean;
  nextNodeTitle?: string | null;
  featuredChallenge?: string | null;
  hasImportedMemory?: boolean;
};

function utcDateKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function hourUtc(now = new Date()) {
  return now.getUTCHours();
}

function hashPick<T>(key: string, items: readonly T[]): T {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  }
  const idx = Math.abs(h) % items.length;
  return items[idx]!;
}

function situation(input: CopilotPresenceInput, now: Date): string {
  const path = (input.pathname || "").split("?")[0];
  if (!input.hasRoadmap) return "no_roadmap";
  if (input.streak === 0) return "streak_reset";
  if (path.startsWith(routes.app.challenges) || path.startsWith(routes.app.problems)) {
    return "practice";
  }
  if (path.startsWith(routes.app.roadmap)) return "roadmap";
  if (path.startsWith(routes.app.interview)) return "interview";
  if (input.cri > 0 && input.cri < 40) return "cri_lift";
  const hour = hourUtc(now);
  if (hour < 12) return "morning";
  if (hour >= 21) return "late";
  return "default";
}

export function copilotPresence(
  input: CopilotPresenceInput,
  now = new Date(),
): { greeting: string; chip: CopilotChip } {
  const name = input.companionName;
  const you = input.studentFirstName;
  const sit = situation(input, now);
  const key = `${input.seed}|${utcDateKey(now)}|${sit}`;
  const next = input.nextNodeTitle;
  const featured = input.featuredChallenge;

  const greetings: Record<string, string[]> = {
    no_roadmap: [
      `Hey ${you} — I’m **${name}**. I hang out with you on PathED, not as a generic chatbot.\n\nWe still need a roadmap so I can nag you about the right next step.\n\n==Want me to point you at career setup?==`,
      `${you}, it’s **${name}**. Empty map energy today.\n\nOnce a target role is in, I can actually walk with you instead of guessing.\n\n==Let’s pick a career path.==`,
    ],
    streak_reset: [
      `Hey ${you}. **${name}** here — streak’s at zero, which is a boring number.\n\nOne featured challenge is enough to start the count again.\n\n==Open today’s challenge with me.==`,
      `${you}, I’m **${name}**. No streak lecture, just a nudge.\n\nShow up for one problem and I’ll keep you honest after that.\n\n==What should I practice next?==`,
    ],
    practice: [
      `I’m **${name}**. You’re already in the practice pit — I like this version of you.\n\nAsk for a hint, not a dump. I’ll stay on this problem.\n\n==How should I approach this?==`,
      `Hey ${you} — **${name}**. Same room as the problems.\n\nTell me where you’re stuck and I’ll steer, not spoil.\n\n==Explain today’s pack.==`,
    ],
    roadmap: [
      next
        ? `**${name}** checking in. Next up looks like **${next}**.\n\nI can send you to the study room when you want a deeper pass.\n\n==What’s my next roadmap node?==`
        : `It’s **${name}**. You’re on the map — ask me how far you actually are.\n\n==How far am I on this roadmap?==`,
      `Hey ${you}. **${name}** in your corner.\n\nRoadmaps only work if the next node isn’t a mystery.\n\n==Point me to the study room.==`,
    ],
    interview: [
      `**${name}** here. Mock interviews are spicy on purpose.\n\nI can start one for your target role or talk through what to drill first.\n\n==Start a mock for my role.==`,
      `Hey ${you} — I’m **${name}**, not the interviewer. I just get you ready.\n\n==What should I practice before a mock?==`,
    ],
    cri_lift: [
      `Hey ${you}. **${name}**. CRI is still climbing territory.\n\nPractice and roadmap completion move that number more than staring at it.\n\n==How do I raise my CRI?==`,
      `I’m **${name}**. Your Career Readiness Index has room — that’s useful, not embarrassing.\n\n==What should I do next?==`,
    ],
    morning: [
      `Morning, ${you}. **${name}** showed up.\n\n${featured ? `Today’s featured one is **${featured}**.` : "A short session beats a heroic plan."}\n\n==What should I do first today?==`,
      `Hey ${you} — **${name}**. Fresh day, same friend on this platform.\n\n==Open today’s challenge.==`,
    ],
    late: [
      `Hey ${you}. **${name}** — keep it short if you’re tired.\n\nOne node or one problem is a win. Sleep is also a strategy.\n\n==What’s a small next step?==`,
      `It’s **${name}**. Late-night grinding is optional.\n\nI’ll still be here tomorrow.\n\n==Save a note about today.==`,
    ],
    default: [
      input.hasImportedMemory
        ? `Hey ${you} — **${name}**. I kept the notes you brought over from your other AI.\n\nI’ll use them as background, not as orders.\n\n==What should I do next on PathED?==`
        : `Hey ${you}. I’m **${name}**, your person on PathED.\n\nRoadmap, challenges, CRI, notes — that’s our beat.\n\n==What should I do next?==`,
      `**${name}** here. Not a chatbot tab — I’m the one who knows this account.\n\n==Explain my CRI.==`,
    ],
  };

  const greeting = hashPick(key, greetings[sit] || greetings.default);

  const chips: Record<string, CopilotChip> = {
    no_roadmap: {
      label: "Career setup",
      prompt: "I still need a career path. What should I set up so you can help me better?",
    },
    streak_reset: {
      label: "Start a streak",
      prompt: "My streak is at zero. What’s the smallest practice I should do today?",
    },
    practice: {
      label: "Stay with me",
      prompt: "Help me work this practice without giving a full solution.",
    },
    roadmap: {
      label: "Walk with me",
      prompt: "What’s my next roadmap node and why should I do it now?",
    },
    interview: {
      label: "Prep with me",
      prompt: "How should I prep for a mock interview on PathED today?",
    },
    cri_lift: {
      label: "Raise CRI",
      prompt: "Explain my CRI and the one action that would raise it this week.",
    },
    morning: {
      label: "Plan today",
      prompt: "What should I do first on PathED today?",
    },
    late: {
      label: "Small step",
      prompt: "Give me one small PathED step I can finish tonight.",
    },
    default: {
      label: "What next?",
      prompt: "What should I do next on PathED?",
    },
  };

  return { greeting, chip: chips[sit] || chips.default };
}

/** Short Roblox-style speech lines for the floating companion. Seeded, not Math.random. */
export function copilotIdleLine(
  input: CopilotPresenceInput & { slot?: number },
  now = new Date(),
): string {
  const you = input.studentFirstName;
  const sit = situation(input, now);
  const key = `${input.seed}|${utcDateKey(now)}|${sit}|idle|${input.slot ?? 0}`;
  const next = input.nextNodeTitle;
  const featured = input.featuredChallenge;

  const lines: Record<string, string[]> = {
    no_roadmap: [
      "Need a career map?",
      `${you}, still no roadmap.`,
      "Pick a role — I’ll walk with you.",
    ],
    streak_reset: [
      "Streak’s at 0…",
      "One challenge. That’s it.",
      "I’m not leaving. You in?",
    ],
    practice: [
      "Stuck? Tap me.",
      "Hints only. I got you.",
      "Nice pit. Keep going.",
    ],
    roadmap: [
      next ? `Next: ${next}` : "Roadmap check?",
      "Study room when you’re ready.",
      `${you}, one node.`,
    ],
    interview: [
      "Mock time?",
      "I can warm you up.",
      "Interviews are spicy. Tap me.",
    ],
    cri_lift: [
      "CRI can climb today.",
      "Small practice, bigger index.",
      `${you} — one more rep.`,
    ],
    morning: [
      featured ? `Today: ${featured}` : "Morning. What’s first?",
      "Fresh day. I’m here.",
      "Coffee + one problem?",
    ],
    late: [
      "Keep it tiny tonight.",
      "Or sleep. I’ll wait.",
      "One note, then done.",
    ],
    default: [
      `Hey ${you}.`,
      "Need me?",
      "What should we do?",
      "I’m your person here.",
    ],
  };

  return hashPick(key, lines[sit] || lines.default);
}
