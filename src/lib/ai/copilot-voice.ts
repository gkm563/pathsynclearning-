/** Companion voice helpers — client-safe, PathED-scoped. */

export function spokenCopilotText(text: string) {
  return text
    .replace(/==([^=]+)==/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>_]/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function nameToken(name: string) {
  return compact(name).split(" ")[0] || "nova";
}

export function isWakePhrase(text: string, companionName: string) {
  const t = compact(text);
  const n = nameToken(companionName);
  if (!t) return false;
  const aliases = new Set<string>([n]);
  if (n === "nova") {
    aliases.add("noba");
    aliases.add("niva");
    aliases.add("nover");
  }
  for (const word of t.split(" ")) {
    if (aliases.has(word)) return true;
  }
  if ([...aliases].some((alias) => t.includes(alias))) return true;
  if (t === "wake up" || t.startsWith("wake up ")) return true;
  return false;
}

export function stripWakePhrase(text: string, companionName: string) {
  const n = nameToken(companionName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .replace(new RegExp(`^(hey|ok|okay|hi|hello)\\s+${n}\\s*[,\\-:]?\\s*`, "i"), "")
    .replace(new RegExp(`^${n}\\s*[,\\-:]?\\s*`, "i"), "")
    .replace(/^wake up[,:\-]?\s*/i, "")
    .trim();
}

export function isSleepPhrase(text: string, companionName: string) {
  const t = compact(text);
  const n = nameToken(companionName);
  if (!t) return false;
  return (
    /^(stop|cancel|never mind|nevermind|that's all|thats all|that is all|good night|goodnight|goodbye|good bye|bye|go to sleep|sleep)$/.test(t) ||
    t === `stop ${n}` ||
    t === `bye ${n}` ||
    t.includes("stop listening") ||
    t.includes("go to sleep") ||
    t.includes("that's enough") ||
    t.includes("thats enough")
  );
}

export const VOICE_WAKE_KEY = "pathed.copilot-voice-wake";

export function loadVoiceWakeEnabled() {
  try {
    return window.localStorage.getItem(VOICE_WAKE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function saveVoiceWakeEnabled(on: boolean) {
  try {
    window.localStorage.setItem(VOICE_WAKE_KEY, on ? "on" : "off");
  } catch {
    // ignore
  }
}

function scoreCopilotVoice(voice: SpeechSynthesisVoice) {
  const label = `${voice.name} ${voice.lang}`.toLowerCase();
  let score = 0;
  if (/en(-|_)us/.test(label) || voice.lang.toLowerCase().startsWith("en-us")) score += 6;
  else if (voice.lang.toLowerCase().startsWith("en")) score += 4;
  else score -= 8;
  if (/aria|jenny|sonia|libby|zira|samantha|sara\b|natural|neural|online/.test(label)) score += 10;
  if (/google us english|microsoft aria|microsoft jenny|microsoft zira/.test(label)) score += 8;
  if (voice.localService) score += 1;
  if (/david|mark|ravi|george|guy|davis|andrew|christopher|fred|daniel|james/.test(label)) score -= 6;
  return score;
}

export function pickCopilotTtsVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return [...voices].sort((a, b) => scoreCopilotVoice(b) - scoreCopilotVoice(a))[0] || null;
}

export function speakCopilotReply(
  text: string,
  handlers?: { onStart?: () => void; onEnd?: () => void },
) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) {
    handlers?.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const spoken = text.trim();
  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(spoken);
    const voice = pickCopilotTtsVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }
    utterance.rate = 1.04;
    utterance.pitch = 1.06;
    let finished = false;
    let started = false;
    const begunAt = Date.now();
    const done = () => {
      if (finished) return;
      if (!started && Date.now() - begunAt < 500) return;
      finished = true;
      window.clearTimeout(safety);
      handlers?.onEnd?.();
    };
    const safety = window.setTimeout(
      done,
      Math.min(28000, Math.max(4000, spoken.length * 85 + 2800)),
    );
    utterance.onstart = () => {
      started = true;
      handlers?.onStart?.();
    };
    utterance.onend = done;
    utterance.onerror = () => {
      if (started) done();
    };
    handlers?.onStart?.();
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length) {
    speak();
    return;
  }
  let armed = false;
  const once = () => {
    if (armed) return;
    armed = true;
    speak();
  };
  window.speechSynthesis.addEventListener("voiceschanged", once, { once: true });
  window.setTimeout(once, 280);
}
