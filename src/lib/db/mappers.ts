/**
 * Map Drizzle camelCase rows → snake_case API payloads (existing frontend contract).
 */
export function snakeKeys<T extends Record<string, unknown>>(
  row: T,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const snake = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
    out[snake] = value;
  }
  return out;
}

export function mapUser(row: {
  id: string;
  clerkId: string;
  email: string;
  role: string;
  fullName: string | null;
  imageUrl: string | null;
}) {
  return {
    id: row.id,
    clerk_id: row.clerkId,
    email: row.email,
    role: row.role,
    full_name: row.fullName,
    image_url: row.imageUrl,
  };
}

export function mapOnboarding(row: {
  userId: string;
  stage1: unknown;
  stage2: unknown;
  stage3: unknown;
  stage4: unknown;
  selectedCareer: string | null;
  currentStage: number;
  completed: boolean;
  updatedAt?: Date | null;
}) {
  return {
    user_id: row.userId,
    stage1: row.stage1,
    stage2: row.stage2,
    stage3: row.stage3,
    stage4: row.stage4,
    selected_career: row.selectedCareer,
    current_stage: row.currentStage,
    completed: row.completed,
    updated_at: row.updatedAt,
  };
}

export function mapSettings(row: {
  userId: string;
  theme: string;
  accentColor: string;
  plan: string;
  activePlugin: string | null;
  updatedAt?: Date | null;
}) {
  return {
    user_id: row.userId,
    theme: row.theme,
    accent_color: row.accentColor,
    plan: row.plan,
    active_plugin: row.activePlugin,
    updated_at: row.updatedAt,
  };
}

export function mapWallet(row: {
  userId: string;
  coins: number;
  cashBalance: string;
  updatedAt?: Date | null;
}) {
  return {
    user_id: row.userId,
    coins: row.coins,
    cash_balance: row.cashBalance,
    updated_at: row.updatedAt,
  };
}

export function mapWalletTx(row: {
  id: string;
  userId: string;
  kind: string;
  amountCoins: number;
  amountCash: string;
  meta: unknown;
  createdAt: Date;
}) {
  return {
    id: row.id,
    user_id: row.userId,
    kind: row.kind,
    amount_coins: row.amountCoins,
    amount_cash: row.amountCash,
    meta: row.meta,
    created_at: row.createdAt,
  };
}

export function mapProfile(
  profile: Record<string, unknown>,
  extras?: Record<string, unknown>,
) {
  return { ...snakeKeys(profile), ...(extras || {}) };
}
