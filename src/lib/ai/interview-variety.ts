import type { InterviewTrack } from "./interview-types";

const START_PHRASE =
  /^((ok|okay|yes|yeah|yep|alright|sure|well|we'll|we will|please|let'?s|i('m| am) ready)\s+)*(start|begin)(\s+the)?(\s+(interview|mock))?$|^(i('m| am) )?ready$/;

const DSA_ANGLES = [
  "a concrete debugging story with a failing edge case",
  "time and space trade-offs for a search they choose",
  "how they would model a real feature with the right data structure",
  "testing strategy for an algorithm they write on a whiteboard",
  "a production performance issue they would profile",
  "recursion versus iteration for a problem they pick",
  "hashing, trees, or heaps for a specific lookup",
  "how they would explain an API contract to a teammate",
  "walking through a graph or tree they have implemented",
  "what they would change if input grew 100x",
  "handling invalid input and empty cases",
  "a design they would sketch for a tiny rate limiter or cache",
];

const BEHAVIORAL_ANGLES = [
  "a disagreement with a teammate or professor",
  "a deadline they missed and what changed after",
  "mentoring, being mentored, or learning in public",
  "owning a mistake in front of others",
  "a time they had too little information and still shipped",
  "giving or receiving hard feedback",
  "choosing between a quick hack and a clean fix",
  "working with someone much more senior or junior",
  "a project they are proud of, focused on their decisions",
  "handling ambiguity when the spec kept changing",
];

const REMINDERS = [
  'Whenever you are set, say "start interview" and I will begin.',
  'Still waiting on you — say "start interview" and we will kick off the first question.',
  'Take a second to get comfortable. Say "start interview" when you want to begin.',
];

function normalizeSpoken(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isStartInterviewPhrase(text: string): boolean {
  const spoken = normalizeSpoken(text);
  if (!spoken) return false;
  if (START_PHRASE.test(spoken)) return true;
  const words = spoken.split(" ");
  return (
    words.length <= 10 &&
    /\b(start|begin)\b/.test(spoken) &&
    /\b(interview|mock)\b/.test(spoken)
  );
}

/** After the mock is live, ignore start/enter/ready chatter so we do not restart. */
export function looksLikeStartNoise(text: string): boolean {
  const spoken = normalizeSpoken(text);
  if (!spoken) return false;
  if (isStartInterviewPhrase(spoken)) return true;
  if (spoken.split(" ").length > 28) return false;
  const leftover = spoken
    .replace(
      /\b(ok|okay|now|yes|yeah|yep|sure|well|we'll|we|will|can|could|please|let'?s|the|this|that|and|to|a|i|am|ready|start|begin|enter|join|handle|kick|off|interview|mock)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
  return leftover.length < 10 && /\b(interview|mock)\b/.test(spoken);
}

export function alreadyLiveNudge(): string {
  return "We're already in the interview. Go ahead and answer the last question.";
}

const CLOSINGS = [
  "Thanks for your time today. We'll stop here.",
  "Appreciate you walking through that. That's a wrap.",
  "Thank you — good practice. We'll end here.",
  "Thanks for sitting with this. We'll stop here.",
];

export function closingThanks(seed: number): string {
  return pickFromList(CLOSINGS, seed);
}

export function pickFromList<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

export function nextVarietySeed(seed: number): number {
  return (Math.imul(seed || 1, 1664525) + 1013904223) >>> 0;
}

export function anglesForTrack(track: InterviewTrack): string[] {
  if (track === "behavioral") return BEHAVIORAL_ANGLES;
  if (track === "dsa") return DSA_ANGLES;
  return [...DSA_ANGLES, ...BEHAVIORAL_ANGLES];
}

export function pickQuestionAngle(
  track: InterviewTrack,
  seed: number,
  used: string[] = [],
  studiedTopics: string[] = [],
): string {
  const pool = studiedTopics.length ? studiedTopics : anglesForTrack(track);
  const unused = pool.filter((angle) => !used.includes(angle));
  return pickFromList(unused.length ? unused : pool, seed);
}

export function briefingReminder(seed: number): string {
  return pickFromList(REMINDERS, seed);
}

export function newVarietySeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 1_000_000_000)) >>> 0;
}
