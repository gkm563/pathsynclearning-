# CRI calculation guide

Extended reference for how PathED’s Career Readiness Index works: pipeline, parameters, component formulas, recompute triggers, and APIs.

The short product summary remains in [CRI.md](CRI.md). Formula id: **`cri.v1`**. Code: [`src/lib/cri/`](../src/lib/cri/).

> CRI measures demonstrated readiness for this career. It does not guarantee a job or tell a recruiter to hire.

| | |
| --- | --- |
| Student APIs | `GET /api/me/cri`, `GET /api/me/cri/evidence` |
| UI | Gauge + “Why this CRI?” dialog |
| Tests | `npm run test:cri` |

Changing any published weight, sub-weight, or scoring rule requires a **new formula id**. Old `cri_snapshots` stay auditable under the id they were computed with.

---

## What CRI is (and is not)

| CRI is | CRI is not |
| --- | --- |
| Evidence-backed readiness for a target role | A hire / reject recommendation |
| Deterministic (same facts → same milli) | Cohort-normalized or curved |
| Career-scoped for most components | A blend of every career’s activity |
| Auditable (snapshot + evidence IDs) | Driven by XP, coins, or streak alone |

**Not inputs:** XP, coins, wallet balance, store purchases. Streak feeds *consistency* only when gathered with other activity.

---

## How it works (pipeline)

```mermaid
flowchart LR
  A[Student activity] --> B[gatherCriFacts]
  B --> C[computeCri]
  C --> D[cri_snapshots + cri_evidence]
  D --> E[profiles.cri_milli / cri]
  E --> F[Gauge + Why dialog]
```

1. **Gather** — Load attempts, projects, interviews, roadmap progress, and profile fields (`gatherCriFacts`).
2. **Compute** — Pure function `computeCri(facts, nowMs)` scores each component in millipoints and mixes them with live weights.
3. **Persist** — Insert a snapshot + evidence rows; update `profiles.criMilli`, `profiles.cri`, `profiles.criFormula`, `profiles.criSnapshotId`.
4. **Display** — UI shows three-decimal percent from millipoints. “Why this CRI?” reads the latest snapshot (and can recompute if missing/stale).

Source of truth is **millipoints**, not the legacy integer `profiles.cri`.

---

## Units and top-level formula

| Concept | Value |
| --- | --- |
| Full scale | `100_000` millipoints = `100.000%` |
| Display | `formatCri(milli)` → three decimals (e.g. `78.263`) |
| Integer column | `profiles.cri = round(milli / 1000)` for older clients |
| Math | Integer only: `mulDivRound(numer, denom)` (half-up). No floating mixers. |

**Contribution of one live component:**

```
contributionMilli_c = round(liveWeightMilli_c × scoreMilli_c / 100_000)
```

**Overall CRI:**

```
CRI_milli = clamp( Σ contributionMilli_c  for live components )
```

Each `scoreMilli_c` is in `[0, 100_000]` (0%–100% of that component).

---

## Target career and scoping

CRI is computed for the student’s current target role (`roadmap_profiles.target_role`, else `career_goal`).

| Rule | Behavior |
| --- | --- |
| No target role | Career-scoped components score **0** (`missing`). Profile can still score. Overall CRI is usually near 0. |
| Evidence with **no** career tags | Counts as **general** — included for the current role. |
| Evidence tagged for **another** role | **Excluded**. |
| Evidence tagged matching current role | Included (catalog role id or skill-name match). |
| Interview session role | Must match current target role. |
| Profile completeness | **Global** (not career-scoped). |
| Career change | Triggers full recompute (`trigger: career`). Unrelated evidence drops out. |

Matching helpers: [`src/lib/cri/scope.ts`](../src/lib/cri/scope.ts).

---

## Published weights (full model)

These are the product weights (sum = 100%). They appear in the audit UI even when a row is not live yet.

| Component id | Label | Published weight | v1 status |
| --- | --- | --- | --- |
| `knowledge` | Technical / CS knowledge | 15% | Live |
| `dsa` | DSA and problem solving | 20% | Live |
| `projects` | Projects and engineering | 15% | Live |
| `interview` | Interview readiness | 15% | Live |
| `roadmap` | Roadmap skill mastery | 10% | Live |
| `consistency` | Consistency / retention | 10% | Live |
| `profile` | Resume / profile | 2% | Live |
| `opensource` | Open source | 5% | Reserved |
| `hackathons` | Hackathons / competitions | 5% | Reserved |
| `certifications` | Certifications | 3% | Reserved |

### Live renormalization (Phase 1)

Live published sum = **87%**. Reserved **13%** is not scored in v1.

Live weights are scaled to fill `100_000` milli:

```
liveWeightMilli_c ≈ publishedPct_c × 100_000 / 87
```

(Last live component absorbs remainder so the sum is exactly `100_000`.)

Reserved rows appear as `status: not_scored`, `liveWeightMilli: 0`, contribution `0`.

