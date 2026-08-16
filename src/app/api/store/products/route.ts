import { and, asc, eq } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { purchases, storeProducts, userSettings } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { storePurchaseSchema } from "@/lib/validation/schemas";
import { purchaseProduct } from "@/lib/wallet/purchase";

export async function GET() {
  try {
    const db = getDb();
    let purchasedIds: string[] = [];
    let activePlugin: string | null = null;

    try {
      const user = await requireDbUser();
      const purchaseRows = await db
        .select({ productId: purchases.productId })
        .from(purchases)
        .where(eq(purchases.userId, user.id));
      purchasedIds = purchaseRows.map((p) => p.productId);

      const settings = await db
        .select({ activePlugin: userSettings.activePlugin })
        .from(userSettings)
        .where(eq(userSettings.userId, user.id))
        .limit(1);
      activePlugin = settings[0]?.activePlugin || null;
    } catch {
      // Catalog is readable when middleware allows; purchased state needs auth.
    }

    const products = await db
      .select({
        id: storeProducts.id,
        title: storeProducts.title,
        category: storeProducts.category,
        price: storeProducts.price,
        icon: storeProducts.icon,
        imageUrl: storeProducts.imageUrl,
        description: storeProducts.description,
        meta: storeProducts.meta,
        color: storeProducts.color,
        included: storeProducts.included,
        sortOrder: storeProducts.sortOrder,
      })
      .from(storeProducts)
      .where(eq(storeProducts.isActive, true))
      .orderBy(asc(storeProducts.sortOrder), asc(storeProducts.title));

    return jsonResponse({
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price,
        icon: p.icon,
        image: p.imageUrl,
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
    const { productId } = await parseJson(request, storePurchaseSchema);
    const result = await purchaseProduct(user.id, productId);
    return jsonResponse(result);
  } catch (e) {
    return errorResponse(e);
  }
}
