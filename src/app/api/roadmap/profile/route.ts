import { NextResponse } from 'next/server';
import { requireDbUser } from '@/lib/db/users';
import { getDb } from '@/lib/db/client';
import { roadmapProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, jsonResponse, parseJson } from '@/lib/api/http';
import { roadmapProfileUpdateSchema } from '@/lib/validation/roadmap-schemas';
import { AppError } from '@/lib/api/errors';

export async function GET(request: Request) {
  try {
    const user = await requireDbUser();
    const db = await getDb();

    const [profile] = await db
      .select()
      .from(roadmapProfiles)
      .where(eq(roadmapProfiles.userId, user.id))
      .limit(1);

    if (!profile) {
      return jsonResponse({ profile: null });
    }

    return jsonResponse({ profile });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const db = await getDb();
    
    const body = await parseJson(request, roadmapProfileUpdateSchema);

    const [updatedProfile] = await db
      .insert(roadmapProfiles)
      .values({
        ...body,
        userId: user.id,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: roadmapProfiles.userId,
        set: {
          ...body,
          updatedAt: new Date(),
        },
      })
      .returning();

    return jsonResponse({ profile: updatedProfile });
  } catch (e) {
    return errorResponse(e);
  }
}
