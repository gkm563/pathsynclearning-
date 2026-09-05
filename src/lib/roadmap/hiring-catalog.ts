export type RoleId =
  | "sde"
  | "frontend"
  | "backend"
  | "fullstack"
  | "mobile"
  | "ml"
  | "data-scientist"
  | "data-analyst"
  | "security"
  | "devops"
  | "sre"
  | "ux"
  | "pm"
  | "sdet";

export type HiringCompany = {
  id: string;
  name: string;
  domain: string;
  kind: "faang" | "product" | "fintech" | "services" | "startup" | "semiconductor";
  region: string;
  roles: RoleId[];
  stacks: string[];
  interviewLoop: string[];
  hiringNotes: string;
};

export type HiringRole = {
  id: RoleId;
  name: string;
  aliases: string[];
  summary: string;
};

export const HIRING_ROLES: HiringRole[] = [
  {
    id: "sde",
    name: "Software Engineer (SDE)",
    aliases: ["sde", "swe", "software engineer", "software developer", "sde-1", "sde 1"],
    summary: "DSA + coding interviews, language fluency, and core CS for product engineering.",
  },
  {
    id: "frontend",
    name: "Frontend Developer",
    aliases: ["frontend", "front-end", "ui engineer", "web developer"],
    summary: "JavaScript/TypeScript, React or similar, CSS, web performance, and UI system design.",
  },
  {
    id: "backend",
    name: "Backend Developer",
    aliases: ["backend", "back-end", "server engineer", "api engineer"],
    summary: "APIs, databases, distributed systems, and production reliability.",
  },
  {
    id: "fullstack",
    name: "Full Stack Developer",
    aliases: ["full stack", "fullstack", "full-stack"],
    summary: "End-to-end product delivery across UI, APIs, and data stores.",
  },
  {
    id: "mobile",
    name: "Mobile Developer",
    aliases: ["android", "ios", "react native", "flutter", "mobile"],
    summary: "Native or cross-platform apps, mobile performance, and store-ready delivery.",
  },
  {
    id: "ml",
    name: "AI / ML Engineer",
    aliases: ["ml engineer", "machine learning", "ai engineer", "applied scientist intern"],
    summary: "Python, ML fundamentals, applied modeling, and production ML systems.",
  },
  {
    id: "data-scientist",
    name: "Data Scientist",
    aliases: ["data scientist", "ds", "applied scientist"],
    summary: "Statistics, experimentation, modeling, and communicating insights.",
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    aliases: ["data analyst", "business analyst", "analytics"],
    summary: "SQL, dashboards, metrics, and stakeholder-ready analysis.",
  },
  {
    id: "security",
    name: "Cybersecurity Engineer",
    aliases: ["security", "cybersecurity", "appsec", "infosec"],
    summary: "Secure systems, networking, threat modeling, and defensive tooling.",
  },
  {
    id: "devops",
    name: "Cloud / DevOps Engineer",
    aliases: ["devops", "cloud engineer", "platform engineer", "sre intern"],
    summary: "Linux, CI/CD, containers, and cloud infrastructure.",
  },
  {
    id: "sre",
    name: "Site Reliability Engineer",
    aliases: ["sre", "reliability engineer"],
    summary: "SLOs, observability, incident response, and large-scale operations.",
  },
  {
    id: "ux",
    name: "UI / UX Designer",
    aliases: ["ui/ux", "ux", "product designer", "ui designer"],
    summary: "Research, interaction design, visual systems, and portfolio critique.",
  },
  {
    id: "pm",
    name: "Product Manager",
    aliases: ["product manager", "apm", "associate product manager"],
    summary: "Product sense, execution, analytics, and stakeholder communication.",
  },
  {
    id: "sdet",
    name: "SDET / QA Engineer",
    aliases: ["sdet", "qa", "test engineer", "quality engineer"],
    summary: "Test strategy, automation, and quality for production systems.",
  },
];

const SERVICES: RoleId[] = ["sde", "fullstack", "backend", "frontend", "devops", "sdet", "data-analyst"];
const AI_ENG: RoleId[] = ["ml", "data-scientist", "sde"];

