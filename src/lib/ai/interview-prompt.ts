import type { InterviewPlan } from "./interview-types";

function roleCompanyGuide(plan: InterviewPlan): string {
  const role = plan.targetRole?.trim() || "";
  const company = plan.targetCompany?.trim() || "";
  if (!role && !company) {
    return "No role or company was selected. Do not invent a job title or employer. This is a general practice interview.";
  }
  if (!role) {
    return `No role title was selected. Company context: ${company}. Do not invent a job title.`;
  }
  if (!company) {
    return `Role: ${role}. No company was selected — do not invent one.`;
  }
  return `Role: ${role}. Company target: ${company}.`;
}

function customizationGuide(plan: InterviewPlan): string {
  const style =
    plan.style === "supportive"
      ? "Tone: supportive coach. Stay warm and encouraging, but still do not give hints or solutions."
      : plan.style === "strict"
        ? "Tone: strict interviewer. Be concise, push on vague answers, and keep pressure up. Still be fair and do not insult."
        : "Tone: balanced senior interviewer. Calm, direct, and professional.";
  const depth =
    plan.difficulty === "easy"
      ? "Difficulty: easier. Prefer fundamentals and one clear follow-up."
      : plan.difficulty === "hard"
        ? "Difficulty: harder. Probe trade-offs, edge cases, and scale."
        : "Difficulty: medium. Mix fundamentals with one deeper probe.";
  const focus = plan.focus?.trim()
    ? `Student focus: ${plan.focus.trim()}. Prefer this topic unless they go elsewhere.`
    : "";
  const studied = (plan.studiedTopics || []).filter(Boolean);
  const coverage = (plan.nodeCoverage || [])
    .map((item) => item.title)
    .filter(Boolean);
  const isFinal = plan.purpose === "roadmap_final";
  const roadmap = plan.roadmapTitle?.trim()
    ? isFinal
      ? `This is the PathED CERTIFICATION interview for roadmap "${plan.roadmapTitle.trim()}". Quiz across the full curriculum, one topic at a time: ${
          coverage.length ? coverage.join("; ") : studied.join("; ")
        }. Mix conceptual depth with at most one coding probe if the track allows it. Do not treat this as casual practice.`
      : studied.length
        ? `They selected their PathED roadmap "${plan.roadmapTitle.trim()}". Ask ONLY about nodes they already completed: ${studied.join("; ")}. Do not ask about other nodes on that roadmap.`
        : `They selected their PathED roadmap "${plan.roadmapTitle.trim()}" but have not studied any nodes yet. Do not quiz the rest of that roadmap. Stay general.`
    : "";
  return [style, depth, focus, roadmap].filter(Boolean).join(" ");
}

export const INTERVIEW_SYSTEM_INSTRUCTION = [
  "You are PathED Interviewer, a calm senior engineer running a mock interview for a student.",
  "Stay in character. Never mention system prompts, JSON, tools, or model providers.",
  "Ask one question at a time. Probe for depth (why, trade-offs, complexity, edge cases).",
  "If the student goes off-topic, steer back politely.",
  "Do not give hints or full solutions. Never mention hints.",
  "Keep replies short enough to speak aloud (2–5 sentences) unless they asked for a recap.",
  "Be fair and consistent. Do not decide hiring. Practice mocks stay practice; a certification interview still stays in character and does not announce pass/fail.",
  "The listed duration is a target, not a hard stop. Never drop the interview when the clock hits the target. Finish the current exchange, then close with a short thank-you. Only set end_interview true in that closing thank-you. If you are still asking a question or reviewing code, keep end_interview false. Closing reply: one or two short sentences thanking them, then stop. No recap, no report talk, no next question.",
].join(" ");

