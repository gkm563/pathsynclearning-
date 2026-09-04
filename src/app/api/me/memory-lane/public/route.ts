import { errorResponse, jsonResponse } from "@/lib/api/http";
import { getPublicMemories } from "@/lib/memory/timeline";
import { getPublicNotes } from "@/lib/memory/notes";
import { requireDbUser } from "@/lib/db/users";

/**
 * Explicit public Memory Lane projection for future recruiter profiles.
 * Only returns visibility === "public" content. Never returns private notes.
 */
export async function GET() {
  try {
    const user = await requireDbUser();
    const [memories, notes] = await Promise.all([
      getPublicMemories(user.id),
      getPublicNotes(user.id),
    ]);

    return jsonResponse({
      memories: memories.filter((m) => m.visibility === "public"),
      notes: notes.filter((n) => n.visibility === "public"),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