Constants: [`src/lib/cri/formula.ts`](../src/lib/cri/formula.ts).

---

## Component scores and input parameters

Every live component produces `scoreMilli` in `[0, 100_000]`. Missing evidence → score `0`, status `missing` (except profile, which always runs the checklist).

Difficulty map used by DSA / knowledge:

| Difficulty | Milli |
| --- | --- |
| easy | 40_000 |
| medium | 70_000 |
| hard | 100_000 |

Score fields that are already 0–100 become milli via `score × 1000`.

### 1. Technical / CS knowledge (`knowledge`) — 15% published

**Sources:** Challenge attempts with kind `mcq` or `system_design`; roadmap MCQ assessment attempts (career-tagged from node skills/topics).

**Inputs per attempt:** `itemKey`, `score`, `difficulty`, `careerTags`, `createdAtMs`.

| Sub-factor | Weight | How calculated |
| --- | --- | --- |
| Accuracy | 50% | Mean of best score per distinct `itemKey` |
| Difficulty | 25% | Mean difficulty milli of those best attempts |
| Consistency | 25% | Distinct active days in last **56** days / 56 |

Career-scoped. No attempts in scope → `missing`.

### 2. DSA and problem solving (`dsa`) — 20% published

**Sources:** Challenge / coding attempts (`coding` or `dsa`); roadmap coding assessments.

**Inputs per attempt:** `problemKey`, `passed`, `score`, `difficulty`, `careerTags`, `topics`, `durationMs`, `estMinutes`, `createdAtMs`.

| Sub-factor | Weight | How calculated |
| --- | --- | --- |
| Accuracy | 30% | Distinct problems with ≥1 pass / distinct problems attempted |
| Difficulty | 25% | Mean difficulty milli of **solved** problems (best attempt’s difficulty) |
| First-attempt (unseen) | 15% | Share of problems whose **first** attempt passed |
| Time vs estimate | 15% | Mean of `min(100%, estMs / durationMs)` when both exist; **missing duration → 0 for that part** |
| 28-day density | 10% | Distinct pass days in last **28** days / 28 |
| Spaced retest | 5% | Share of problems with two passes ≥ **7** days apart |

Career-scoped. No attempts in scope → `missing`.

### 3. Projects and engineering (`projects`) — 15% published

**Sources:** `project_runs` for the user.

**Inputs per run:** `score`, `checklistPct`, `hasRepo`, `hasReflection`, `estimatedHours`, `passed`.

| Sub-factor | Weight | How calculated |
| --- | --- | --- |
| Rubric | 50% | Run score (0–100 → milli) |
| Checklist | 20% | Checklist percent |
| Tests / docs | 15% | 100% if repo URL present, else 0 |
| Reflection | 10% | 100% if reflection present, else 0 |
| Complexity | 5% | From estimated hours: 0h → 40%; ≥20h → 100%; linear between |

Projects are mixed together; **passed** runs weigh **3×**, others **1×**.

Not career-tagged in v1 (all submitted project runs count). Empty → `missing`.

### 4. Interview readiness (`interview`) — 15% published

**Sources:** Interview reports joined to sessions.

**Inputs:** `targetRole`, `overall`, `communication`, `problemSolving`, `codeQuality`, `depth`, `integrityCount`, `endedAtMs`.

| Dimension | Weight |
| --- | --- |
| Overall | 40% |
| Communication | 15% |
| Problem solving | 15% |
| Code quality | 15% |
| Depth | 15% |

Then:

1. **Recency:** multiply by decay — lose **333 milli/day** from 100%, floor **50%**.
2. **Integrity:** if `integrityCount > 0` soft-cap at **80%**; if `≥ 3` hard-cap at **40%**.
3. Take the **best** role-matching interview after those adjustments.

Role-scoped. No matching interview → `missing`.

### 5. Roadmap skill mastery (`roadmap`) — 10% published

**Sources:** Active roadmap + progress + passed assessment scores on that roadmap.

**Inputs:** `targetRole`, `trackable`, `completed`, `prerequisitesMet`, `passedAssessmentScores[]`.

| Sub-factor | Weight | How calculated |
| --- | --- | --- |
| Completion | 50% | `completed / trackable` |
| Prerequisites | 20% | 100% if all trackable nodes satisfied; else half of completion |
| Assessments | 30% | Mean of passed assessment scores (0 if none) |

Requires a target role and an in-scope active roadmap. Otherwise `missing`.

### 6. Consistency / retention (`consistency`) — 10% published

**Sources:** Activity timestamps and scores from attempts/assessments/interviews/projects gathered into `ConsistencyFact`, plus profile streak.

**Inputs:** `streak`, `activityAtMs[]`, `rollingAccuracy[{ atMs, score }]`.

