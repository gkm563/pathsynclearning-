/**
 * Golden tests for evidence-backed CRI (no DB).
 * Run: npm run test:cri
 */
import assert from "node:assert/strict";
import { computeCri, emptyCriFacts } from "../src/lib/cri/compute";
import {
  CRI_FORMULA_ID,
  LIVE_WEIGHT_MILLI,
  PHASE1_LIVE,
  PHASE1_RESERVED,
  PUBLISHED_WEIGHT_PCT,
} from "../src/lib/cri/formula";
import { CRI_FULL_MILLI, criInteger, formatCri, resolveCriMilli } from "../src/lib/cri/milli";
import type { CriFacts } from "../src/lib/cri/types";

const NOW = Date.parse("2026-09-15T12:00:00.000Z");

function section(name: string) {
  console.log(`\n✓ ${name}`);
}

section("live weights sum to 100000 milli");
const liveSum = PHASE1_LIVE.reduce((s, id) => s + LIVE_WEIGHT_MILLI[id], 0);
assert.equal(liveSum, CRI_FULL_MILLI);
assert.equal(
  Object.values(PUBLISHED_WEIGHT_PCT).reduce((s, n) => s + n, 0),
  100,
);

section("empty facts → 0 CRI, reserved not_scored");
const empty = computeCri(emptyCriFacts(), NOW);
assert.equal(empty.formulaId, CRI_FORMULA_ID);
assert.equal(empty.criMilli, 0);
assert.equal(formatCri(empty.criMilli), "0.000");
for (const id of PHASE1_RESERVED) {
  const row = empty.components.find((c) => c.id === id);
  assert.equal(row?.status, "not_scored");
  assert.equal(row?.contributionMilli, 0);
}

section("identical facts → bit-identical milli");
const facts: CriFacts = {
  ...emptyCriFacts(),
  targetRole: "Software Engineer (SDE)",
  dsa: [
    {
      id: "a1",
      problemKey: "two-sum",
      passed: true,
      score: 100,
      difficulty: "easy",
      careerTags: ["sde"],
      topics: ["arrays"],
      durationMs: 600_000,
      estMinutes: 20,
      createdAtMs: NOW - 3 * 86_400_000,
    },
    {
      id: "a2",
      problemKey: "two-sum",
      passed: true,
      score: 100,
      difficulty: "easy",
      careerTags: ["sde"],
      topics: ["arrays"],
      durationMs: 400_000,
      estMinutes: 20,
      createdAtMs: NOW - 2 * 86_400_000,
    },
    {
      id: "a3",
      problemKey: "lfu",
      passed: true,
      score: 100,
      difficulty: "hard",
      careerTags: ["Software Engineer"],
      topics: ["cache"],
      durationMs: null,
      estMinutes: 45,
      createdAtMs: NOW - 10 * 86_400_000,
    },
  ],
  profile: {
    fullName: true,
    username: true,
    bio: true,
    institute: true,
    degree: true,
    github: true,
    linkedin: true,
    skills: true,
    projects: true,
    additionalCompleted: true,
  },
};
const first = computeCri(facts, NOW);
const second = computeCri(facts, NOW);
assert.equal(first.criMilli, second.criMilli);
assert.ok(first.criMilli > 0);

section("missing duration → time sub-factor 0, not guessed");
const noTime = computeCri(
  {
    ...emptyCriFacts(),
    targetRole: "Software Engineer (SDE)",
    dsa: [
      {
        id: "t1",
        problemKey: "p1",
        passed: true,
        score: 100,
        difficulty: "medium",
        careerTags: [],
        topics: [],
        durationMs: null,
        estMinutes: 30,
        createdAtMs: NOW,
      },
    ],
  },
  NOW,
);
const withTime = computeCri(
  {
    ...emptyCriFacts(),
    targetRole: "Software Engineer (SDE)",
    dsa: [
      {
        id: "t1",
        problemKey: "p1",
        passed: true,
        score: 100,
        difficulty: "medium",
        careerTags: [],
        topics: [],
        durationMs: 60_000,
        estMinutes: 30,
        createdAtMs: NOW,
      },
    ],
  },
  NOW,
);
assert.ok(withTime.criMilli > noTime.criMilli);

section("unrelated career → DSA 0");
const otherCareer = computeCri(
  {
    ...facts,
    targetRole: "UI / UX Designer",
  },
  NOW,
);
const dsa = otherCareer.components.find((c) => c.id === "dsa");
assert.equal(dsa?.scoreMilli, 0);
assert.equal(dsa?.status, "missing");

section("integer display rounds millipoints");
assert.equal(criInteger(78_263), 78);
assert.equal(formatCri(78_263), "78.263");

section("milli 0 is valid and does not fall back to integer CRI");
assert.equal(resolveCriMilli(0, 70), 0);
assert.equal(resolveCriMilli(null, 70), 70_000);
assert.equal(resolveCriMilli(undefined, 70), 70_000);
assert.equal(formatCri(resolveCriMilli(0, 70)), "0.000");

console.log("\nAll CRI tests passed.");
