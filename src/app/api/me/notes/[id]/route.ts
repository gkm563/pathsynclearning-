import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { requireDbUser } from "@/lib/db/users";
import {
  deleteNote,
  getNoteById,
  linkNoteToEntity,
  updateNote,
} from "@/lib/memory/notes";
import { noteUpdateSchema } from "@/lib/validation/schemas";
import { z } from "zod";

const linkSchema = z
  .object({
    entityType: z.string().trim().min(1).max(64),
    entityId: z.string().trim().min(1).max(200),
  })
  .strict();

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const user = await requireDbUser();
    const { id } = await ctx.params;
    const note = await getNoteById(user.id, id);
    return jsonResponse({ note });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await requireDbUser();
    const { id } = await ctx.params;
    const url = new URL(request.url);

    if (url.searchParams.get("link") === "1") {
      const body = await parseJson(request, linkSchema);
      const note = await linkNoteToEntity(
        user.id,
        id,
        body.entityType,
        body.entityId,
      );
      return jsonResponse({ note });
    }

    const body = await parseJson(request, noteUpdateSchema);
    const note = await updateNote(user.id, id, body);
    return jsonResponse({ note });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    const user = await requireDbUser();
    const { id } = await ctx.params;
    const deleted = await deleteNote(user.id, id);
    if (!deleted) throw AppError.notFound("Note not found");
    return jsonResponse({ ok: true, id: deleted.id });
  } catch (e) {
    return errorResponse(e);
  }
}
