# Career Readiness Index (CRI)

PathED does not assign a career-readiness score. It **calculates** one from demonstrated, verifiable evidence.

CRI indicates **readiness for a target career**. It does not guarantee employability and is not a recommendation to hire.

> CRI measures demonstrated readiness for this career. It does not guarantee a job or tell a recruiter to hire.

Formula id: `cri.v1`. Changing a weight or sub-weight requires a new formula id. Old snapshots stay auditable.

## Units

- Internal unit is the **millipoint**: `100_000` milli = `100.000%`.
- Display: three decimals (`78.263`). Integer `profiles.cri` is `round(milli / 1000)` for older clients.
- Mixer uses integer arithmetic only (`round(numer / denom)`).

```
CRI_milli = Σ (liveWeightMilli_c × scoreMilli_c / 100_000)
```

## Published weights (full model)

| Component | Weight | v1 |
| --- | --- | --- |
| Technical / CS knowledge | 15% | Live |
| DSA and problem solving | 20% | Live |
| Projects and engineering | 15% | Live |
| Interview readiness | 15% | Live |
| Roadmap skill mastery | 10% | Live |
| Consistency / retention | 10% | Live |
| Resume / profile | 2% | Live |
| Open source | 5% | Reserved |
| Hackathons / competitions | 5% | Reserved |
| Certifications | 3% | Reserved |

v1 renormalizes the seven live weights to 100% (scale `100/87`). Reserved rows appear in the audit trail as `not_scored`.

Career-scoped components use the student’s current `targetRole`. Untagged evidence counts as general. Evidence tagged for another role does not count. Profile completeness is global. With no target role, career-scoped scores are 0.

If a sub-factor has no evidence it scores **0** and is labeled `missing`. No cohort averages or invented times.

## DSA sub-weights (of the DSA component)

30% accuracy (best pass per distinct problem) · 25% difficulty · 15% first-attempt (unseen) · 15% time vs estimate (missing duration → 0) · 10% 28-day solve density · 5% spaced retest.

## Audit

Each recompute writes `cri_snapshots` + `cri_evidence` (Evidence IDs). Students (and later recruiters) can open “Why this CRI?” and see every component contribution and source row.

XP and coins are **not** CRI inputs.
