import { and, eq, gte, sql } from "drizzle-orm";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import {
  purchases,
  storeProducts,
  userSettings,
  walletTransactions,
  wallets,
} from "@/lib/db/schema";

export async function purchaseProduct(userId: string, productId: string) {
  const db = getDb();

  const productRows = await db
    .select()
    .from(storeProducts)
    .where(and(eq(storeProducts.id, productId), eq(storeProducts.isActive, true)))
    .limit(1);
  const product = productRows[0];
  if (!product) throw AppError.notFound("Product not found");

  const existing = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.productId, productId)))
    .limit(1);
  if (existing[0]) throw AppError.conflict("Already purchased");

  const deducted = await db
    .update(wallets)
    .set({
      coins: sql`${wallets.coins} - ${product.price}`,
      updatedAt: new Date(),
    })
    .where(and(eq(wallets.userId, userId), gte(wallets.coins, product.price)))
    .returning({ coins: wallets.coins });

  if (!deducted[0]) throw AppError.badRequest("Insufficient coins");

  try {
    await db.insert(purchases).values({
      userId,
      productId,
      pricePaid: product.price,
    });
  } catch {
    // Unique race or insert failure — refund coins
    await db
      .update(wallets)
      .set({
        coins: sql`${wallets.coins} + ${product.price}`,
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, userId));
    throw AppError.conflict("Already purchased");
  }

  await db.insert(walletTransactions).values({
    userId,
    kind: "purchase",
    amountCoins: -Number(product.price),
    meta: { productId, title: product.title },
  });

  if (
    String(product.category).includes("AI Marketplace") ||
    String(product.meta).includes("Plugin")
  ) {
    await db
      .update(userSettings)
      .set({ activePlugin: product.title, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId));
  }

  return { ok: true as const, coins: deducted[0].coins };
}
