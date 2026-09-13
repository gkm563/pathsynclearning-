/** Client-safe helpers for when the mock interviewer invites a coding round. */

const CODE_INVITE_CUES = [
  "open the editor",
  "use the editor",
  "open the ide",
  "use the ide",
  "write some code",
  "write the code",
  "write a function",
  "please write",
  "start coding",
  "try coding",
  "let's code",
  "lets code",
  "go ahead and code",
  "implement this",
  "implement the",
  "implement a ",
  "type this in",
  "switch to the editor",
];

const CLOSE_CUES = [
  "that concludes",
  "this concludes",
  "we'll end here",
  "we will end here",
  "let's end here",
  "lets end here",
  "end the interview",
  "wrap up this interview",
  "that's all i have",
  "thats all i have",
  "that's all for today",
  "thats all for today",
  "thanks for your time",
  "thank you for your time",
  "i'm going to stop us here",
  "i am going to stop us here",
  "we'll stop here",
  "we will stop here",
  "we're done for today",
  "we are done for today",
];

export function interviewerClosedInterview(text: string): boolean {
  const spoken = text.toLowerCase();
  return CLOSE_CUES.some((cue) => spoken.includes(cue));
}

function normalizeEndSpeech(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function studentAskedToEnd(text: string): boolean {
  const spoken = normalizeEndSpeech(text);
  if (!spoken) return false;
  if (/^(please )?(can we |could we |let'?s |i('d| would) like to )?(end|stop|finish|quit)( the| this)?( interview| mock)?$/.test(spoken)) {
    return true;
  }
  if (/^(end|stop|finish|quit)(\s+it)?$/.test(spoken)) return true;
  if (spoken.split(" ").length <= 12 && /\b(end|stop|finish|quit)\b/.test(spoken) && /\b(interview|mock)\b/.test(spoken)) {
    return true;
  }
  return /\b(i (want to |would like to )?(end|stop|finish)|end this interview|stop the interview)\b/.test(
    spoken,
  );
}

export function studentConfirmedEnd(text: string): boolean {
  const spoken = normalizeEndSpeech(text);
  if (!spoken) return false;
  if (/^(yes|yeah|yep|yup|sure|ok|okay|confirm|confirmed|please)$/.test(spoken)) return true;
  return /^(yes |yeah |ok |okay )?(please )?(end|finish|stop)( it| this)?( now)?$/.test(spoken);
}

export function studentDeclinedEnd(text: string): boolean {
  const spoken = normalizeEndSpeech(text);
  if (!spoken) return false;
  if (/^(no|nope|nah|not yet|keep going|continue|cancel)$/.test(spoken)) return true;
  return /\b(keep going|not yet|don't end|do not end|continue the interview)\b/.test(spoken);
}

export function studentAskedToCode(text: string): boolean {
  const spoken = normalizeEndSpeech(text);
  if (!spoken) return false;
  if (/\b(now i code|i (want to |would like to )?code|let me code|can i code|go to (the )?editor|open (the )?editor)\b/.test(spoken)) {
    return true;
  }
  return /^(okay |ok |alright )?(now )?(i('m| am) )?(going to |gonna )?code$/.test(spoken);
}

export function studentAskedToCheckCode(text: string): boolean {
  const spoken = normalizeEndSpeech(text);
  if (!spoken) return false;
  if (/\b(check|review|look at|see)\b.+\b(code|editor)\b/.test(spoken)) return true;
  if (/\b(code|editor)\b.+\b(check|review)\b/.test(spoken)) return true;
  if (/\b(already in|in the editor)\b/.test(spoken) && /\b(code|it)\b/.test(spoken)) return true;
  return /^(check( the| my)? code|review( the| my)? code|i('m| am) done)$/.test(spoken);
}

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

const WRITE_AGAIN_CUES = [
  "open the editor",
  "use the editor",
  "write some code",
  "write the code",
  "write a function",
  "start coding",
  "try coding",
  "let's code",
  "lets code",
  "implement this",
  "implement the",
  "update the code",
  "fix the code",
  "try again",
];

export function interviewerAskedToWriteAgain(text: string): boolean {
  const spoken = text.toLowerCase();
  return WRITE_AGAIN_CUES.some((cue) => spoken.includes(cue));
}

/** Editor stays available from an invite until the candidate submits for review. */
export function codingEditorShouldStayOpen(
  turns: Array<{ role: string; content: string }>,
  problemTitle?: string | null,
): boolean {
  let lastInvite = -1;
  let lastCheck = -1;
  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    if (turn.role === "student" && studentAskedToCheckCode(turn.content)) {
      lastCheck = i;
      continue;
    }
    if (turn.role !== "interviewer") continue;
    const writeAgain = interviewerAskedToWriteAgain(turn.content);
    if (lastCheck >= 0 && i > lastCheck && !writeAgain) continue;
    if (!writeAgain && !interviewerInvitedCode(turn.content, problemTitle)) continue;
    lastInvite = i;
  }
  return lastInvite > lastCheck;
}

function normalizeCode(code?: string | null): string {
  return (code || "").replace(/\s+/g, " ").trim();
}

/**
 * True only when the candidate submitted editor code that is not just the
 * starter. Verbal algorithm talk does not count as a coding score.
 */
export function interviewCodedInIde(input: {
  turns: Array<{ role: string; content: string }>;
  codeSnapshot?: string | null;
  starterCode?: string | null;
}): boolean {
  const submitted = input.turns.some((turn) => {
    if (turn.role !== "student") return false;
    return (
      turn.content.includes("[The candidate submitted the editor for review") ||
      studentAskedToCheckCode(turn.content)
    );
  });
  if (!submitted) return false;
  const snap = normalizeCode(input.codeSnapshot);
  if (!snap) return false;
  const starter = normalizeCode(input.starterCode);
  return !starter || snap !== starter;
}

export function interviewScopeLabel(
  role?: string | null,
  company?: string | null,
): string {
  const title = role?.trim() || "";
  const firm = company?.trim() || "";
  if (title && firm) return `${title} · ${firm}`;
  if (title) return title;
  if (firm) return firm;
  return "General practice";
}

export function interviewRanSeconds(
  startedAt: string,
  endedAt?: string | null,
): number {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return Math.floor((end - start) / 1000);
}

export function formatInterviewRun(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  if (minutes > 0) return secs ? `${minutes}m ${secs}s` : `${minutes}m`;
  return `${secs}s`;
}

export function blendInterviewOverall(
  scores: {
    communication: number;
    problemSolving: number;
    codeQuality: number;
    depth: number;
  },
  codedInIde: boolean,
): number {
  if (codedInIde) {
    return Math.round(
      scores.communication * 0.25 +
        scores.problemSolving * 0.3 +
        scores.codeQuality * 0.2 +
        scores.depth * 0.25,
    );
  }
  return Math.round(
    scores.communication * 0.3125 +
      scores.problemSolving * 0.375 +
      scores.depth * 0.3125,
  );
}
