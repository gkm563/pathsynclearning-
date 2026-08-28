import { eq, sql } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getChallengeById } from "@/lib/challenges/catalog";
import {
  buyStreakShield,
  HINT_COST,
  levelFromXp,
  SHIELD_COST,
  unlockHint,
} from "@/lib/challenges/progress";
import {
  buildChallengesResponse,
  loadChallengeContext,
  persistChallengeEconomy,
  persistChallengeState,
} from "@/lib/challenges/service";
import { getDb } from "@/lib/db/client";
import { profiles, wallets, walletTransactions } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { challengesActionSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, challengesActionSchema);
    const ctx = await loadChallengeContext(user.id);
    let state = ctx.state;
    let walletDelta = 0;
    let kind = "challenge_action";
    let economyChanged = false;

    if (body.action === "buy_shield") {
      if (state.gamification.coins < SHIELD_COST) {
        throw AppError.badRequest(`Need ${SHIELD_COST} coins for a streak shield`);
      }
      const next = buyStreakShield(state);
      if ("error" in next) throw AppError.badRequest(next.error);
      state = next;
      walletDelta = -SHIELD_COST;
      kind = "streak_shield";
      economyChanged = true;
    } else if (body.action === "unlock_hint") {
      if (!body.questionId) throw AppError.badRequest("questionId required");
      const q = getChallengeById(body.questionId);
      if (!q) throw AppError.notFound("Question not found");
      if (state.gamification.coins < HINT_COST) {
        throw AppError.badRequest(`Need ${HINT_COST} coins for a hint`);
      }
      const next = unlockHint(state, body.questionId, q.hints.length);
      if ("error" in next) throw AppError.badRequest(next.error);
      state = next;
      walletDelta = -HINT_COST;
      kind = "hint_unlock";
      economyChanged = true;
    } else if (body.action === "arena_complete") {
      const score = Math.max(0, Math.min(100, Number(body.score) || 0));
      const xpGain = Math.floor(score / 5);
      const coinGain = Math.floor(score / 10);
      const nextXp = state.gamification.xp + xpGain;
      state = {
        ...state,
        arenaBestScore: Math.max(state.arenaBestScore, score),
        lastArenaAt: new Date().toISOString(),
        gamification: {
          ...state.gamification,
          xp: nextXp,
          level: levelFromXp(nextXp),
          coins: state.gamification.coins + coinGain,
        },
      };
      walletDelta = coinGain;
      kind = "arena_reward";
      economyChanged = true;
    } else if (body.action === "refresh_duel") {
      state = {
        ...state,
        duelCode: `duel_${user.id.slice(0, 6)}_${Date.now().toString(36)}`,
      };
    } else {
      throw AppError.badRequest("Unknown action");
    }

    await persistChallengeState(user.id, state, ctx.progressExists);

    const db = getDb();
    if (walletDelta !== 0) {
      if (walletDelta < 0) {
        const updated = await db
          .update(wallets)
          .set({
            coins: sql`${wallets.coins} + ${walletDelta}`,
            updatedAt: new Date(),
          })
          .where(eq(wallets.userId, user.id))
          .returning({ coins: wallets.coins });
        if (!updated[0] || updated[0].coins < 0) {
          // rollback wallet floor
          await db
            .update(wallets)
            .set({ coins: 0, updatedAt: new Date() })
            .where(eq(wallets.userId, user.id));
          throw AppError.badRequest("Not enough coins");
        }
        state = {
          ...state,
          gamification: {
            ...state.gamification,
            coins: updated[0].coins,
          },
        };
      } else {
        const [updated] = await db
          .update(wallets)
          .set({
            coins: sql`${wallets.coins} + ${walletDelta}`,
            updatedAt: new Date(),
          })
          .where(eq(wallets.userId, user.id))
          .returning({ coins: wallets.coins });
        state = {
          ...state,
          gamification: {
            ...state.gamification,
            coins: Number(updated?.coins) || state.gamification.coins,
          },
        };
      }
      await db.insert(walletTransactions).values({
        userId: user.id,
        kind,
        amountCoins: walletDelta,
        meta: body as Record<string, unknown>,
      });
    }

    if (economyChanged) {
      await persistChallengeEconomy(user.id, state);
      // Keep JSON mirror in sync with wallet coins after purchase
      await persistChallengeState(user.id, state, true);
    }

    // Arena XP also hits profiles
    if (body.action === "arena_complete" && walletDelta >= 0) {
      await db
        .update(profiles)
        .set({
          xp: state.gamification.xp,
          level: state.gamification.level,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, user.id));
    }

    return jsonResponse({
      ok: true,
      ...buildChallengesResponse({
        state,
        careerGoal: ctx.careerGoal,
        roadmapTopics: ctx.roadmapTopics,
        unfinishedNodes: ctx.unfinishedNodes,
        userId: user.id,
      }),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
