import { getDb } from "@/lib/db/client";
import { requireDbUser, jsonResponse, errorResponse } from "@/lib/db/users";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const rows = await db`
      SELECT p.*, u.full_name, u.email, u.role, u.image_url, w.coins
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      JOIN wallets w ON w.user_id = p.user_id
      WHERE p.user_id = ${user.id}::uuid
      LIMIT 1
    `;
    return jsonResponse({ profile: rows[0] || null });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await request.json();
    const db = getDb();

    if (body.fullName || body.role) {
      await db`
        UPDATE users SET
          full_name = COALESCE(${body.fullName ?? null}, full_name),
          role = COALESCE(${body.role ?? null}, role),
          updated_at = NOW()
        WHERE id = ${user.id}::uuid
      `;
    }

    await db`
      UPDATE profiles SET
        tagline = COALESCE(${body.tagline ?? null}, tagline),
        institute = COALESCE(${body.institute ?? null}, institute),
        degree = COALESCE(${body.degree ?? null}, degree),
        branch = COALESCE(${body.branch ?? null}, branch),
        cgpa = COALESCE(${body.cgpa ?? null}, cgpa),
        grad_year = COALESCE(${body.gradYear ?? null}, grad_year),
        roll_number = COALESCE(${body.rollNumber ?? null}, roll_number),
        semester = COALESCE(${body.semester ?? null}, semester),
        cri = COALESCE(${body.cri ?? null}, cri),
        rank_global = COALESCE(${body.rankGlobal ?? null}, rank_global),
        rank_univ = COALESCE(${body.rankUniv ?? null}, rank_univ),
        xp = COALESCE(${body.xp ?? null}, xp),
        streak = COALESCE(${body.streak ?? null}, streak),
        skills = COALESCE(${body.skills ? JSON.stringify(body.skills) : null}::jsonb, skills),
        passion = COALESCE(${body.passion ?? null}, passion),
        objective = COALESCE(${body.objective ?? null}, objective),
        pitch = COALESCE(${body.pitch ?? null}, pitch),
        github = COALESCE(${body.github ?? null}, github),
        linkedin = COALESCE(${body.linkedin ?? null}, linkedin),
        portfolio = COALESCE(${body.portfolio ?? null}, portfolio),
        projects = COALESCE(${body.projects ? JSON.stringify(body.projects) : null}::jsonb, projects),
        badges = COALESCE(${body.badges ? JSON.stringify(body.badges) : null}::jsonb, badges),
        additional_data = COALESCE(${body.additionalData ? JSON.stringify(body.additionalData) : null}::jsonb, additional_data),
        additional_completed = COALESCE(${body.additionalCompleted ?? null}, additional_completed),
        updated_at = NOW()
      WHERE user_id = ${user.id}::uuid
    `;

    const rows = await db`SELECT * FROM profiles WHERE user_id = ${user.id}::uuid LIMIT 1`;
    return jsonResponse({ profile: rows[0] });
  } catch (e) {
    return errorResponse(e);
  }
}
