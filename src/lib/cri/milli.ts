/** 1.000 percentage points = 1000 milli. Full CRI is 100.000% = 100_000 milli. */
export const CRI_FULL_MILLI = 100_000;

/** Integer half-up: round(numer / denom) with no floating mixers. */
export function mulDivRound(numer: number, denom: number): number {
  if (denom <= 0) return 0;
  const n = Math.trunc(numer);
  const d = Math.trunc(denom);
  if (n >= 0) return Math.trunc((n + Math.trunc(d / 2)) / d);
  return -Math.trunc((-n + Math.trunc(d / 2)) / d);
}

export function clampMilli(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const n = Math.trunc(value);
  if (n <= 0) return 0;
  if (n >= CRI_FULL_MILLI) return CRI_FULL_MILLI;
  return n;
}

export function pctToMilli(pct: number): number {
  if (!Number.isFinite(pct) || pct <= 0) return 0;
  if (pct >= 100) return CRI_FULL_MILLI;
  return clampMilli(mulDivRound(Math.round(pct * 1000), 1));
}

/** Mix parts whose weights are integer percents of a 100-point bucket. */
export function mixWeightedMilli(
  parts: ReadonlyArray<{ weightPct: number; scoreMilli: number }>,
): number {
  let wsum = 0;
  let acc = 0;
  for (const part of parts) {
    const w = Math.max(0, Math.trunc(part.weightPct));
    wsum += w;
    acc += w * clampMilli(part.scoreMilli);
  }
  if (wsum <= 0) return 0;
  return clampMilli(mulDivRound(acc, wsum));
}

export function formatCri(milli: number): string {
  const n = clampMilli(milli);
  const whole = Math.trunc(n / 1000);
  const frac = n % 1000;
  return `${whole}.${String(frac).padStart(3, "0")}`;
}

export function criInteger(milli: number): number {
  return mulDivRound(clampMilli(milli), 1000);
}

/**
 * Millipoints are allowed to be 0. Do not treat 0 as “missing” and fall back
 * to the legacy integer CRI (that is what made the gauge show 70 and Why show 0).
 */
export function resolveCriMilli(criMilli: unknown, criFallback?: unknown): number {
  if (criMilli != null && criMilli !== "") {
    const n = Number(criMilli);
    if (Number.isFinite(n)) return clampMilli(n);
  }
  const cri = Number(criFallback);
  if (Number.isFinite(cri) && cri > 0) {
    return clampMilli(Math.round(cri * 1000));
  }
  return 0;
}
