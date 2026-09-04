import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { requireDbUser } from "@/lib/db/users";
import {
  createNote,
  getNoteById,
  getNotes,
  searchNotes,
} from "@/lib/memory/notes";
import { noteCreateSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  try {
    const user = await requireDbUser();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) {
      const note = await getNoteById(user.id, id);
      return jsonResponse({ note });
    }

    const search = url.searchParams.get("search");
    if (search?.trim()) {
      const rows = await searchNotes(user.id, search);
      return jsonResponse({ notes: rows });
    }

    const notes = await getNotes(user.id, {
      sourceType: url.searchParams.get("sourceType") || undefined,
      sourceId: url.searchParams.get("sourceId") || undefined,
      limit: Number(url.searchParams.get("limit") || 50),
    });
    return jsonResponse({ notes });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, noteCreateSchema);
    const note = await createNote({
      userId: user.id,
      title: body.title,
      content: body.content,
      visibility: body.visibility,
      sourceType: body.sourceType,
      sourceId: body.sourceId,
      links: body.links,
    });
    return jsonResponse({ note }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
