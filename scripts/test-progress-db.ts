/**
 * Smoke-test progress payload against Neon for an existing user.
 * Run: npx tsx scripts/test-progress-db.ts
 */
import { config } from "dotenv";
import { getProgressPayload } from "../src/lib/progress/service";
import { getDb } from "../src/lib/db/client";
import { users } from "../src/lib/db/schema";

config({ path: ".env.local" });

async function main() {
  const db = getDb();
  const [user] = await db.select({ id: users.id, email: users.email }).from(users).limit(1);
  if (!user) {
    console.log("No users — skipping.");
    process.exit(0);
  }

  console.log("User", user.email || user.id);
  for (const range of ["week", "month", "all"] as const) {
    const payload = await getProgressPayload(user.id, range);
    console.log(`\n[${range}]`, {
      completion: payload.summary.completion,
      tasks: `${payload.summary.completedTasks}/${payload.summary.totalTasks}`,
      stats: {
        completed: payload.summary.completed,
        inProgress: payload.summary.inProgress,
        pending: payload.summary.pending,
        averageScore: payload.summary.averageScore,
        status: payload.summary.status,
      },
      assessments: payload.assessments.length,
      performancePoints: payload.performance.length,
      activity: payload.activity.length,
      milestonesAchieved: payload.milestones.filter((m) => m.achieved).length,
      nextAction: payload.nextAction.kind,
    });
  }
  console.log("\nProgress DB smoke test OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
