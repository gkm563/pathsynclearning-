import { and, eq, sql } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getChallengeById } from "@/lib/challenges/catalog";
import { applySolve, applyFail, levelFromXp } from "@/lib/challenges/progress";
import {
  buildChallengesResponse,
  loadChallengeContext,
  persistChallengeEconomy,
  persistChallengeState,
} from "@/lib/challenges/service";
import { gradeProject } from "@/lib/projects/grader";
import {
  getOrCreateProjectRun,
  saveProjectProgress,
} from "@/lib/projects/service";
import { getDb } from "@/lib/db/client";
import {
  challengeAttempts,
  projectRuns,
  profiles,
  wallets,
  walletTransactions,
} from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { recordProjectMemory } from "@/lib/memory/processor";
import { challengesProjectSubmitSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, challengesProjectSubmitSchema);
    const question = getChallengeById(body.questionId);
    if (!question?.project) throw AppError.notFound("Project challenge not found");

    const ctx = await loadChallengeContext(user.id);
    let state = ctx.state;
    const db = getDb();

    const run = await getOrCreateProjectRun({
      userId: user.id,
      source: "challenge",
      refId: body.questionId,
    });

    await saveProjectProgress({
      runId: run.id,
      stepsDone: body.stepsDone,
      evidence: body.evidence,
      repoUrl: body.repoUrl,
      reflection: body.reflection,
    });

    const graded = await gradeProject(question.project, {
      stepsDone: body.stepsDone,
      evidence: body.evidence || [],
      repoUrl: body.repoUrl,
      reflection: body.reflection,
    });

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
    let xpAwarded = 0;
    let coinsAwarded = 0;

    const payload = {
      stepsDone: body.stepsDone,
      evidence: body.evidence,
      repoUrl: body.repoUrl,
      reflection: body.reflection,
      breakdown: graded.breakdown,
    };

    if (graded.passed) {
      if (!alreadySolved) {
        state = applySolve(
          state,
          question.id,
          question.xp,
          question.coins,
          graded.score,
          { topics: question.topics, payload },
        );
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
              score: graded.score,
              at: new Date().toISOString(),
              payload,
            },
          ],
        };
      }
    } else {
      state = applyFail(
        state,
        question.id,
        question.topics,
        graded.score,
        payload,
      );
    }

    await persistChallengeState(user.id, state, ctx.progressExists);

    await db.insert(challengeAttempts).values({
      userId: user.id,
      questionId: question.id,
      challengeType: "project",
      passed: graded.passed,
      score: graded.score,
      xpAwarded,
      coinsAwarded,
      payload,
    });

    const now = new Date();
    await db
      .update(projectRuns)
      .set({
        status: graded.passed ? "passed" : "failed",
        score: graded.score,
        checklistPct: graded.checklistPct,
        rubricBreakdown: graded.breakdown,
        xpAwarded,
        coinsAwarded,
        repoUrl: body.repoUrl || null,
        reflection: body.reflection || null,
        submittedAt: now,
        passedAt: graded.passed ? now : null,
        updatedAt: now,
      })
      .where(eq(projectRuns.id, run.id));

    if (xpAwarded > 0) {
      const [updatedProfile] = await db
        .update(profiles)
        .set({
          xp: sql`${profiles.xp} + ${xpAwarded}`,
          streak: state.gamification.streak,
          streakShields: state.gamification.streakShields,
          lastSolveDateKey: state.gamification.lastSolveDateKey || null,
          updatedAt: now,
        })
        .where(eq(profiles.userId, user.id))
        .returning({ xp: profiles.xp });

      const profileXp = Number(updatedProfile?.xp) || state.gamification.xp;
      const profileLevel = levelFromXp(profileXp);
      await db
        .update(profiles)
        .set({ level: profileLevel, updatedAt: now })
        .where(eq(profiles.userId, user.id));

      state = {
        ...state,
        gamification: {
          ...state.gamification,
          xp: profileXp,
          level: profileLevel,
        },
      };
      await persistChallengeEconomy(user.id, state);
      await persistChallengeState(user.id, state, true);

      const [wallet] = await db
        .update(wallets)
        .set({
          coins: sql`${wallets.coins} + ${coinsAwarded}`,
          updatedAt: now,
        })
        .where(eq(wallets.userId, user.id))
        .returning({ coins: wallets.coins });

      state = {
        ...state,
        gamification: {
          ...state.gamification,
          coins: Number(wallet?.coins) || state.gamification.coins,
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
          score: graded.score,
          type: "project",
        },
      });
    } else {
      await persistChallengeEconomy(user.id, state);
    }

    if (graded.passed) {
      await recordProjectMemory({
        userId: user.id,
        projectId: question.id,
        title: question.title,
        description: question.description?.slice(0, 280),
        score: graded.score,
        repoUrl: body.repoUrl,
        skills: question.topics,
        checklistPct: graded.checklistPct,
      }).catch(() => null);
    }

    return jsonResponse({
      ok: true,
      passed: graded.passed,
      score: graded.score,
      checklistPct: graded.checklistPct,
      breakdown: graded.breakdown,
      awarded: xpAwarded > 0,
      xpAwarded,
      coinsAwarded,
      solution: graded.passed ? question.solution : null,
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
