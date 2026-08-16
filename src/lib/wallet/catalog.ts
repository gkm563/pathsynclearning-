/** Server-authoritative coin packs and cash-out tiers (simulated economy). */

export const COIN_PACKS = [
  {
    id: "pack_starter",
    name: "SDE Starter Refill",
    coins: 500,
    cost: 4.99,
  },
  {
    id: "pack_pro",
    name: "Pro Developer Bundle",
    coins: 1500,
    cost: 12.99,
  },
  {
    id: "pack_elite",
    name: "Elite Builder Pack",
    coins: 3500,
    cost: 24.99,
  },
  {
    id: "pack_mega",
    name: "Mega Vault Refill",
    coins: 8000,
    cost: 49.99,
  },
] as const;

export const CASH_OUT_TIERS = [
  { id: "out_1000", coins: 1000, value: 5 },
  { id: "out_2000", coins: 2000, value: 10 },
  { id: "out_5000", coins: 5000, value: 25 },
] as const;

/** Store page legacy packs keyed by coin amount (no pack id on UI). */
export const LEGACY_AMOUNT_PACKS: ReadonlyArray<{ coins: number; cost: number }> = [
  { coins: 500, cost: 4.99 },
  { coins: 1200, cost: 9.99 },
  { coins: 2500, cost: 19.99 },
  { coins: 6000, cost: 39.99 },
];

export const LEGACY_CASH_OUTS: ReadonlyArray<{ coins: number; value: number }> = [
  { coins: 1000, value: 5 },
  { coins: 2000, value: 10 },
  { coins: 5000, value: 25 },
];

export function findCoinPack(packId: string) {
  return COIN_PACKS.find((p) => p.id === packId) ?? null;
}

export function findCashOut(exchangeId: string) {
  return CASH_OUT_TIERS.find((t) => t.id === exchangeId) ?? null;
}

export function findLegacyPack(coins: number, cost: number) {
  return (
    LEGACY_AMOUNT_PACKS.find(
      (p) => p.coins === coins && Math.abs(p.cost - cost) < 0.001,
    ) ?? null
  );
}

export function findLegacyCashOut(coins: number, cashValue: number) {
  return (
    LEGACY_CASH_OUTS.find(
      (t) => t.coins === coins && Math.abs(t.value - cashValue) < 0.001,
    ) ?? null
  );
}
