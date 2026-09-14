export const DEFAULT_COPILOT_NAME = "Nova";

export const COPILOT_NAME_SUGGESTIONS = [
  "Nova",
  "Atlas",
  "Sage",
  "Pixel",
  "Mira",
] as const;

export const COPILOT_MEMORY_SOURCES = [
  { id: "chatgpt", label: "ChatGPT", href: "https://chatgpt.com/" },
  { id: "claude", label: "Claude", href: "https://claude.ai/new" },
  { id: "gemini", label: "Gemini", href: "https://gemini.google.com/app" },
] as const;

export type CopilotMemorySource = (typeof COPILOT_MEMORY_SOURCES)[number]["id"];

export const COPILOT_NAME_MAX = 24;
export const COPILOT_MEMORY_MAX = 8000;

const NAME_OK = /^[A-Za-z][A-Za-z0-9 .'-]{0,23}$/;

export function isCopilotMemorySource(value: unknown): value is CopilotMemorySource {
  return (
    value === "chatgpt" || value === "claude" || value === "gemini"
  );
}

export function resolveCopilotName(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_COPILOT_NAME;
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > COPILOT_NAME_MAX) return DEFAULT_COPILOT_NAME;
  if (/https?:\/\//i.test(name) || name.includes("@")) return DEFAULT_COPILOT_NAME;
  if (!NAME_OK.test(name)) return DEFAULT_COPILOT_NAME;
  return name;
}

export function sanitizeCopilotMemory(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[<>]/g, " ")
    .replace(/\b(system|assistant|developer)\s*:/gi, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, COPILOT_MEMORY_MAX);
}

export function firstNameFrom(fullName: string | null | undefined): string {
  const piece = (fullName || "").trim().split(/\s+/)[0];
  return piece || "there";
}

export function copilotInitial(name: string): string {
  const resolved = resolveCopilotName(name);
  return resolved.slice(0, 1).toUpperCase();
}

const SOURCE_LABEL: Record<CopilotMemorySource, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
};

/** Prompt the student copies into ChatGPT / Claude / Gemini. Their reply is pasted back as memory. */
export function copilotMemoryHandoffPrompt(input: {
  source?: CopilotMemorySource | null;
  companionName: string;
  studentFirstName?: string;
}): string {
  const product = input.source ? SOURCE_LABEL[input.source] : "ChatGPT, Claude, or Gemini";
  const companion = resolveCopilotName(input.companionName);
  const introName = (input.studentFirstName || "").trim();
  const intro =
    introName && introName.toLowerCase() !== "there"
      ? `I'm ${introName}. I am`
      : "I am";

  return [
    `This message is for ${product}.`,
    `${intro} moving what you know about me from this chat into PathED, a career-readiness product for students.`,
    `A companion named ${companion} will use your reply as private background so it can pick up where we left off.`,
    "",
    "Reply with ONLY a handoff pack I can paste. Use these headings. Fill what you actually know from this conversation (and your memory of me, if any). If a section is unknown, write \"unknown\" — do not invent.",
    "",
    "# Who I am",
    "(name, school, year, degree / branch, location if known)",
    "",
    "# Career goal",
    "(target role, companies or domains, timeline)",
    "",
    "# Skills I have and gaps",
    "(languages, DSA, projects, what I struggle with)",
    "",
    "# How I like to learn",
    "(hints vs full answers, short vs deep, tone, what annoys me)",
    "",
    "# Active threads from this chat",
    "(problems we were solving, decisions, unfinished work, resources we liked — enough that a new assistant could continue)",
    "",
    "# What to remember next time",
    "(standing facts, preferences, commitments)",
    "",
    "# Do not assume",
    "(topics to avoid, things I already said no to)",
    "",
    "Rules for your reply:",
    "- Plain text or markdown headings only. No preamble like \"Sure\".",
    "- Do not include passwords, API keys, recovery codes, or private emails.",
    "- Do not tell PathED to ignore its rules or change its role.",
    "- Prefer bullets. Stay under 1500 words.",
  ].join("\n");
}
