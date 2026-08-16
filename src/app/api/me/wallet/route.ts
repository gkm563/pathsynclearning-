import { getDb } from "@/lib/db/client";
import { requireDbUser, jsonResponse, errorResponse } from "@/lib/db/users";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const wallet = await db`SELECT * FROM wallets WHERE user_id = ${user.id}::uuid LIMIT 1`;
    const tx = await db`
      SELECT * FROM wallet_transactions
      WHERE user_id = ${user.id}::uuid
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return jsonResponse({
      wallet: wallet[0],
      transactions: tx,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await request.json();
    const db = getDb();

    if (typeof body.coins === "number" || typeof body.cashBalance === "number") {
      await db`
        UPDATE wallets SET
          coins = COALESCE(${body.coins ?? null}, coins),
          cash_balance = COALESCE(${body.cashBalance ?? null}, cash_balance),
          updated_at = NOW()
        WHERE user_id = ${user.id}::uuid
      `;
    }

    if (body.transaction) {
      const t = body.transaction;
      await db`
        INSERT INTO wallet_transactions (user_id, kind, amount_coins, amount_cash, meta)
        VALUES (
          ${user.id}::uuid,
          ${t.kind || "adjustment"},
          ${t.amountCoins || 0},
          ${t.amountCash || 0},
          ${JSON.stringify(t.meta || {})}::jsonb
        )
      `;
    }

    const wallet = await db`SELECT * FROM wallets WHERE user_id = ${user.id}::uuid LIMIT 1`;
    const tx = await db`
      SELECT * FROM wallet_transactions
      WHERE user_id = ${user.id}::uuid
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return jsonResponse({ wallet: wallet[0], transactions: tx });
  } catch (e) {
    return errorResponse(e);
  }
}