export const HIRING_COMPANIES: HiringCompany[] = [
  {
    id: "google",
    name: "Google",
    domain: "google.com",
    kind: "faang",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "ml", "data-scientist", "sre", "ux", "pm", "sdet"],
    stacks: ["C++", "Java", "Python", "Go", "distributed systems", "ML"],
    interviewLoop: ["Online assessment / DSA", "Coding interviews", "Googleyness", "Role-related knowledge"],
    hiringNotes:
      "Expect medium-hard DSA, clean code, and CS fundamentals. Frontend roles still include coding; ML needs math + applied ML.",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    domain: "microsoft.com",
    kind: "faang",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "ml", "data-scientist", "devops", "sre", "ux", "pm", "sdet"],
    stacks: ["C#", ".NET", "Azure", "TypeScript", "Python"],
    interviewLoop: ["OA / Codility", "DSA + debugging", "System design (SDE-2+)", "As Appropriate / behavioral"],
    hiringNotes: "Azure + C#/.NET show up often; intern and university hiring is high-volume with LeetCode-style rounds.",
  },
  {
    id: "amazon",
    name: "Amazon",
    domain: "amazon.com",
    kind: "faang",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "ml", "data-scientist", "data-analyst", "sre", "pm", "sdet"],
    stacks: ["Java", "AWS", "distributed systems", "DynamoDB"],
    interviewLoop: ["OA (DSA + work simulation)", "Coding", "Leadership Principles", "Bar raiser"],
    hiringNotes: "Leadership Principles are mandatory. OA is a filter; LP stories must be specific.",
  },
  {
    id: "meta",
    name: "Meta",
    domain: "meta.com",
    kind: "faang",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "ml", "data-scientist", "sre", "ux", "pm"],
    stacks: ["React", "Hack/PHP", "Python", "PyTorch", "GraphQL"],
    interviewLoop: ["Coding", "Product / ML screen by role", "Behavioral"],
    hiringNotes: "Frontend is React-heavy. Coding speed and communication matter as much as correctness.",
  },
  {
    id: "apple",
    name: "Apple",
    domain: "apple.com",
    kind: "faang",
    region: "Global",
    roles: ["sde", "frontend", "backend", "mobile", "ml", "sre", "ux", "pm"],
    stacks: ["Swift", "Objective-C", "C++", "Python"],
    interviewLoop: ["Recruiter screen", "Domain coding", "Team interviews"],
    hiringNotes: "Mobile and systems roles are common. Interviews are team-specific rather than one global loop.",
  },
  {
    id: "netflix",
    name: "Netflix",
    domain: "netflix.com",
    kind: "product",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "ml", "data-scientist", "sre", "ux"],
    stacks: ["Java", "Node.js", "React", "AWS", "microservices"],
    interviewLoop: ["Recruiter", "Coding / domain", "Culture"],
    hiringNotes: "Senior-leaning hiring. Streaming, personalization, and high-scale backend are typical themes.",
  },
  {
    id: "uber",
    name: "Uber",
    domain: "uber.com",
    kind: "product",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "ml", "data-scientist", "sre"],
    stacks: ["Go", "Java", "Python", "mobile", "maps / dispatch"],
    interviewLoop: ["OA", "DSA", "System design", "Behavioral"],
    hiringNotes: "Marketplace, geo, and realtime systems. DSA bar is high for SDE new-grad.",
  },
  {
    id: "stripe",
    name: "Stripe",
    domain: "stripe.com",
    kind: "fintech",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "ml", "data-analyst", "ux", "pm"],
    stacks: ["Ruby", "Java", "TypeScript", "payments", "SQL"],
    interviewLoop: ["Recruiter", "Bug hunt / coding", "Systems", "Collaboration"],
    hiringNotes: "API design, correctness, and security around money movement. Strong writing and product sense help.",
  },
  {
    id: "atlassian",
    name: "Atlassian",
    domain: "atlassian.com",
    kind: "product",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "devops", "ux", "pm", "sdet"],
    stacks: ["Java", "TypeScript", "AWS", "React"],
    interviewLoop: ["Values", "Coding", "System design", "Team fit"],
    hiringNotes: "Collaboration products; values interviews are real filters. Java + TypeScript are common.",
  },
  {
    id: "adobe",
    name: "Adobe",
    domain: "adobe.com",
    kind: "product",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "ml", "ux", "pm"],
    stacks: ["Java", "JavaScript", "C++", "creative cloud / Experience Cloud"],
    interviewLoop: ["OA", "Coding", "Manager"],
    hiringNotes: "Mix of creative-suite C++ and web/cloud product teams. India hiring is active for SDE.",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    domain: "salesforce.com",
    kind: "product",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "ml", "data-analyst", "ux", "pm"],
    stacks: ["Java", "Apex", "JavaScript", "Lightning"],
    interviewLoop: ["OA", "Coding", "Behavioral"],
    hiringNotes: "CRM domain plus platform engineering. University programs are structured.",
  },
  {
    id: "goldman",
    name: "Goldman Sachs",
    domain: "goldmansachs.com",
    kind: "fintech",
    region: "Global",
    roles: ["sde", "backend", "fullstack", "ml", "data-analyst", "data-scientist"],
    stacks: ["Java", "Python", "SQL", "distributed systems"],
    interviewLoop: ["HackerRank", "DSA", "HireVue", "Superday"],
    hiringNotes: "CoderPad/HackerRank plus finance-adjacent problem solving. SQL and Java are frequent.",
  },
  {
    id: "jpmorgan",
    name: "JPMorgan",
    domain: "jpmorganchase.com",
    kind: "fintech",
    region: "Global",
    roles: ["sde", "backend", "fullstack", "ml", "data-analyst", "data-scientist", "sdet"],
    stacks: ["Java", "Python", "SQL", "cloud"],
    interviewLoop: ["OA", "Coding", "HireVue", "Superday"],
    hiringNotes: "Code for Good / campus pipelines. Expect DSA plus some domain (payments, risk) awareness.",
  },
  {
    id: "flipkart",
    name: "Flipkart",
    domain: "flipkart.com",
    kind: "product",
    region: "India",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "ml", "data-scientist", "data-analyst", "sre"],
    stacks: ["Java", "Kotlin", "React", "Kafka", "data"],
    interviewLoop: ["OA", "DSA", "Machine coding", "Hiring manager"],
    hiringNotes: "Machine coding rounds are common. E-commerce scale, search, and supply-chain systems.",
  },
  {
    id: "swiggy",
    name: "Swiggy",
    domain: "swiggy.com",
    kind: "startup",
    region: "India",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "ml", "data-analyst", "data-scientist"],
    stacks: ["Kotlin", "React", "Node", "Python", "logistics"],
    interviewLoop: ["OA", "DSA", "Machine coding", "Culture"],
    hiringNotes: "Realtime logistics and consumer apps. Mobile + backend hiring is consistent.",
  },
  {
    id: "zomato",
    name: "Zomato",
    domain: "zomato.com",
    kind: "startup",
    region: "India",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "data-analyst", "ml"],
    stacks: ["Kotlin", "React", "Go", "data"],
    interviewLoop: ["OA", "DSA", "HM"],
    hiringNotes: "Consumer + Hyperpure/Blinkit style ops. Analytics roles exist; core SDE is DSA + coding.",
  },
  {
    id: "razorpay",
    name: "Razorpay",
    domain: "razorpay.com",
    kind: "fintech",
    region: "India",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "security", "data-analyst", "sdet"],
    stacks: ["Java", "Go", "React", "payments", "AWS"],
    interviewLoop: ["OA", "DSA", "System + payments domain", "Culture"],
    hiringNotes: "Fintech correctness, idempotency, and security. Backend and SDE are the highest volume.",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    domain: "phonepe.com",
    kind: "fintech",
    region: "India",
    roles: ["sde", "backend", "fullstack", "mobile", "ml", "sre", "sdet"],
    stacks: ["Java", "Kotlin", "distributed systems", "payments"],
    interviewLoop: ["OA", "DSA", "Machine coding", "HM"],
    hiringNotes: "High-scale payments. Java/Kotlin and machine-coding are typical.",
  },
  {
    id: "tcs",
    name: "TCS",
    domain: "tcs.com",
    kind: "services",
    region: "India",
    roles: SERVICES,
    stacks: ["Java", "Python", "SQL", "cloud", "enterprise"],
    interviewLoop: ["NQT / aptitude", "Technical", "HR"],
    hiringNotes: "Campus aptitude + basics of programming. Role mapping is often after joining; still prep Java/SQL/DSA.",
  },
  {
    id: "infosys",
    name: "Infosys",
    domain: "infosys.com",
    kind: "services",
    region: "India",
    roles: SERVICES,
    stacks: ["Java", "Python", "SQL", ".NET", "cloud"],
    interviewLoop: ["InfyTQ / OA", "Technical", "HR"],
    hiringNotes: "Programming fundamentals, puzzles, and communication. Specialization happens in training.",
  },
  {
    id: "wipro",
    name: "Wipro",
    domain: "wipro.com",
    kind: "services",
    region: "India",
    roles: SERVICES,
    stacks: ["Java", "Python", "testing", "cloud"],
    interviewLoop: ["OA", "Technical", "HR"],
    hiringNotes: "Similar services pattern: aptitude, coding basics, and project discussion.",
  },
  {
    id: "accenture",
    name: "Accenture",
    domain: "accenture.com",
    kind: "services",
    region: "Global",
    roles: [...SERVICES, "pm", "ux"],
    stacks: ["Java", "Salesforce", "cloud", "data"],
    interviewLoop: ["Cognitive / coding", "Technical", "HR"],
    hiringNotes: "Consulting + engineering. Communication and fundamentals outweigh elite DSA.",
  },
  {
    id: "oracle",
    name: "Oracle",
    domain: "oracle.com",
    kind: "product",
    region: "Global",
    roles: ["sde", "backend", "fullstack", "frontend", "ml", "data-analyst", "sdet"],
    stacks: ["Java", "SQL", "OCI", "distributed databases"],
    interviewLoop: ["OA", "DSA / SQL", "Team"],
    hiringNotes: "Java and databases are first-class. Cloud (OCI) helps for newer teams.",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    domain: "linkedin.com",
    kind: "product",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "ml", "data-scientist", "sre", "pm"],
    stacks: ["Java", "Scala", "React", "Kafka"],
    interviewLoop: ["Phone screen", "Coding", "Host manager"],
    hiringNotes: "Feed, graph, and growth systems. Coding plus product collaboration.",
  },
  {
    id: "airbnb",
    name: "Airbnb",
    domain: "airbnb.com",
    kind: "product",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "ml", "data-scientist", "ux", "pm"],
    stacks: ["Java", "React", "data", "payments"],
    interviewLoop: ["Recruiter", "Coding", "Domain"],
    hiringNotes: "Product quality and communication. Frontend craft is taken seriously.",
  },
  {
    id: "databricks",
    name: "Databricks",
    domain: "databricks.com",
    kind: "product",
    region: "Global",
    roles: [...AI_ENG, "backend", "sde", "sre"],
    stacks: ["Spark", "Scala", "Python", "distributed data"],
    interviewLoop: ["Coding", "Data systems", "HM"],
    hiringNotes: "Data infrastructure bar is high. Python/Scala plus distributed compute.",
  },
  {
    id: "openai",
    name: "OpenAI",
    domain: "openai.com",
    kind: "product",
    region: "US",
    roles: ["sde", "ml", "data-scientist", "frontend", "backend", "sre"],
    stacks: ["Python", "PyTorch", "distributed training", "TypeScript"],
    interviewLoop: ["Recruiter", "Technical depth", "Team"],
    hiringNotes: "Competitive research + applied eng. Not a typical campus OA company; still needs strong CS + ML.",
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    domain: "nvidia.com",
    kind: "semiconductor",
    region: "Global",
    roles: ["sde", "ml", "backend", "sre"],
    stacks: ["C++", "CUDA", "Python", "systems"],
    interviewLoop: ["OA / coding", "Domain (GPU / systems)", "HM"],
    hiringNotes: "Systems, CUDA, and performance. ML infra and compiler-adjacent teams are common.",
  },
  {
    id: "zoho",
    name: "Zoho",
    domain: "zoho.com",
    kind: "product",
    region: "India",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "sdet", "ux"],
    stacks: ["Java", "JavaScript", "C", "in-house stack"],
    interviewLoop: ["Aptitude", "Programming", "Advanced programming", "HR"],
    hiringNotes: "Long programming rounds, not LeetCode-only. Strong fundamentals and stamina.",
  },
  {
    id: "freshworks",
    name: "Freshworks",
    domain: "freshworks.com",
    kind: "product",
    region: "India",
    roles: ["sde", "frontend", "backend", "fullstack", "sdet", "ux"],
    stacks: ["Ruby", "Java", "React", "SaaS"],
    interviewLoop: ["OA", "Coding", "HM"],
    hiringNotes: "SaaS product engineering. Full stack and frontend volume is healthy.",
  },
  {
    id: "cred",
    name: "CRED",
    domain: "cred.club",
    kind: "fintech",
    region: "India",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "data-analyst"],
    stacks: ["Kotlin", "React", "fintech"],
    interviewLoop: ["OA", "DSA", "Culture"],
    hiringNotes: "Consumer fintech + strong design culture. Mobile and frontend are visible brands.",
  },
  {
    id: "meesho",
    name: "Meesho",
    domain: "meesho.com",
    kind: "startup",
    region: "India",
    roles: ["sde", "frontend", "backend", "fullstack", "mobile", "data-analyst", "ml"],
    stacks: ["Kotlin", "React", "data"],
    interviewLoop: ["OA", "DSA", "HM"],
    hiringNotes: "Social commerce scale. Analytics and SDE both hire from campus.",
  },
  {
    id: "shopify",
    name: "Shopify",
    domain: "shopify.com",
    kind: "product",
    region: "Global",
    roles: ["sde", "frontend", "backend", "fullstack", "ux", "pm", "data-analyst"],
    stacks: ["Ruby", "React", "GraphQL", "commerce"],
    interviewLoop: ["Life story", "Pair programming", "Domain"],
    hiringNotes: "Pairing over puzzle-only interviews. Rails/React commerce domain.",
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    domain: "cloudflare.com",
    kind: "product",
    region: "Global",
    roles: ["sde", "backend", "frontend", "security", "sre", "devops"],
    stacks: ["Go", "Rust", "networks", "edge"],
    interviewLoop: ["Coding", "Systems / networks", "Team"],
    hiringNotes: "Networking, edge, and security depth. Linux and HTTP internals help.",
  },
];

