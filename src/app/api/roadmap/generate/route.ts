import { requireDbUser } from '@/lib/db/users';
import { getDb } from '@/lib/db/client';
import { roadmapProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api/http';
import {
  assertProfileReadyForGeneration,
  persistGeneratedRoadmap,
} from '@/lib/roadmap/persist-generated';
import { progressFor } from '@/lib/roadmap/generation-progress';
import { AppError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function wantsStream(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get('stream') === '1') return true;
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/event-stream');
}

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Create a new roadmap from the user's profile.
 * POST /api/roadmap/generate?stream=1 streams real progress events.
 */
export async function POST(request: Request) {
  if (!wantsStream(request)) {
    try {
      const user = await requireDbUser();
      await request.json().catch(() => ({}));

      const db = getDb();
      const [profile] = await db
        .select()
        .from(roadmapProfiles)
        .where(eq(roadmapProfiles.userId, user.id))
        .limit(1);

      assertProfileReadyForGeneration(profile);
      const newRoadmap = await persistGeneratedRoadmap(user.id, profile);
      return jsonResponse({ roadmap: newRoadmap });
    } catch (e) {
      return errorResponse(e);
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sse(event, data)));
      };
      try {
        const user = await requireDbUser();
        await request.json().catch(() => ({}));
        const db = getDb();
        const [profile] = await db
          .select()
          .from(roadmapProfiles)
          .where(eq(roadmapProfiles.userId, user.id))
          .limit(1);

        assertProfileReadyForGeneration(profile);
        send('progress', progressFor('profile'));

        const newRoadmap = await persistGeneratedRoadmap(user.id, profile, (p) => {
          send('progress', p);
        });
        send('progress', progressFor('done'));
        send('done', { roadmap: newRoadmap });
      } catch (e) {
        const known = e instanceof AppError ? e : null;
        send('error', {
          message: known?.message || (e instanceof Error ? e.message : 'Failed to generate roadmap'),
          code: known?.code || 'INTERNAL',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
