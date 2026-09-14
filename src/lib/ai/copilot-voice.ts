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
  if (t === n || t === `hey ${n}` || t === `hi ${n}` || t === `hello ${n}`) return true;
  if (t.startsWith(`hey ${n}`) || t.startsWith(`ok ${n}`) || t.startsWith(`okay ${n}`) || t.startsWith(`hi ${n}`)) {
    return true;
  }
  if (t.includes(`${n} wake up`) || t === "wake up" || t.startsWith("wake up ")) return true;
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
