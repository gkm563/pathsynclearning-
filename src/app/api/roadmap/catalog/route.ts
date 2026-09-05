import { requireDbUser } from '@/lib/db/users';
import { errorResponse, jsonResponse } from '@/lib/api/http';
import {
  searchCompanies,
  searchRoles,
  findCompanyByName,
  serializeCatalog,
  companyOffersRole,
} from '@/lib/roadmap/hiring-catalog';

export async function GET(request: Request) {
  try {
    await requireDbUser();
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const company = url.searchParams.get('company');
    const full = serializeCatalog();
    const companyMatch = company ? findCompanyByName(company) : null;
    const matched = q ? new Set(searchCompanies(q).map((c) => c.id)) : null;
    return jsonResponse({
      companies: matched ? full.companies.filter((c) => matched.has(c.id)) : full.companies,
      roles: searchRoles(q && !company ? q : '', companyMatch),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    await requireDbUser();
    const body = (await request.json().catch(() => ({}))) as {
      company?: string;
      role?: string;
    };
    const result = companyOffersRole(body.company || null, body.role || null);
    return jsonResponse({
      ok: result.ok,
      message: result.message,
      company: result.company,
      role: result.role,
      offeredRoles: result.offeredRoles,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
