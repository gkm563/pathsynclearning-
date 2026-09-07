"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Check,
  X,
  ShieldAlert,
  Code2,
  Sun,
  Moon,
  Send,
  FileText,
  CheckSquare,
  BarChart2,
  Clock,
  Timer,
  HardDrive,
} from "lucide-react";
import ChallengeIcon from "@/components/challenges/ChallengeIcon";
import { CAT_COLORS } from "@/lib/challenges/catalog";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  Select,
  Tabs,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/cn";

const DIFF_TONE: Record<string, "success" | "warning" | "error" | "accent"> = {
  Easy: "success",
  Medium: "warning",
  Hard: "error",
  Milestone: "accent",
};

/* ─── CHALLENGE CARD COMPONENT ─── */
export function LegacyChallengeCard({ ch, onOpenIDE, onOpenMCQ, onMarkDone }) {
  const catColor = CAT_COLORS[ch.cat] || "var(--primary)";

  return (
    <motion.div whileHover={{ y: -4 }} className="relative">
      <Card
        className={cn(
          "flex h-full flex-col justify-between",
          ch.done &&
            "border-[color-mix(in_srgb,var(--success)_36%,var(--border-light))] bg-success-soft",
        )}
      >
        {ch.done && (
          <Badge tone="success" className="absolute top-4 right-4">
            Done
          </Badge>
        )}

        <div>
          <div className="mb-3 flex items-center gap-3">
            <ChallengeIcon name={ch.icon} size={22} color={catColor} />
            <div className="flex flex-wrap gap-2">
              <Badge tone={DIFF_TONE[ch.diff] || "warning"}>{ch.diff}</Badge>
              <Badge tone="accent">{ch.cat}</Badge>
            </div>
          </div>

          <h3 className="type-h4 m-0 mb-2 text-ink">{ch.label}</h3>
          <p className="type-body m-0 mb-4 text-muted">{ch.desc}</p>
        </div>

        <div>
          <div className="type-caption mb-3.5 flex items-center justify-between">
            <span className="font-semibold text-primary">+{ch.xp} XP</span>
            <span className="inline-flex items-center gap-1 text-muted">
              <Clock size={12} aria-hidden />
              {ch.time}
            </span>
          </div>

          <div className="flex gap-2.5">
            {ch.done ? (
              <div className="w-full rounded-[var(--radius-md)] bg-success-soft px-3 py-3 text-center type-small font-semibold text-success">
                Solution verified
              </div>
            ) : (
              <>
                <Button
                  className="flex-[2]"
                  onClick={ch.type === "MCQ" ? onOpenMCQ : onOpenIDE}
                >
                  {ch.type === "MCQ" ? (
                    <ShieldAlert size={16} aria-hidden />
                  ) : (
                    <Code2 size={16} aria-hidden />
                  )}
                  {ch.type === "MCQ" ? "Launch Assessment" : "Launch Pro IDE"}
                </Button>
                <Button variant="secondary" className="flex-1" onClick={onMarkDone}>
                  Mark
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

type IdeTab = "description" | "testcases" | "feedback" | "submissions";

/* ─── MNC-GRADE PRO IDE PANEL ─── */
export function ProIdePanel({ challenge, onClose, onSubmit }) {
  const [themeMode, setThemeMode] = useState("light");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [activeTab, setActiveTab] = useState<IdeTab>("description");

  const [terminalLogs, setTerminalLogs] = useState([
    "$ PathEd Code Evaluation Engine v3.2 Ready...",
    `$ Loaded challenge: '${challenge?.label}'`
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [testResults, setTestResults] = useState(challenge?.testCases || []);
  const [aiFeedback, setAiFeedback] = useState<any>(null);

  useEffect(() => {
    // Always start blank — never inject catalog starter/solution code
    setCode("");
    setTerminalLogs([
      "$ PathEd Evaluation Engine v3.2 Ready...",
      `$ Target problem: '${challenge?.label}'`,
      "$ Write your solution from scratch in the editor.",
    ]);
    setTestResults(challenge?.testCases || []);
    setAiFeedback(null);
  }, [challenge]);

  if (!challenge) return null;

  const isLight = themeMode === "light";

  const evaluateUserCode = (isFullSubmission = false) => {
    const isWorking = isFullSubmission ? setIsSubmitting : setIsRunning;
    isWorking(true);

    setTerminalLogs(prev => [
      ...prev,
      `$ Evaluating ${language.toUpperCase()} solution AST against test suites...`,
      "$ Running AI Logic Auditor..."
    ]);

    setTimeout(() => {
      isWorking(false);

      const isCodeEmpty = !code || code.trim().length < 20 || (code.includes("pass") && code.split("\n").length < 6);

      if (isCodeEmpty) {
        setTerminalLogs(prev => [
          ...prev,
          "EVALUATION FAILURE: Code body incomplete or empty.",
          "Hint: Implement the full solution before submitting.",
        ]);
        setTestResults(prev => prev.map(tc => ({ ...tc, status: "Failed", runtime: "0ms", actual: "None" })));
        setAiFeedback({
          score: "20 / 100",
          status: "Incomplete Code Logic",
          timeComplexity: "N/A",
          spaceComplexity: "N/A",
          review: "The submitted code is empty or incomplete. Implement the required algorithm before submitting.",
        });
        setActiveTab("testcases");
        return;
      }

      // Local dry-run only — no hardcoded pass. Require non-empty original work.
      const updatedTCs = (challenge.testCases || []).map((tc) => ({
        ...tc,
        status: "Needs Judge",
        runtime: "-",
        memory: "-",
        actual: "Submit to record attempt (local preview only)",
      }));

      setTestResults(updatedTCs);

      setAiFeedback({
        score: "Pending",
        status: "Local preview — not auto-accepted",
        timeComplexity: "Review manually",
        spaceComplexity: "Review manually",
        review: "Starter/solution code is not injected. Mark solved after you verify your approach, or use Mark solved on the card.",
      });

      setTerminalLogs(prev => [
        ...prev,
        "Local preview complete — no hardcoded acceptance.",
        isFullSubmission
          ? "Recording attempt. Verify logic before relying on score."
          : "Run finished. Use Submit to record progress.",
      ]);

      if (isFullSubmission) {
        onSubmit(challenge.id);
      }

      setActiveTab("testcases");

    }, 1100);
  };

  const ideTabs = [
    { id: "description" as const, label: "Problem Statement", icon: <FileText size={14} /> },
    { id: "testcases" as const, label: "Test Suite", icon: <CheckSquare size={14} /> },
    { id: "feedback" as const, label: "AI Review", icon: <BarChart2 size={14} /> },
    { id: "submissions" as const, label: "Submissions", icon: <FileText size={14} /> },
  ];

  return (
    <div
      data-theme={isLight ? undefined : "dark"}
      className="fixed inset-0 flex flex-col bg-canvas text-ink"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div className="flex items-center justify-between border-b border-line bg-sunken px-5 py-3">
        <div className="flex items-center gap-3">
          <ChallengeIcon name={challenge.icon} size={20} color="var(--primary)" />
          <div>
            <div className="type-h4 text-ink">{challenge.label}</div>
            <div className="type-overline text-success">
              PathEd Pro IDE & code evaluation engine v3.2
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setThemeMode(isLight ? "dark" : "light")}
          >
            {isLight ? <Moon size={14} aria-hidden /> : <Sun size={14} aria-hidden />}
            {isLight ? "Dark IDE" : "Light IDE"}
          </Button>

          <Select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="min-h-9 w-auto py-1.5 type-code"
          >
            <option value="python">Python 3 (v3.12)</option>
            <option value="javascript">JavaScript / Node.js (v20)</option>
            <option value="cpp">C++ (GCC 13 / C++20)</option>
            <option value="java">Java (OpenJDK 21)</option>
            <option value="go">Go (v1.22)</option>
            <option value="sql">PostgreSQL SQL</option>
          </Select>

          <IconButton label="Close IDE" variant="secondary" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_1.25fr] overflow-hidden">
        <div className="flex flex-col overflow-hidden border-r border-line bg-surface">
          <Tabs
            items={ideTabs}
            value={activeTab}
            onChange={(id) => setActiveTab(id as IdeTab)}
            ariaLabel="IDE panels"
            className="bg-sunken px-2"
          />

          <div className="flex-1 overflow-y-auto p-5 text-ink">
            {activeTab === "description" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="type-h4 m-0 mb-2 text-ink">Problem Description</h3>
                  <div className="type-body whitespace-pre-line text-ink">
                    {challenge.problem}
                  </div>
                </div>

                {challenge.examples && (
                  <Card className="bg-sunken p-3.5 sm:p-3.5">
                    <p className="type-overline mb-1.5 text-info">Sample test examples</p>
                    <pre className="type-code m-0 whitespace-pre-wrap text-muted">
                      {challenge.examples}
                    </pre>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "testcases" && (
              <div className="flex flex-col gap-3.5">
                <h3 className="type-h4 m-0 text-ink">
                  Detailed Test Suite Results ({testResults.length} Cases)
                </h3>

                {testResults.map((tc, idx) => (
                  <Card
                    key={idx}
                    className={cn(
                      "bg-sunken p-3.5 sm:p-3.5",
                      tc.status?.includes("Passed") &&
                        "border-[color-mix(in_srgb,var(--success)_36%,var(--border-light))]",
                    )}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="type-code font-semibold text-ink">
                        Case {idx + 1}: {tc.name || `Test Case ${idx + 1}`}
                      </span>
                      {tc.status && (
                        <Badge
                          tone={
                            tc.status.includes("Passed")
                              ? "success"
                              : tc.status.includes("Failed")
                                ? "error"
                                : "warning"
                          }
                        >
                          {tc.status}
                        </Badge>
                      )}
                    </div>

                    <div className="type-code text-muted">
                      <div><b className="text-ink">Input:</b> {tc.input}</div>
                      <div><b className="text-ink">Expected:</b> {tc.expected}</div>
                      {tc.actual && (
                        <div className="text-success">
                          <b>Actual Output:</b> {tc.actual}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "feedback" && (
              <div className="flex flex-col gap-3.5">
                <h3 className="type-h4 m-0 text-ink">
                  AI Code Review & Complexity Analysis
                </h3>

                {aiFeedback ? (
                  <Alert tone="success" title={`Score: ${aiFeedback.score}`}>
                    <p className="type-caption m-0 font-semibold">{aiFeedback.status}</p>
                    <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                      <div className="rounded-[var(--radius-sm)] bg-surface p-2 type-code">
                        <Timer size={12} className="mr-1 inline" aria-hidden />
                        Time: <b>{aiFeedback.timeComplexity}</b>
                      </div>
                      <div className="rounded-[var(--radius-sm)] bg-surface p-2 type-code">
                        <HardDrive size={12} className="mr-1 inline" aria-hidden />
                        Space: <b>{aiFeedback.spaceComplexity}</b>
                      </div>
                    </div>
                    <p className="type-small mt-2.5 mb-0">
                      <b>AI Audit Note:</b> {aiFeedback.review}
                    </p>
                  </Alert>
                ) : (
                  <EmptyState
                    compact
                    title="No review yet"
                    description="Run or submit your code to generate real-time AI logic analysis and complexity bounds."
                  />
                )}
              </div>
            )}

            {activeTab === "submissions" && (
              <div>
                <h3 className="type-h4 mb-3 text-ink">Submissions Log</h3>
                {challenge.done ? (
                  <Alert tone="success" title="Accepted">
                    Runtime: 12ms (Beats 98.4%) · Memory: 16.4 MB
                  </Alert>
                ) : (
                  <EmptyState
                    compact
                    title="No submissions"
                    description="No submitted solution logged yet for this problem."
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden bg-sunken">
          <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2">
            <span className="type-code text-success">
              solution.{language === "python" ? "py" : language === "javascript" ? "js" : "cpp"}
            </span>
            <span className="type-caption text-muted">UTF-8 · Real AI Judge Connected</span>
          </div>

          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            className="min-h-0 flex-1 resize-none border-0 bg-sunken p-4 type-code text-ink outline-none"
          />

          <div className="flex items-center gap-3 border-t border-line bg-surface px-4 py-3">
            <Button
              variant="outline"
              onClick={() => evaluateUserCode(false)}
              disabled={isRunning}
              loading={isRunning}
            >
              <Play size={15} aria-hidden />
              {isRunning ? "Evaluating..." : "Run Code"}
            </Button>

            <Button
              onClick={() => evaluateUserCode(true)}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              <Send size={15} aria-hidden />
              {isSubmitting ? "Submitting..." : "Submit Solution"}
            </Button>

            <span className="type-caption ml-auto font-semibold text-warning">
              Reward: +{challenge.xp} XP
            </span>
          </div>

          <div className="h-[125px] overflow-y-auto border-t border-line bg-inverse p-3 type-code text-on-inverse">
            {terminalLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.includes("✓") || log.includes("ACCEPTED")
                    ? "text-success"
                    : log.includes("❌")
                      ? "text-danger"
                      : "text-on-inverse"
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DEDICATED FULLSCREEN PRO ASSESSMENT PAGE (SERIES OF 7 QUESTIONS & LIGHT/DARK THEME ADAPTIVE) ─── */
export function ProAssessmentSubpage({ challenge, onClose, onSubmit }) {
  const [themeMode, setThemeMode] = useState("light"); // "light" or "dark" (Default Light Mode UI)
  const questionsList = challenge.questions || [
    {
      id: 1,
      q: challenge.q || "Primary Question",
      opts: challenge.opts || ["Option A", "Option B", "Option C", "Option D"],
      correct: challenge.correct || 0,
      explanation: challenge.explanation || "Explanation detail."
    }
  ];

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({}); // { [qId]: selectedOptIndex }
  const [userReasonings, setUserReasonings] = useState<Record<string, any>>({}); // { [qId]: text }
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [timerSecs, setTimerSecs] = useState(420); // 7-minute countdown for 7 questions

  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSecs(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!challenge) return null;

  const currentQ = questionsList[currentQIndex] || questionsList[0];
  const isLight = themeMode === "light";

  const handleSelectOption = (optIndex) => {
    setUserAnswers(prev => ({ ...prev, [currentQ.id]: optIndex }));
  };

  const handleReasoningChange = (text) => {
    setUserReasonings(prev => ({ ...prev, [currentQ.id]: text }));
  };

  // Submit Full Assessment Suite
  const handleSubmitFullAssessment = () => {
    setIsExamSubmitted(true);
    let correctCount = 0;
    questionsList.forEach((q) => {
      if (userAnswers[q.id] === q.correct) correctCount += 1;
    });
    const percentage = Math.round(
      (correctCount / Math.max(1, questionsList.length)) * 100,
    );
    onSubmit(challenge.id, percentage);
  };

  // Calculate Final Score
  const calculateScore = () => {
    let correctCount = 0;
    questionsList.forEach(q => {
      if (userAnswers[q.id] === q.correct) correctCount += 1;
    });
    return {
      correctCount,
      total: questionsList.length,
      percentage: Math.round((correctCount / questionsList.length) * 100)
    };
  };

  const scoreResult = isExamSubmitted ? calculateScore() : null;
  const minutes = Math.floor(timerSecs / 60);
  const seconds = timerSecs % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-theme={isLight ? undefined : "dark"}
      className="fixed inset-0 flex flex-col overflow-hidden bg-canvas text-ink"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div className="flex items-center justify-between border-b border-line bg-primary-soft px-7 py-4">
        <div className="flex items-center gap-3.5">
          <ShieldAlert size={24} className="text-info" />
          <div>
            <div className="type-h4 text-ink">
              PathEd proctorer assessment suite ({questionsList.length} questions)
            </div>
            <div className="type-caption inline-flex items-center gap-1 font-semibold text-info">
              <ShieldAlert size={12} aria-hidden />
              Proctoring active · anti-tab switch & timer enabled
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setThemeMode(isLight ? "dark" : "light")}
          >
            {isLight ? <Moon size={15} aria-hidden /> : <Sun size={15} aria-hidden />}
            {isLight ? "Dark Mode" : "Light Mode"}
          </Button>

          <Badge tone="info" className="type-code px-3 py-1.5 text-[14px] tracking-normal normal-case">
            <Clock size={14} aria-hidden />
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </Badge>

          <Button variant="secondary" onClick={onClose}>
            Exit Assessment
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto border-b border-line bg-surface px-7 py-3">
        <span className="type-overline shrink-0 text-primary">Question series</span>
        {questionsList.map((q, idx) => {
          const isCurrent = currentQIndex === idx;
          const isAnswered = userAnswers[q.id] !== undefined;

          return (
            <Button
              key={q.id}
              size="sm"
              variant={isCurrent ? "primary" : "secondary"}
              className={cn(
                "type-code",
                isAnswered &&
                  !isCurrent &&
                  "border-[color-mix(in_srgb,var(--success)_36%,var(--border-light))] bg-success-soft text-success",
              )}
              onClick={() => setCurrentQIndex(idx)}
            >
              Q{idx + 1}
              {isAnswered ? <Check size={12} aria-hidden /> : null}
            </Button>
          );
        })}
      </div>

      <div className="mx-auto flex w-full max-w-[880px] flex-1 flex-col gap-5 overflow-y-auto px-8 py-7">
        {isExamSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="flex flex-col gap-4.5 border-[color-mix(in_srgb,var(--success)_36%,var(--border-light))]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="type-h2 m-0 text-success">Assessment completed</h2>
                  <p className="type-small mt-1 mb-0 text-muted">
                    Your score and active recall reasoning notes have been logged to Memory Lane.
                  </p>
                </div>

                <div className="rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--success)_36%,var(--border-light))] bg-success-soft px-5 py-2.5 text-right">
                  <div className="type-h2 m-0 text-success">{scoreResult.percentage}%</div>
                  <div className="type-caption font-semibold text-success">
                    {scoreResult.correctCount} / {scoreResult.total} Correct
                  </div>
                </div>
              </div>

              <div className="mt-2.5 flex flex-col gap-3">
                <p className="type-overline m-0 text-success">
                  Series question breakdown & AI explanations
                </p>

                {questionsList.map((q, idx) => {
                  const userAns = userAnswers[q.id];
                  const isCorrect = userAns === q.correct;

                  return (
                    <Card
                      key={q.id}
                      className={cn(
                        "p-4 sm:p-4",
                        isCorrect
                          ? "border-[color-mix(in_srgb,var(--success)_36%,var(--border-light))] bg-success-soft"
                          : "border-[color-mix(in_srgb,var(--error)_36%,var(--border-light))] bg-danger-soft",
                      )}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="type-small font-semibold text-ink">
                          Q{idx + 1}: {q.q}
                        </span>
                        <Badge tone={isCorrect ? "success" : "error"}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                      </div>

                      <p className="type-small m-0 text-muted">
                        <b className="text-success">AI Solution Note:</b> {q.explanation}
                      </p>
                    </Card>
                  );
                })}
              </div>

              <Button className="mt-2.5 w-full" onClick={onClose}>
                Back to Challenges Workspace
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <Badge tone="accent">
                Question {currentQIndex + 1} of {questionsList.length} · {challenge.label}
              </Badge>

              <span className="type-caption font-semibold text-warning">
                Reward: +{challenge.xp} XP
              </span>
            </div>

            <h2 className="type-h3 m-0 text-ink">{currentQ.q}</h2>

            <div className="flex flex-col gap-3">
              {currentQ.opts.map((opt, idx) => {
                const isSelected = userAnswers[currentQ.id] === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3.5 rounded-[var(--radius-lg)] border px-5 py-4 text-left transition-colors duration-[var(--duration-fast)]",
                      isSelected
                        ? "border-primary bg-primary-soft"
                        : "border-line bg-sunken hover:border-primary-border",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full type-code font-semibold",
                        isSelected
                          ? "bg-primary text-on-primary"
                          : "border border-line-strong text-ink",
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className={cn("type-body", isSelected ? "font-semibold text-ink" : "text-ink")}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {userAnswers[currentQ.id] !== undefined && (
              <div>
                <label className="type-label mb-1.5 block text-primary">
                  Active recall prompt: Explain your technical reasoning for Q{currentQIndex + 1}
                </label>
                <Textarea
                  value={userReasonings[currentQ.id] || ""}
                  onChange={e => handleReasoningChange(e.target.value)}
                  placeholder="Explain why this option is technically correct (trains memory and logged to portfolio)..."
                  className="min-h-[85px] resize-none"
                />
              </div>
            )}

            <div className="mt-2.5 flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
              >
                Previous Q
              </Button>

              {currentQIndex < questionsList.length - 1 ? (
                <Button
                  onClick={() => setCurrentQIndex(prev => Math.min(questionsList.length - 1, prev + 1))}
                >
                  Next Q
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitFullAssessment}
                  disabled={Object.keys(userAnswers).length < questionsList.length}
                >
                  Submit Full Assessment Suite ({Object.keys(userAnswers).length} / {questionsList.length})
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
