import { getDb } from "@/lib/db/client";
import { requireDbUser, jsonResponse, errorResponse } from "@/lib/db/users";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const rows = await db`SELECT * FROM onboarding WHERE user_id = ${user.id}::uuid LIMIT 1`;
    return jsonResponse({ onboarding: rows[0] || null });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await request.json();
    const db = getDb();

    await db`
      UPDATE onboarding SET
        stage1 = COALESCE(${body.stage1 ? JSON.stringify(body.stage1) : null}::jsonb, stage1),
        stage2 = COALESCE(${body.stage2 ? JSON.stringify(body.stage2) : null}::jsonb, stage2),
        stage3 = COALESCE(${body.stage3 ? JSON.stringify(body.stage3) : null}::jsonb, stage3),
        stage4 = COALESCE(${body.stage4 ? JSON.stringify(body.stage4) : null}::jsonb, stage4),
        selected_career = COALESCE(${body.selectedCareer ?? null}, selected_career),
        current_stage = COALESCE(${body.currentStage ?? null}, current_stage),
        completed = COALESCE(${body.completed ?? null}, completed),
        updated_at = NOW()
      WHERE user_id = ${user.id}::uuid
    `;

    if (body.stage1?.name || body.stage1?.college) {
      await db`
        UPDATE profiles SET
          institute = COALESCE(${body.stage1?.college ?? null}, institute),
          branch = COALESCE(${body.stage1?.branch ?? null}, branch),
          semester = COALESCE(${body.stage1?.semester ?? null}, semester),
          cgpa = COALESCE(${body.stage1?.cgpa ?? null}, cgpa),
          roll_number = COALESCE(${body.stage1?.roll ?? null}, roll_number),
          updated_at = NOW()
        WHERE user_id = ${user.id}::uuid
      `;
      if (body.stage1?.name) {
        await db`
          UPDATE users SET full_name = ${body.stage1.name}, updated_at = NOW()
          WHERE id = ${user.id}::uuid
        `;
      }
    }

    const rows = await db`SELECT * FROM onboarding WHERE user_id = ${user.id}::uuid LIMIT 1`;
    return jsonResponse({ onboarding: rows[0] });
  } catch (e) {
    return errorResponse(e);
  }
}
