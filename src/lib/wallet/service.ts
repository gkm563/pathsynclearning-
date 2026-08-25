import { and, desc, eq, gte, sql } from "drizzle-orm";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import { mapWallet, mapWalletTx } from "@/lib/db/mappers";
import { walletTransactions, wallets } from "@/lib/db/schema";
import {
  findCashOut,
  findCoinPack,
  findLegacyCashOut,
  findLegacyPack,
} from "@/lib/wallet/catalog";
import type { z } from "zod";
import type { walletActionSchema } from "@/lib/validation/schemas";

type WalletAction = z.infer<typeof walletActionSchema>;

async function getWalletOrThrow(userId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);
  if (!rows[0]) throw AppError.notFound("Wallet not found");
  return rows[0];
}

export async function getWalletSnapshot(userId: string) {
  const db = getDb();
  const wallet = await getWalletOrThrow(userId);
  const tx = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(50);

  return {
    wallet: mapWallet(wallet),
    transactions: tx.map(mapWalletTx),
  };
}

export async function applyWalletAction(userId: string, action: WalletAction) {
  const db = getDb();
  const wallet = await getWalletOrThrow(userId);
  const coins = Number(wallet.coins);
  const cash = Number(wallet.cashBalance);

  if (action.action === "deposit") {
    const nextCash = cash + action.amountCash;
    await db
      .update(wallets)
      .set({
        cashBalance: String(nextCash),
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, userId));

    await db.insert(walletTransactions).values({
      userId,
      kind: "deposit",
      amountCash: String(action.amountCash),
      meta: { details: "Simulated Card Transaction", title: "Deposited Funds" },
    });

    return getWalletSnapshot(userId);
  }

  if (action.action === "buy_coins") {
    const pack = findCoinPack(action.packId);
    if (!pack) throw AppError.badRequest("Unknown coin pack");
    if (cash < pack.cost) throw AppError.badRequest("Insufficient cash balance");

    const updated = await db
      .update(wallets)
      .set({
        coins: sql`${wallets.coins} + ${pack.coins}`,
        cashBalance: sql`${wallets.cashBalance} - ${pack.cost}`,
        updatedAt: new Date(),
      })
      .where(
        and(eq(wallets.userId, userId), gte(wallets.cashBalance, String(pack.cost))),
      )
      .returning();

    if (!updated[0]) throw AppError.badRequest("Insufficient cash balance");

    await db.insert(walletTransactions).values({
      userId,
      kind: "coin_buy",
      amountCoins: pack.coins,
      amountCash: String(-pack.cost),
      meta: {
        pack: pack.name,
        packId: pack.id,
        details: `Exchanged Cash to Coins (${pack.name})`,
      },
    });

    return getWalletSnapshot(userId);
  }

  if (action.action === "cash_out") {
    const tier = findCashOut(action.exchangeId);
    if (!tier) throw AppError.badRequest("Unknown cash-out tier");
    if (coins < tier.coins) throw AppError.badRequest("Insufficient coins");

    const updated = await db
      .update(wallets)
      .set({
        coins: sql`${wallets.coins} - ${tier.coins}`,
        cashBalance: sql`${wallets.cashBalance} + ${tier.value}`,
        updatedAt: new Date(),
      })
      .where(and(eq(wallets.userId, userId), gte(wallets.coins, tier.coins)))
      .returning();

    if (!updated[0]) throw AppError.badRequest("Insufficient coins");

    await db.insert(walletTransactions).values({
      userId,
      kind: "cashout",
      amountCoins: -tier.coins,
      amountCash: String(tier.value),
      meta: {
        exchangeId: tier.id,
        details: `Converted ${tier.coins.toLocaleString()} Coins`,
      },
    });

    return getWalletSnapshot(userId);
  }

  if (action.action === "buy_coins_amount") {
    const pack = findLegacyPack(action.coins, action.cost);
    if (!pack) throw AppError.badRequest("Invalid coin pack pricing");
    if (cash < pack.cost) throw AppError.badRequest("Insufficient cash balance");

    const updated = await db
      .update(wallets)
      .set({
        coins: sql`${wallets.coins} + ${pack.coins}`,
        cashBalance: sql`${wallets.cashBalance} - ${pack.cost}`,
        updatedAt: new Date(),
      })
      .where(
        and(eq(wallets.userId, userId), gte(wallets.cashBalance, String(pack.cost))),
      )
      .returning();

    if (!updated[0]) throw AppError.badRequest("Insufficient cash balance");

    await db.insert(walletTransactions).values({
      userId,
      kind: "coin_pack",
      amountCoins: pack.coins,
      amountCash: String(-pack.cost),
      meta: { pack: pack.coins },
    });

    return getWalletSnapshot(userId);
  }

  // cash_out_amount
  const tier = findLegacyCashOut(action.coins, action.cashValue);
  if (!tier) throw AppError.badRequest("Invalid cash-out pricing");
  if (coins < tier.coins) throw AppError.badRequest("Insufficient coins");

  const updated = await db
    .update(wallets)
    .set({
      coins: sql`${wallets.coins} - ${tier.coins}`,
      cashBalance: sql`${wallets.cashBalance} + ${tier.value}`,
      updatedAt: new Date(),
    })
    .where(and(eq(wallets.userId, userId), gte(wallets.coins, tier.coins)))
    .returning();

  if (!updated[0]) throw AppError.badRequest("Insufficient coins");

  await db.insert(walletTransactions).values({
    userId,
    kind: "cash_out",
    amountCoins: -tier.coins,
    amountCash: String(tier.value),
  });

  return getWalletSnapshot(userId);
}
