import type { RoadmapNode } from "@/types/roadmap";

export type TutorScopeVerdict =
  | { ok: true; reason: "study" | "overlap" }
  | { ok: false; reason: "jailbreak" | "off_topic" | "smalltalk" | "empty" };

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "for",
  "nor",
  "so",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "as",
  "is",
  "it",
  "be",
  "do",
  "we",
  "me",
  "my",
  "you",
  "are",
  "was",
  "can",
  "not",
  "our",
  "any",
  "all",
  "use",
  "this",
  "that",
  "with",
  "from",
  "your",
  "about",
  "into",
  "just",
  "have",
  "has",
  "had",
  "what",
  "when",
  "where",
  "which",
  "their",
  "them",
  "then",
  "than",
  "also",
  "only",
  "some",
  "more",
  "most",
  "like",
  "make",
  "made",
  "will",
  "would",
  "could",
  "should",
  "using",
  "used",
  "help",
  "need",
  "want",
  "please",
  "write",
  "tell",
  "give",
  "show",
  "today",
  "explain",
  "simple",
  "simply",
  "interview",
  "question",
  "questions",
  "quiz",
  "takeaway",
  "takeaways",
  "example",
  "examples",
  "topic",
  "lesson",
  "node",
  "video",
  "study",
  "learn",
  "learning",
  "core",
  "idea",
]);

const SHORT_TECH = new Set([
  "bst",
  "dfs",
  "bfs",
  "sql",
  "api",
  "css",
  "html",
  "jwt",
  "oop",
  "os",
  "dp",
  "ui",
  "ux",
  "ml",
  "ai",
  "js",
  "ts",
]);

