import { and, eq, sql } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getChallengeById } from "@/lib/challenges/catalog";
import {
  gradeCodingSubmission,
  gradeMcqAnswers,
} from "@/lib/challenges/grading";
import { applyFail, applySolve, levelFromXp } from "@/lib/challenges/progress";
import {
  buildChallengesResponse,
  loadChallengeContext,
  persistChallengeEconomy,
  persistChallengeState,
} from "@/lib/challenges/service";
import { getDb } from "@/lib/db/client";
import {
  challengeAttempts,
  profiles,
  wallets,
  walletTransactions,
} from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { challengesAttemptSchema } from "@/lib/validation/schemas";
import type { CodingLanguageId } from "@/lib/roadmap/coding-languages";

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, challengesAttemptSchema);
    const question = getChallengeById(body.questionId);
    if (!question) throw AppError.notFound("Challenge question not found");

    const ctx = await loadChallengeContext(user.id);
    let state = ctx.state;
    const db = getDb();

    let score = 0;
    let passed = false;
    const payload: {
      answers?: Record<string, number>;
      code?: string;
      language?: string;
    } = {};

    if (question.type === "mcq") {
      if (!body.answers || Object.keys(body.answers).length === 0) {
        throw AppError.badRequest("MCQ answers required for scoring");
      }
      const graded = gradeMcqAnswers(question, body.answers);
      score = graded.score;
      passed = graded.passed;
      payload.answers = body.answers;
    } else if (question.type === "coding" || question.coding) {
      if (!body.code?.trim() || !body.language) {
        // Proctor fail / abandoned submit — record as failed attempt
        score = 0;
        passed = false;
        if (body.code) payload.code = body.code;
        if (body.language) payload.language = body.language;
      } else {
        const graded = await gradeCodingSubmission(
          question,
          body.code,
          body.language as CodingLanguageId,
        );
        score = graded.score;
        passed = graded.passed;
        payload.code = body.code;
        payload.language = body.language;
      }
    } else {
      throw AppError.badRequest(
        "This challenge type must be completed via coding or MCQ assessment",
      );
    }

    // Has this question ever awarded XP?
    const [priorAward] = await db
      .select({ id: challengeAttempts.id })
      .from(challengeAttempts)
      .where(
        and(
          eq(challengeAttempts.userId, user.id),
          eq(challengeAttempts.questionId, question.id),
          sql`${challengeAttempts.xpAwarded} > 0`,
        ),
      )
      .limit(1);

    const alreadySolved =
      Boolean(priorAward) || state.solvedIds.includes(question.id);
    let awarded = false;
    let xpAwarded = 0;
    let coinsAwarded = 0;

    if (passed) {
      if (!alreadySolved) {
        state = applySolve(
          state,
          question.id,
          question.xp,
          question.coins,
          score,
          { topics: question.topics, payload },
        );
        awarded = true;
        xpAwarded = question.xp;
        coinsAwarded = question.coins;
      } else {
        state = {
          ...state,
          unlockedSolutions: [
            ...new Set([...state.unlockedSolutions, question.id]),
          ],
          attempts: [
            ...state.attempts.filter((a) => a.questionId !== question.id),
            {
              questionId: question.id,
              status: "solved",
              score,
              at: new Date().toISOString(),
              payload,
            },
          ],
        };
      }
    } else {
      state = applyFail(state, question.id, question.topics, score, payload);
    }

    // Keep gamification.xp aligned with profile after sync below
    await persistChallengeState(user.id, state, ctx.progressExists);

    await db.insert(challengeAttempts).values({
      userId: user.id,
      questionId: question.id,
      challengeType: question.type,
      passed,
      score,
      xpAwarded,
      coinsAwarded,
      payload,
    });

    if (awarded) {
      const [updatedProfile] = await db
        .update(profiles)
        .set({
          xp: sql`${profiles.xp} + ${xpAwarded}`,
          streak: state.gamification.streak,
          streakShields: state.gamification.streakShields,
          lastSolveDateKey: state.gamification.lastSolveDateKey || null,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, user.id))
        .returning({ xp: profiles.xp });

      const profileXp = Number(updatedProfile?.xp) || state.gamification.xp;
      const profileLevel = levelFromXp(profileXp);

      await db
        .update(profiles)
        .set({ level: profileLevel, updatedAt: new Date() })
        .where(eq(profiles.userId, user.id));

      state = {
        ...state,
        gamification: {
          ...state.gamification,
          xp: profileXp,
          level: profileLevel,
        },
      };
      await persistChallengeState(user.id, state, true);
      await persistChallengeEconomy(user.id, state);

      const [updatedWallet] = await db
        .update(wallets)
        .set({
          coins: sql`${wallets.coins} + ${coinsAwarded}`,
          updatedAt: new Date(),
        })
        .where(eq(wallets.userId, user.id))
        .returning({ coins: wallets.coins });

      state = {
        ...state,
        gamification: {
          ...state.gamification,
          coins: Number(updatedWallet?.coins) || state.gamification.coins,
        },
      };
      await persistChallengeState(user.id, state, true);

      await db.insert(walletTransactions).values({
        userId: user.id,
        kind: "challenge_reward",
        amountCoins: coinsAwarded,
        meta: {
          questionId: question.id,
          xp: xpAwarded,
          score,
          level: profileLevel,
        },
      });
    } else {
      // Fail / re-pass still may update streak shields via applySolve path only when awarded;
      // persist attempt blob only. For fail, sync economy if streak shields changed (they don't).
      await persistChallengeEconomy(user.id, state);
    }

    return jsonResponse({
      ok: true,
      passed,
      score,
      awarded,
      xpAwarded,
      coinsAwarded,
      level: state.gamification.level,
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
