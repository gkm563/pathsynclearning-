import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { requireDbUser } from "@/lib/db/users";
import { walletActionSchema } from "@/lib/validation/schemas";
import { applyWalletAction, getWalletSnapshot } from "@/lib/wallet/service";

export async function GET() {
  try {
    const user = await requireDbUser();
    const snapshot = await getWalletSnapshot(user.id);
    return jsonResponse(snapshot);
  } catch (e) {
    return errorResponse(e);
  }
}

/**
 * Server-authoritative wallet mutations.
 * Clients send an action; balances are never trusted from the client.
 */
export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const action = await parseJson(request, walletActionSchema);
    const snapshot = await applyWalletAction(user.id, action);
    return jsonResponse(snapshot);
  } catch (e) {
    return errorResponse(e);
  }
}

/** @deprecated Absolute balance writes removed — use POST with an action. */
export async function PUT() {
  return jsonResponse(
    {
      error:
        "Wallet PUT is disabled. Use POST /api/me/wallet with a typed action.",
      code: "GONE",
    },
    410,
  );
}