const JAILBREAK =
  /\b(ignore|disregard|forget)\b.{0,40}\b(instructions?|rules?|prompt|system|role|tutor)\b|\byou are (now|no longer)\b|\bact as\b.{0,30}\b(unrestricted|dan|jailbreak|general assistant|chatgpt)\b|\bdeveloper mode\b|\bjailbreak\b|\breveal (your )?(system|hidden) (prompt|instructions)\b|\boverride (the )?(rules|guardrails|policy)\b|\bsudo mode\b|\bnew persona\b|\bfrom now on you\b|\bpretend (you('re| are)|to be) (a |an )?(?!tutor)/i;

const OFF_TOPIC =
  /\b(weather|forecast|recipe|recipes|cook(?:ing)? dinner|girlfriend|boyfriend|dating|horoscope|lottery|crypto|bitcoin|stock price|who won|sports score|write (me )?(an? )?(email|cover letter|essay|poem|rap)|translate this|tell me a joke|riddle me|play a game|nsfw|capital of|latest news|who is the president|what('?s| is) (2\s*\+\s*2|the time)|how are you)\b/i;

const SMALLTALK =
  /^(hi|hello|hey|yo|sup|hiya|thanks|thank you|ok|okay|bye|good morning|good evening)[\s!.]*$/i;

const LEARNING_INTENT =
  /\b(explain|eli5|simplif|quiz|test me|interview|takeaway|summar|hint|analog(?:y|ies)?|example|implement|implementation|complexity|big-?o|runtime|debug|trace|dry[- ]run|walk(?:\s+me)? through|approach|understand|confused|stuck|why|how (do|does|can|should|would|is)|how to|what (is|are|does|do|if)|when (do|would|should|to)|difference|versus|vs|compare|trade-?off|practice|revise|review|prerequisite|roadmap|this (node|topic|lesson|video)|assessment|coding|code|function|algorithm|data structure|edge case|base case|recursive|recursion|iterate|loop|pointer|array|tree|graph|stack|queue|hash|sort|search|proof|intuition|visuali[sz]e|step[- ]by[- ]step|solution|solve|pseudo[- ]?code)\b/i;

function isLessonToken(t: string): boolean {
  if (!t || STOP.has(t)) return false;
  if (t.length >= 4) return true;
  return SHORT_TECH.has(t) || /[0-9+#]/.test(t);
}

function withStems(t: string): string[] {
  const out = [t];
  if (t.length >= 4 && t.endsWith("es") && t.endsWith("ses") === false) {
    out.push(t.slice(0, -2));
  } else if (t.length >= 4 && t.endsWith("s") && !t.endsWith("ss")) {
    out.push(t.slice(0, -1));
  } else if (t.length >= 4 && !t.endsWith("s")) {
    out.push(`${t}s`);
  }
  return out;
}

export function tokenizeLesson(text: string): Set<string> {
  const tokens = new Set<string>();
  for (const raw of text.toLowerCase().match(/[a-z0-9+#.]{2,}/g) || []) {
    const t = raw.replace(/^[.#]+|[.#]+$/g, "");
    if (!isLessonToken(t)) continue;
    for (const stem of withStems(t)) {
      if (isLessonToken(stem) || stem.length >= 3) tokens.add(stem);
    }
  }
  return tokens;
}

export function lessonLexicon(
  node: Pick<
    RoadmapNode,
    | "title"
    | "description"
    | "whyLearn"
    | "interviewFocus"
    | "skills"
    | "topics"
    | "learningOutcomes"
  >,
): Set<string> {
  const blob = [
    node.title,
    node.description,
    node.whyLearn,
    node.interviewFocus,
    ...(node.skills || []),
    ...(node.topics || []),
    ...(node.learningOutcomes || []),
  ]
    .filter(Boolean)
    .join(" ");
  return tokenizeLesson(blob);
}

export function sanitizeUntrustedText(text: string, max = 2000): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[<>]/g, " ")
    .replace(/\b(system|assistant|developer)\s*:/gi, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

export function classifyTutorMessage(message: string, lexicon: Set<string>): TutorScopeVerdict {
  const q = message.trim();
  if (q.length < 2) return { ok: false, reason: "empty" };
  if (JAILBREAK.test(q)) return { ok: false, reason: "jailbreak" };

  const overlap = [...tokenizeLesson(q)].filter((t) => lexicon.has(t)).length;
  const learning = LEARNING_INTENT.test(q);

  if (SMALLTALK.test(q) && overlap === 0 && !learning) {
    return { ok: false, reason: "smalltalk" };
  }

  // Lifestyle / general-chat with no lesson tokens.
  if (OFF_TOPIC.test(q) && overlap === 0) {
    return { ok: false, reason: "off_topic" };
  }

  if (overlap >= 1) return { ok: true, reason: "overlap" };
  return { ok: true, reason: "study" };
}

export function scopeRefusal(title: string, reason: TutorScopeVerdict["reason"] = "off_topic"): string {
  if (reason === "jailbreak") {
    return [
      `I only tutor this PathED lesson: **${title}**.`,
      "I cannot change roles, reveal hidden instructions, or act as a general chatbot.",
      `==Ask something about ${title} — a definition, a quiz, or an interview angle.==`,
    ].join("\n\n");
  }

  if (reason === "smalltalk") {
    return [
      `Hi — I am your tutor for **${title}**, not a general chatbot.`,
      "I can explain this lesson, quiz you on it, or prep interview questions for it.",
      `==What part of ${title} should we start with?==`,
    ].join("\n\n");
  }

  return [
    `That is outside this study room. I only tutor **${title}**.`,
    "I will not answer general questions, other subjects, or chatbot-style chat. Stay on this node, this roadmap, or how to study it.",
    `==Try: “explain this simply”, “quiz me”, or “interview questions” for ${title}.==`,
  ].join("\n\n");
}

export function localTutorReply(message: string, title: string, description?: string): string {
  const q = message.toLowerCase();
  const about = description?.trim()
    ? description.trim().slice(0, 420)
    : `${title} is a core topic on your PathED roadmap.`;

  if (q.includes("quiz") || q.includes("question") || q.includes("test me")) {
    return [
      `Quick check on **${title}**:`,
      `1. Explain the idea in one sentence, as if teaching a junior.`,
      `2. Name one mistake people make when applying this in interviews or code.`,
      `3. Give a tiny example that proves you understand it.`,
      `==Reply with your answers and I will grade them.==`,
    ].join("\n");
  }

  if (q.includes("interview")) {
    return [
      `Interview angle for **${title}**:`,
      `Expect a **definition**, a **trade-off**, and a “when would you use this?” follow-up.`,
      `==Practice out loud: what it is, why it matters, and one concrete example.==`,
      about,
    ].join("\n\n");
  }

  if (q.includes("summar") || q.includes("takeaway")) {
    return [
      `Study takeaways for **${title}**:`,
      about,
      `==Write 3 bullets: definition, one worked example, one interview question.==`,
    ].join("\n\n");
  }

  return [
    `Let’s stay with **${title}**.`,
    about,
    `I can ==explain it simply==, quiz you, or prep interview questions — only for this lesson.`,
  ].join("\n\n");
}

export function parseInScope(raw: unknown): boolean | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const v = rec.in_scope ?? rec.inScope ?? rec.on_topic ?? rec.onTopic;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "yes") return true;
    if (s === "false" || s === "no") return false;
  }
  return null;
}