export const OTHER_COMPANY = "Other";
export const OTHER_ROLE = "Other";

export function companyLogoUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9+]+/g, " ").trim();
}

export function findRoleByName(name: string | null | undefined): HiringRole | null {
  if (!name) return null;
  const n = norm(name);
  if (!n) return null;
  return (
    HIRING_ROLES.find((r) => r.id === n || norm(r.name) === n || r.aliases.some((a) => n.includes(a) || a.includes(n))) ||
    null
  );
}

export function findCompanyByName(name: string | null | undefined): HiringCompany | null {
  if (!name) return null;
  const n = norm(name);
  if (!n) return null;
  return (
    HIRING_COMPANIES.find((c) => c.id === n || norm(c.name) === n || n.includes(norm(c.name)) || norm(c.name).includes(n)) ||
    null
  );
}

export function searchCompanies(query: string): HiringCompany[] {
  const q = norm(query);
  if (!q) return HIRING_COMPANIES;
  return HIRING_COMPANIES.filter(
    (c) =>
      norm(c.name).includes(q) ||
      c.id.includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.kind.includes(q) ||
      c.stacks.some((s) => norm(s).includes(q)),
  );
}

export function searchRoles(query: string, company?: HiringCompany | null): HiringRole[] {
  const pool = company
    ? HIRING_ROLES.filter((r) => company.roles.includes(r.id))
    : HIRING_ROLES;
  const q = norm(query);
  if (!q) return pool;
  return pool.filter(
    (r) =>
      norm(r.name).includes(q) ||
      r.aliases.some((a) => a.includes(q) || q.includes(a)) ||
      r.summary.toLowerCase().includes(q),
  );
}

