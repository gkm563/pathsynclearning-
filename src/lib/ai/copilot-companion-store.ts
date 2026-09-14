import "server-only";
import { eq } from "drizzle-orm";
import {
  DEFAULT_COPILOT_NAME,
  isCopilotMemorySource,
  resolveCopilotName,
  sanitizeCopilotMemory,
  type CopilotMemorySource,
} from "@/lib/ai/copilot-identity";
import { getDb } from "@/lib/db/client";
import { userSettings } from "@/lib/db/schema";

export async function persistCopilotCompanion(
  userId: string,
  input: {
    name?: string | null;
    skipName?: boolean;
    memoryText?: string | null;
    memorySource?: CopilotMemorySource | null;
    clearMemory?: boolean;
  },
) {
  const db = getDb();
  const patch: {
    updatedAt: Date;
    copilotName?: string;
    copilotMemory?: string | null;
    copilotMemorySource?: string | null;
  } = { updatedAt: new Date() };

  if (input.skipName) {
    patch.copilotName = DEFAULT_COPILOT_NAME;
  } else if (input.name !== undefined) {
    patch.copilotName = resolveCopilotName(input.name);
  }

  if (input.clearMemory) {
    patch.copilotMemory = null;
    patch.copilotMemorySource = null;
  } else {
    if (input.memoryText !== undefined) {
      const memory = sanitizeCopilotMemory(input.memoryText);
      patch.copilotMemory = memory || null;
    }
    if (input.memorySource !== undefined) {
      patch.copilotMemorySource = isCopilotMemorySource(input.memorySource)
        ? input.memorySource
        : null;
    }
  }

  if (Object.keys(patch).length === 1) return;

  await db
    .insert(userSettings)
    .values({
      userId,
      copilotName: patch.copilotName,
      copilotMemory: patch.copilotMemory,
      copilotMemorySource: patch.copilotMemorySource,
    })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: patch,
    });
}
