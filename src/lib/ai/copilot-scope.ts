export type CopilotScopeVerdict =
  | { ok: true; reason: "platform" }
  | { ok: false; reason: "jailbreak" | "off_topic" | "empty" };

const JAILBREAK =
  /\b(ignore|disregard|forget)\b.{0,40}\b(instructions?|rules?|prompt|system|role)\b|\byou are (now|no longer)\b|\bact as\b.{0,30}\b(unrestricted|dan|jailbreak|general assistant|chatgpt)\b|\bdeveloper mode\b|\bjailbreak\b|\breveal (your )?(system|hidden) (prompt|instructions)\b|\boverride (the )?(rules|guardrails|policy)\b|\bsudo mode\b|\bnew persona\b|\bfrom now on you\b|\bpretend (you('re| are)|to be)/i;

const OFF_TOPIC =
  /\b(weather|forecast|recipe|recipes|cook(?:ing)? dinner|girlfriend|boyfriend|dating|horoscope|lottery|crypto trading|bitcoin price|stock price|who won|sports score|write (me )?(an? )?(email|cover letter|essay|poem|rap)|translate this|tell me a joke|riddle me|play a game|nsfw|capital of|who is the president|what('?s| is) (2\s*\+\s*2|the time))\b/i;

const PLATFORM_INTENT =
  /\b(pathed|path ed|cri|career readiness|xp|streak|coin|wallet|roadmap|node|study room|challenge|problem|dsa|mcq|project|progress|memory lane|note|bookmark|tech news|article|store|placement|mentor|profile|settings|badge|level|daily|what should i|next|help|open|navigate|explain)\b/i;

export function classifyCopilotMessage(message: string): CopilotScopeVerdict {
  const q = message.trim();
  if (q.length < 2) return { ok: false, reason: "empty" };
  if (JAILBREAK.test(q)) return { ok: false, reason: "jailbreak" };
  if (OFF_TOPIC.test(q) && !PLATFORM_INTENT.test(q)) {
    return { ok: false, reason: "off_topic" };
  }
  return { ok: true, reason: "platform" };
}

export function copilotScopeRefusal(reason: CopilotScopeVerdict["reason"]): string {
  if (reason === "jailbreak") {
    return [
      "I am **PathED Copilot** — a portal assistant, not an unrestricted model.",
      "I cannot change roles, reveal hidden instructions, or ignore these rules.",
      "==Ask about your roadmap, challenges, CRI, notes, or tech news.==",
    ].join("\n\n");
  }

  if (reason === "empty") {
    return "Ask a short question about your PathED progress, roadmap, or what to do next.";
  }

  return [
    "That’s outside PathED. I only help with **this product**: your profile, roadmap, practice, notes, and career surfaces here.",
    "I will not answer general-web or personal-life questions.",
    "==Try: “what should I do next?”, “explain my CRI”, or “open today’s challenge”.==",
  ].join("\n\n");
}

export function copilotFallbackReply(): string {
  return [
    "I couldn’t reach the AI just now.",
    "Use the sidebar for **Roadmap**, **Challenges**, or **Progress**, or try asking again in a moment.",
    "==What should I do next is still a good question once I’m back.==",
  ].join("\n\n");
}
