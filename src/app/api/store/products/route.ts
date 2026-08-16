import { getDb } from "@/lib/db/client";
import { requireDbUser, jsonResponse, errorResponse } from "@/lib/db/users";

export async function GET() {
  try {
    const db = getDb();
    // Public catalog — still require auth for purchase context
    let purchasedIds: string[] = [];
    let activePlugin: string | null = null;
    try {
      const user = await requireDbUser();
      const purchases = await db`
        SELECT product_id FROM purchases WHERE user_id = ${user.id}::uuid
      `;
      purchasedIds = purchases.map((p) => p.product_id as string);
      const settings = await db`
        SELECT active_plugin FROM user_settings WHERE user_id = ${user.id}::uuid LIMIT 1
      `;
      activePlugin = (settings[0]?.active_plugin as string) || null;
    } catch {
      // unauthenticated catalog browse
    }

    const products = await db`
      SELECT id, title, category, price, icon, image_url, description, meta, color, included, sort_order
      FROM store_products
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, title ASC
    `;

    return jsonResponse({
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price,
        icon: p.icon,
        image: p.image_url,
        desc: p.description,
        meta: p.meta,
        col: p.color,
        included: p.included,
      })),
      purchasedIds,
      activePlugin,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await request.json();
    const productId = body.productId as string;
    if (!productId) {
      return jsonResponse({ error: "productId required" }, 400);
    }

    const db = getDb();
    const productRows = await db`
      SELECT * FROM store_products WHERE id = ${productId} AND is_active = TRUE LIMIT 1
    `;
    const product = productRows[0];
    if (!product) {
      return jsonResponse({ error: "Product not found" }, 404);
    }

    const walletRows = await db`SELECT * FROM wallets WHERE user_id = ${user.id}::uuid LIMIT 1`;
    const wallet = walletRows[0];
    if (!wallet || Number(wallet.coins) < Number(product.price)) {
      return jsonResponse({ error: "Insufficient coins" }, 400);
    }

    await db`
      INSERT INTO purchases (user_id, product_id, price_paid)
      VALUES (${user.id}::uuid, ${productId}, ${product.price})
      ON CONFLICT (user_id, product_id) DO NOTHING
    `;
    await db`
      UPDATE wallets SET coins = coins - ${product.price}, updated_at = NOW()
      WHERE user_id = ${user.id}::uuid
    `;
    await db`
      INSERT INTO wallet_transactions (user_id, kind, amount_coins, meta)
      VALUES (
        ${user.id}::uuid,
        'purchase',
        ${-Number(product.price)},
        ${JSON.stringify({ productId, title: product.title })}::jsonb
      )
    `;

    if (String(product.category).includes("AI Marketplace") || String(product.meta).includes("Plugin")) {
      await db`
        UPDATE user_settings SET active_plugin = ${product.title}, updated_at = NOW()
        WHERE user_id = ${user.id}::uuid
      `;
    }

    const updated = await db`SELECT coins FROM wallets WHERE user_id = ${user.id}::uuid LIMIT 1`;
    return jsonResponse({ ok: true, coins: updated[0]?.coins });
  } catch (e) {
    return errorResponse(e);
  }
}