export function companyOffersRole(companyName: string | null, roleName: string | null): {
  ok: boolean;
  company: HiringCompany | null;
  role: HiringRole | null;
  offeredRoles: HiringRole[];
  message: string;
} {
  const company = findCompanyByName(companyName);
  const role = findRoleByName(roleName);
  if (!company) {
    return {
      ok: true,
      company: null,
      role,
      offeredRoles: HIRING_ROLES,
      message: "Custom company — we will treat the pairing as a best-effort hiring map.",
    };
  }
  const offeredRoles = HIRING_ROLES.filter((r) => company.roles.includes(r.id));
  if (!roleName) {
    return { ok: false, company, role: null, offeredRoles, message: "Pick a role this company actually hires." };
  }
  if (!role) {
    return {
      ok: false,
      company,
      role: null,
      offeredRoles,
      message: `${company.name} hiring is mapped to specific roles. Choose one they offer, or pick Other.`,
    };
  }
  if (!company.roles.includes(role.id)) {
    return {
      ok: false,
      company,
      role,
      offeredRoles,
      message: `${company.name} does not typically hire ${role.name} in campus/new-grad loops. Pick a listed role.`,
    };
  }
  return {
    ok: true,
    company,
    role,
    offeredRoles,
    message: `${company.name} hires ${role.name}.`,
  };
}