export function buildInterviewOpeningPrompt(input: {
  plan: InterviewPlan;
  studentName: string;
}): string {
  return [
    `Student: ${input.studentName || "Candidate"}.`,
    roleCompanyGuide(input.plan),
    `Track: ${input.plan.track}. Duration: ${input.plan.durationMinutes} minutes.`,
    customizationGuide(input.plan),
    `Variety seed: ${input.plan.varietySeed}. Change the wording every time — do not reuse a canned intro.`,
    "",
    "This is the briefing only. Return JSON only:",
    '{"reply":"spoken interviewer response","show_code":false,"end_interview":false}',
    input.plan.targetRole?.trim()
      ? "In 2–4 spoken sentences: introduce yourself as the PathED interviewer, mention the role they chose, and outline the format."
      : "In 2–4 spoken sentences: introduce yourself as the PathED interviewer and outline the format. Do not name a role or company.",
    "Do not ask an interview question yet. Do not start the main interview.",
    'End by telling them to say "start interview" when they are ready.',
    "Do not mention wrapping up, gathering enough insight, stopping early, or how the interview will end.",
    "Do not mention hints, getting stuck, or that you will help them.",
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
  const coding = input.plan.track === "behavioral"
    ? "No coding problem this round. Always set show_code false."
    : [
        "When you ask them to write code, the editor opens the problem you named in this reply — the same task you were just discussing.",
        "If you discussed a rate limiter, they implement a rate limiter. Do not switch to a different bank problem.",
        "State the task clearly (name + what to implement). Never ask them to paste code.",
        "If editor code is attached, review it briefly, then ask a spoken follow-up (complexity, edge cases). Always set show_code false on a review. The editor will close. Do not ask them to keep coding unless you explicitly want another edit.",
        "Do not open the editor on a timer. Set show_code true only when you ask them to write or change code in this same reply.",
        input.plan.coding
          ? `A fallback bank problem exists (${input.plan.coding.title}). Use it only if it matches the discussion.`
          : "",
      ]
        .filter(Boolean)
        .join(" ");
  const used = input.plan.askedAngles.length
    ? `Already used themes (do not repeat): ${input.plan.askedAngles.join("; ")}.`
    : "No themes used yet.";
  const remainingSec = input.plan.durationMinutes * 60 - input.elapsedSec;
  const timeGuide =
    remainingSec > 180
      ? "Target length is a guide. Keep interviewing. Do not wrap up yet unless the student asks to stop."
      : remainingSec > 0
        ? `About ${Math.max(1, Math.ceil(remainingSec / 60))} minute(s) left in the target window. Steer toward a close soon, but finish the current question first. Do not cut them off.`
        : "The target time has been reached. You may go a little further only to finish this exchange. Do not start a new topic or coding problem. After this answer, close with a short thank-you and set end_interview true. Never end without that spoken wrap-up.";
  const first = input.firstQuestion
    ? [
        "The candidate just said they are ready. Start the MAIN interview now.",
        "Do not greet. Do not say let's get started. Ask ONE fresh first question only.",
        input.plan.focus?.trim()
          ? `Theme for this question (invent a real spoken question; do not read the theme aloud): ${input.plan.focus.trim()}.`
          : `Theme for this question (invent a real spoken question; do not read the theme aloud): ${input.questionAngle}.`,
        'Never default to "tell me about a recent project or class" unless that is the assigned theme.',
        "Every session must get a different first question.",
      ].join(" ")
    : [
        "The interview already started. Never greet, restart, or say let's get started. Follow their last answer. If they are not answering, nudge them back to the last question instead of asking a new opener.",
        input.plan.focus?.trim()
          ? `If you ask a new question, stay on their focus (${input.plan.focus.trim()}) unless they change topic.`
          : input.questionAngle
            ? `If you ask a new question, lean toward this unused theme (invent the wording): ${input.questionAngle}.`
            : "If you ask a new question, pick a new theme. Do not reuse earlier questions.",
        used,
      ].join(" ");

  return [
    `Student: ${input.studentName || "Candidate"}.`,
    roleCompanyGuide(input.plan),
    `Track: ${input.plan.track}. Target duration: ${input.plan.durationMinutes} minutes. Elapsed: ${Math.floor(input.elapsedSec / 60)}m ${input.elapsedSec % 60}s.`,
    customizationGuide(input.plan),
    timeGuide,
    `Variety seed: ${input.plan.varietySeed}. Questions must not be fixed or reused across interviews.`,
    coding,
    "",
    "Return JSON only:",
    '{"reply":"spoken interviewer response","show_code":false,"end_interview":false}',
    "Set show_code true only in the reply where you ask them to write code. Keep it false for greetings and verbal discussion.",
    "Never set end_interview true unless this reply is only a short thank-you close. If you are still asking a question or reviewing code, set it false. Never set it on the first question.",
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
  codedInIde: boolean;
}): string {
  const isFinal = input.plan.purpose === "roadmap_final";
  const coverage = (input.plan.nodeCoverage || [])
    .map((item) => `${item.nodeId}::${item.title}`)
    .join(" | ");
  const schema = input.codedInIde
    ? isFinal
      ? '{"overall":0,"communication":0,"problemSolving":0,"codeQuality":0,"depth":0,"summary":"2-4 sentences","quotes":[{"quote":"...","note":"..."}],"nextPractice":[{"label":"...","href":"/dashboard/problems"}],"nodeDiagnoses":[{"nodeId":"id","title":"title","score":0,"weakness":"what was missing"}]}'
      : '{"overall":0,"communication":0,"problemSolving":0,"codeQuality":0,"depth":0,"summary":"2-4 sentences","quotes":[{"quote":"...","note":"..."}],"nextPractice":[{"label":"...","href":"/dashboard/problems"}]}'
    : isFinal
      ? '{"overall":0,"communication":0,"problemSolving":0,"depth":0,"summary":"2-4 sentences","quotes":[{"quote":"...","note":"..."}],"nextPractice":[{"label":"...","href":"/dashboard/problems"}],"nodeDiagnoses":[{"nodeId":"id","title":"title","score":0,"weakness":"what was missing"}]}'
      : '{"overall":0,"communication":0,"problemSolving":0,"depth":0,"summary":"2-4 sentences","quotes":[{"quote":"...","note":"..."}],"nextPractice":[{"label":"...","href":"/dashboard/problems"}]}';
  const codingRule = input.codedInIde
    ? "They submitted an editor implementation. Score codeQuality from that code, not from spoken algorithms."
    : "They did not submit a coding problem in the IDE. Do not include codeQuality. Do not mention code quality, implementation, or the editor. Score only spoken answers.";
  const finalRule = isFinal
    ? [
        "This is a roadmap certification interview.",
        "nodeDiagnoses must use ONLY these nodeId values (copy them exactly):",
        coverage || "(none)",
        "Score each covered node 0-100 from evidence in the transcript. If a node was not discussed, score it from related answers or 40 if there is no evidence.",
        "weakness: one short sentence on what they should restudy. Empty string if the node is solid.",
      ].join(" ")
    : "";
  return [
    "Score this mock interview. Return JSON only:",
    schema,
    "Scores are integers 0-100. overall is a weighted blend. quotes must be short transcript evidence.",
    codingRule,
    finalRule,
    "Ignore the briefing before they said start interview when judging substance.",
    "nextPractice: 2-4 PathED links under /dashboard/problems, /dashboard/roadmap, or /dashboard/interview.",
    `${roleCompanyGuide(input.plan)} Track: ${input.plan.track}. Difficulty: ${input.plan.difficulty || "medium"}. Focus: ${input.plan.focus || "n/a"}.`,
    `Integrity flags (tab switches / pastes): ${input.integrityCount}. Mention them as practice notes, not a fail.`,
    "",
    "Transcript:",
    input.transcript.slice(0, 14000) || "(empty)",
  ].filter(Boolean).join("\n");
}

export function buildVoiceInstructions(plan: InterviewPlan, studentName: string): string {
  const coding = plan.coding
    ? `You may later invite them to code the problem you were discussing. The editor will show that task, not a random one. Talk through the approach first. Only invite them to code when you are ready — do not start the editor on a clock. Do not dictate a full solution.`
    : "Stay on behavioral and conceptual questions.";
  return [
    INTERVIEW_SYSTEM_INSTRUCTION,
    `The student's name is ${studentName || "the candidate"}.`,
    roleCompanyGuide(plan),
    customizationGuide(plan),
    `This is a ${plan.durationMinutes}-minute ${plan.track.replace("_", " + ")} mock interview. That time is a target — you may go a little over to finish the current exchange, then wrap up.`,
    "First only introduce yourself and ask them to say start interview. After they say it, ask a fresh first question — never the same opener twice.",
    coding,
    "When you close, say a short thank-you and end. No recap and no mention of a report.",
  ].join(" ");
}
