export {
  OTHER_COMPANY,
  OTHER_ROLE,
  resolvedTargetCompany,
  resolvedTargetRole,
  roadmapTitleForTarget,
} from "./hiring-catalog";

import { HIRING_COMPANIES, HIRING_ROLES } from "./hiring-catalog";

/** @deprecated use hiring-catalog — kept for existing imports */
export const TARGET_COMPANIES = HIRING_COMPANIES.map((c) => c.name);

/** @deprecated use hiring-catalog — kept for existing imports */
export const TARGET_ROLES = HIRING_ROLES.map((r) => r.name);