export function hiringBrief(companyName: string | null, roleName: string | null) {
  const { company, role, ok, offeredRoles } = companyOffersRole(companyName, roleName);
  return {
    ok,
    company: company
      ? {
          name: company.name,
          stacks: company.stacks,
          interviewLoop: company.interviewLoop,
          hiringNotes: company.hiringNotes,
          kind: company.kind,
          region: company.region,
        }
      : null,
    role: role
      ? { name: role.name, summary: role.summary }
      : roleName
        ? { name: roleName, summary: "Custom role — map to publicly known hiring skills." }
        : null,
    offeredRoleNames: offeredRoles.map((r) => r.name),
  };
}

export function resolvedTargetCompany(company: unknown, custom: unknown): string | null {
  const selected = typeof company === "string" ? company.trim() : "";
  const customName = typeof custom === "string" ? custom.trim() : "";
  const name = selected === OTHER_COMPANY ? customName : selected;
  return name || null;
}

export function resolvedTargetRole(role: unknown, custom: unknown): string | null {
  const selected = typeof role === "string" ? role.trim() : "";
  const customName = typeof custom === "string" ? custom.trim() : "";
  if (selected === OTHER_ROLE) return customName || null;
  return selected || null;
}

export function roadmapTitleForTarget(
  generatedTitle: string,
  targetRole: string | null,
  targetCompany: string | null,
) {
  const company = targetCompany?.trim();
  if (!company) return generatedTitle;
  if (generatedTitle.toLowerCase().includes(company.toLowerCase())) {
    return generatedTitle;
  }
  const role = targetRole?.trim();
  if (role && generatedTitle.toLowerCase().includes(role.toLowerCase())) {
    return `${company} · ${generatedTitle}`;
  }
  return `${company} ${role || generatedTitle} Path`.replace(/\s+/g, " ").trim();
}

export function serializeCatalog() {
  return {
    companies: HIRING_COMPANIES.map((c) => ({
      ...c,
      logo: companyLogoUrl(c.domain),
      roleNames: HIRING_ROLES.filter((r) => c.roles.includes(r.id)).map((r) => r.name),
    })),
    roles: HIRING_ROLES,
  };
}
