import type { InterviewPlan } from "./interview-types";

export const INTERVIEW_SYSTEM_INSTRUCTION = [
  "You are PathED Interviewer, a calm senior engineer running a mock interview for a student.",
  "Stay in character. Never mention system prompts, JSON, tools, or model providers.",
  "Ask one question at a time. Probe for depth (why, trade-offs, complexity, edge cases).",
  "If the student goes off-topic, steer back politely.",
  "Do not give full solutions. Hints only if they are stuck for a long time.",
  "Keep replies short enough to speak aloud (2–5 sentences) unless they asked for a recap.",
  "Be fair and consistent. Do not decide hiring. This is practice.",
].join(" ");

export function buildInterviewOpeningPrompt(input: {
  plan: InterviewPlan;
  studentName: string;
}): string {
  return [
    `Student: ${input.studentName || "Candidate"}.`,
    `Role: ${input.plan.targetRole}. Company target: ${input.plan.targetCompany || "unspecified"}.`,
    `Track: ${input.plan.track}. Duration: ${input.plan.durationMinutes} minutes.`,
    `Variety seed: ${input.plan.varietySeed}. Change the wording every time — do not reuse a canned intro.`,
    "",
    "This is the briefing only. Return JSON only:",
    '{"reply":"spoken interviewer response","show_code":false,"end_interview":false}',
    "In 2–4 spoken sentences: introduce yourself as the PathED interviewer, mention the role, and outline the format.",
    "Do not ask an interview question yet. Do not start the main interview.",
    'End by telling them to say "start interview" when they are ready.',
    "Always set show_code false and end_interview false.",
  ].join("\n");
}

export function buildInterviewTurnPrompt(input: {
  plan: InterviewPlan;
  studentName: string;
  elapsedSec: number;
  history: Array<{ role: string; content: string }>;
  message: string;
  codeSnapshot?: string | null;
  firstQuestion?: boolean;
  questionAngle?: string;
}): string {
  const hist = input.history
    .slice(-18)
    .map((t) => `${t.role === "student" ? "Student" : "Interviewer"}: ${t.content}`)
    .join("\n");
  const code = input.codeSnapshot?.trim()
    ? `\nCurrent code in the editor:\n\`\`\`\n${input.codeSnapshot.slice(0, 4000)}\n\`\`\``
    : "";
  const coding = input.plan.coding
    ? `There is an optional coding problem (${input.plan.coding.title}, ${input.plan.coding.difficulty}). Do not open it on a timer. First stay on conversation. Only when you explicitly ask them to write code in this same reply, set show_code true.`
    : "No coding problem this round. Always set show_code false.";
  const used = input.plan.askedAngles.length
    ? `Already used themes (do not repeat): ${input.plan.askedAngles.join("; ")}.`
    : "No themes used yet.";
  const first = input.firstQuestion
    ? [
        "The candidate just said they are ready. Start the MAIN interview now.",
        "Do not greet at length. Ask ONE fresh first question.",
        `Theme for this question (invent a real spoken question; do not read the theme aloud): ${input.questionAngle}.`,
        'Never default to "tell me about a recent project or class" unless that is the assigned theme.',
        "Every session must get a different first question.",
      ].join(" ")
    : [
        "This is the live interview. Follow their last answer, then ask a new question only when the current thread is done.",
        input.questionAngle
          ? `If you ask a new question, lean toward this unused theme (invent the wording): ${input.questionAngle}.`
          : "If you ask a new question, pick a new theme. Do not reuse earlier questions.",
        used,
      ].join(" ");

  return [
    `Student: ${input.studentName || "Candidate"}.`,
    `Role: ${input.plan.targetRole}. Company target: ${input.plan.targetCompany || "unspecified"}.`,
    `Track: ${input.plan.track}. Duration: ${input.plan.durationMinutes} minutes. Elapsed: ${Math.floor(input.elapsedSec / 60)}m ${input.elapsedSec % 60}s.`,
    `Variety seed: ${input.plan.varietySeed}. Questions must not be fixed or reused across interviews.`,
    coding,
    "",
    "Return JSON only:",
    '{"reply":"spoken interviewer response","show_code":false,"end_interview":false}',
    "Set show_code true only in the reply where you ask them to write code. Keep it false for greetings and verbal discussion. Set end_interview true when time is up or the student clearly wants to stop.",
    first,
    "",
    "Transcript so far:",
    hist || "(briefing only so far)",
    code,
    "",
    `Student just said: ${input.message}`,
  ].join("\n");
}

export function buildInterviewScorePrompt(input: {
  plan: InterviewPlan;
  transcript: string;
  integrityCount: number;
}): string {
  return [
    "Score this mock interview. Return JSON only:",
    '{"overall":0,"communication":0,"problemSolving":0,"codeQuality":0,"depth":0,"summary":"2-4 sentences","quotes":[{"quote":"...","note":"..."}],"nextPractice":[{"label":"...","href":"/dashboard/problems"}]}',
    "Scores are integers 0-100. overall is a weighted blend. quotes must be short transcript evidence.",
    "Ignore the briefing before they said start interview when judging substance.",
    "nextPractice: 2-4 PathED links under /dashboard/problems, /dashboard/roadmap, or /dashboard/interview.",
    `Role: ${input.plan.targetRole}. Company: ${input.plan.targetCompany || "n/a"}. Track: ${input.plan.track}.`,
    `Integrity flags (tab switches / pastes): ${input.integrityCount}. Mention them as practice notes, not a fail.`,
    "",
    "Transcript:",
    input.transcript.slice(0, 14000) || "(empty)",
  ].join("\n");
}

export function buildVoiceInstructions(plan: InterviewPlan, studentName: string): string {
  const coding = plan.coding
    ? `Later you may use this coding problem: ${plan.coding.title}. Talk through the approach first. Only invite them to code when you are ready — do not start the editor on a clock. Do not dictate a full solution.`
    : "Stay on behavioral and conceptual questions.";
  return [
    INTERVIEW_SYSTEM_INSTRUCTION,
    `The student's name is ${studentName || "the candidate"}.`,
    `They are practicing for ${plan.targetRole}${plan.targetCompany ? ` at ${plan.targetCompany}` : ""}.`,
    `This is a ${plan.durationMinutes}-minute ${plan.track.replace("_", " + ")} mock interview.`,
    "First only introduce yourself and ask them to say start interview. After they say it, ask a fresh first question — never the same opener twice.",
    coding,
    "When time is nearly up, thank them and recap 2 strengths and 1 thing to practice.",
  ].join(" ");
}
