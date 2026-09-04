import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { requireDbUser } from "@/lib/db/users";
import {
  exportJourney,
  getMemoryDetail,
  getMemoryTimeline,
  getMemorySettings,
  updateMemorySettings,
} from "@/lib/memory";
import {
  memoryLaneCreateSchema,
  memorySettingsUpdateSchema,
  memoryTimelineQuerySchema,
} from "@/lib/validation/schemas";
import { emitDomainEvent } from "@/lib/memory/processor";

export async function GET(request: Request) {
  try {
    const user = await requireDbUser();
    const url = new URL(request.url);
    const parsed = memoryTimelineQuerySchema.parse({
      filter: url.searchParams.get("filter") || "all",
      search: url.searchParams.get("search") || undefined,
      cursor: url.searchParams.get("cursor") || undefined,
      limit: url.searchParams.get("limit") || 30,
    });

    const id = url.searchParams.get("id");
    if (id) {
      const detail = await getMemoryDetail(user.id, id);
      if (!detail) {
        return jsonResponse({ error: "Memory not found", code: "NOT_FOUND" }, 404);
      }
      return jsonResponse({ memory: detail });
    }

    if (url.searchParams.get("export") === "1") {
      const journey = await exportJourney(user.id);
      return jsonResponse({ journey });
    }

    if (url.searchParams.get("settings") === "1") {
      const settings = await getMemorySettings(user.id);
      return jsonResponse({ settings });
    }

    const timeline = await getMemoryTimeline({
      userId: user.id,
      filter: parsed.filter,
      search: parsed.search,
      cursor: parsed.cursor,
      limit: parsed.limit,
    });

    return jsonResponse({
      items: timeline.items,
      nextCursor: timeline.nextCursor,
      stats: timeline.stats,
      /** Legacy shape for older clients */
      entries: timeline.items,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, memoryLaneCreateSchema);
    const payload = body.payload;

    // Accept legacy client posts and route through domain events when possible
    const title =
      (typeof payload.title === "string" && payload.title) || "Memory";
    const typeHint =
      typeof payload.type === "string" ? payload.type.toLowerCase() : "";

    let eventType = "ACHIEVEMENT_EARNED";
    let sourceType = "achievement";
    if (typeHint.includes("project")) {
      eventType = "PROJECT_COMPLETED";
      sourceType = "project";
    } else if (typeHint.includes("code") || typeHint.includes("mcq") || typeHint.includes("coding")) {
      eventType = "CHALLENGE_COMPLETED";
      sourceType = "challenge";
    }

    const sourceId =
      (typeof payload.id === "string" && payload.id) ||
      (typeof payload.questionId === "string" && payload.questionId) ||
      `legacy_${Date.now()}`;

    const event = await emitDomainEvent({
      userId: user.id,
      type: eventType,
      sourceType,
      sourceId,
      payload: {
        title,
        description:
          typeof payload.snippet === "string" ? payload.snippet : null,
        ...payload,
      },
    });

    return jsonResponse({
      ok: true,
      eventId: event.id,
      entry: {
        id: event.id,
        payload,
        created_at: event.createdAt,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, memorySettingsUpdateSchema);
    const settings = await updateMemorySettings(user.id, body);
    return jsonResponse({ settings });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}