| Sub-factor | Weight | How calculated |
| --- | --- | --- |
| Active days | 40% | Distinct days with activity in last **56** days / 56 |
| Streak | 30% | `min(streak, 30) / 30` |
| Improvement | 30% | Split rolling accuracy in the window into two halves; base 50% ± half the milli delta (needs ≥4 samples); else 50% |

Empty activity and no streak → `missing`.

### 7. Resume / profile (`profile`) — 2% published

**Global checklist** (points sum to 100 → milli = points × 1000):

| Field | Points |
| --- | --- |
| Full name | 10 |
| Username | 10 |
| Bio | 10 |
| Institute | 10 |
| Degree | 10 |
| GitHub | 15 |
| LinkedIn | 10 |
| Skills (≥1) | 10 |
| Projects (≥1 on profile) | 10 |
| Additional profile completed | 5 |

Always status `ok` (score can still be 0).

### 8–10. Reserved (`opensource`, `hackathons`, `certifications`)

Not scored in `cri.v1`. Shown in “Why this CRI?” as `not_scored` so the full model is visible.

---

## When CRI recomputes

| Trigger | Typical event |
| --- | --- |
| `assessment` | Roadmap assessment submit |
| `challenge` | Challenge / problem attempt |
| `project` | Project run submit |
| `interview` | Interview report finalized |
| `profile` | Profile save (`PUT /api/me/profile`) |
| `career` | Target career change |
| `manual` | `GET /api/me/cri` when no snapshot or integer `cri` disagrees with millipoints |

Implementation: [`recomputeCri` / `recomputeCriSafe`](../src/lib/cri/persist.ts).

---

## Persistence and audit

| Table / column | Role |
| --- | --- |
| `profiles.cri_milli` | Canonical score (0–100_000) |
| `profiles.cri` | Integer percent for legacy UI |
| `profiles.cri_formula` | Formula id at last write (e.g. `cri.v1`) |
| `profiles.cri_snapshot_id` | Pointer to latest snapshot |
| `cri_snapshots` | `formulaId`, `targetRole`, `criMilli`, `components[]`, `trigger`, `computedAt` |
| `cri_evidence` | Per-row sources: `component`, `sourceType`, `sourceId`, `metric`, `valueMilli` |

Students open **Why this CRI?** → `GET /api/me/cri` (breakdown) and optionally `GET /api/me/cri/evidence?component=…` (evidence rows).

Display rule: **never** treat millipoints `0` as “missing” and fall back to legacy integer `cri`. Use `resolveCriMilli(criMilli, criFallback)` ([`milli.ts`](../src/lib/cri/milli.ts)).

---

## Student APIs (summary)

### `GET /api/me/cri`

Returns formula id, `criMilli`, formatted `cri`, `targetRole`, `computedAt`, `snapshotId`, `components[]`, disclaimer. Recomputes if snapshot missing or stale integer mismatch.

### `GET /api/me/cri/evidence?component=<id>`

Evidence rows for one component of the current (or latest) snapshot.

Both require an authenticated **student**.

---

## Worked example (shape only)

Suppose live weights (after renormalization) and component scores:

| Component | Live weight (milli) | Score (milli) | Contribution |
| --- | --- | --- | --- |
| knowledge | 17_241 | 80_000 | ≈ 13_793 |
| dsa | 22_988 | 50_000 | ≈ 11_494 |
| … | … | … | … |

`CRI_milli = sum(contributions)`; UI shows `formatCri(CRI_milli)` (e.g. `70.000`).

Exact weights live in `LIVE_WEIGHT_MILLI` — read from code or the API response, not from approximations in copy.

---

## Changing the formula

1. Bump `CRI_FORMULA_ID` (e.g. `cri.v2`).
2. Update weights / scorers in `formula.ts` + `compute.ts`.
3. Extend golden tests in `scripts/test-cri-calc.ts`.
4. Recompute affected users (migration or on next activity / Why-open).
5. Old snapshots keep their original `formulaId` for audit.

Do **not** silently change `cri.v1` in place.

---

## Code map

| File | Responsibility |
| --- | --- |
| [`formula.ts`](../src/lib/cri/formula.ts) | Formula id, weights, sub-weights, constants, labels |
| [`milli.ts`](../src/lib/cri/milli.ts) | Millipoint math, format, `resolveCriMilli` |
| [`types.ts`](../src/lib/cri/types.ts) | Fact shapes, computation result, triggers |
| [`scope.ts`](../src/lib/cri/scope.ts) | Career matching for evidence / interviews |
| [`gather.ts`](../src/lib/cri/gather.ts) | DB → `CriFacts` |
| [`compute.ts`](../src/lib/cri/compute.ts) | Pure scoring |
| [`persist.ts`](../src/lib/cri/persist.ts) | Snapshot write + profile update |
| [`index.ts`](../src/lib/cri/index.ts) | Public exports |

Migration: `npm run db:migrate:cri`. Tests: `npm run test:cri`.

---

## Related

- Short summary: [CRI.md](CRI.md)
- Platform boundaries: [PLATFORM.md](PLATFORM.md)
