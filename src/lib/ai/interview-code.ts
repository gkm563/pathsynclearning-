/** Client-safe helpers for when the mock interviewer invites a coding round. */

const CODE_INVITE_CUES = [
  "open the editor",
  "in the editor",
  "use the editor",
  "open the ide",
  "use the ide",
  "write some code",
  "write the code",
  "write a function",
  "start coding",
  "try coding",
  "let's code",
  "lets code",
  "go ahead and code",
  "implement this",
  "implement the",
  "coding problem",
  "type this in",
  "switch to the editor",
];

export function interviewerInvitedCode(text: string, problemTitle?: string | null): boolean {
  const spoken = text.toLowerCase();
  if (CODE_INVITE_CUES.some((cue) => spoken.includes(cue))) return true;
  const title = problemTitle?.toLowerCase().trim();
  if (
    title &&
    title.length > 3 &&
    spoken.includes(title) &&
    /\b(code|implement|editor|function|write)\b/.test(spoken)
  ) {
    return true;
  }
  return false;
}
