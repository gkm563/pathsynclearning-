import {
  DocProse,
  DocsShell,
  MarketingHero,
  MarketingPage,
  type DocsNavGroup,
} from "@/components/marketing/MarketingChrome";
import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------
   Endpoint catalogue. `id` values are in-page anchor targets linked from the
   sidebar; they must not change.
------------------------------------------------------------------------- */

type HttpMethod = "GET" | "POST";

interface Endpoint {
  id: string;
  navLabel: string;
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  sampleLabel: string;
  sample: string;
}

const METHOD_TONE: Record<HttpMethod, string> = {
  GET: "border-success/30 bg-success-soft text-success",
  POST: "border-info/30 bg-info-soft text-info",
};

const ENDPOINTS: readonly Endpoint[] = [
  {
    id: "authentication",
    navLabel: "Authentication",
    method: "POST",
    path: "/api/v1/auth/token",
    title: "Authentication",
    description:
      "Exchange your client credentials for a Bearer token to authorize subsequent API requests.",
    sampleLabel: "Request body",
    sample: `{
  "client_id": "string",
  "client_secret": "string"
}`,
  },
  {
    id: "users",
    navLabel: "Users",
    method: "GET",
    path: "/api/v1/users/{uid}",
    title: "Retrieve User Data",
    description:
      "Fetch a student's public profile and metadata. Only accessible if the user has opted into the hiring network.",
    sampleLabel: "Response",
    sample: `{
  "uid": "user_123xyz",
  "name": "Alex Chen",
  "role_target": "Backend Engineer"
}`,
  },
  {
    id: "cri-scores",
    navLabel: "CRI Scores",
    method: "GET",
    path: "/api/v1/users/{uid}/cri",
    title: "Retrieve CRI Score",
    description:
      "Fetch the latest Career Readiness Index score and breakdown for a specific authenticated user.",
    sampleLabel: "Response",
    sample: `{
  "uid": "user_123xyz",
  "cri_score": 84.5,
  "percentile": 92,
  "last_updated": "2026-07-19T12:00:00Z"
}`,
  },
  {
    id: "skill-trees",
    navLabel: "Skill Trees",
    method: "GET",
    path: "/api/v1/users/{uid}/skills",
    title: "Retrieve Skill Graph",
    description:
      "Fetch the user's completed skill nodes and their proficiency level in each.",
    sampleLabel: "Response",
    sample: `{
  "nodes_unlocked": 14,
  "top_skills": ["Node.js", "PostgreSQL", "Redis"]
}`,
  },
];

const API_NAV: readonly DocsNavGroup[] = [
  {
    label: "API Endpoints",
    items: ENDPOINTS.map((endpoint) => ({
      id: endpoint.id,
      label: endpoint.navLabel,
    })),
  },
];

/* ----------------------------------------------------------------------- */

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  return (
    <section id={endpoint.id} className="min-w-0 scroll-mt-24">
      <div className="min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-xs)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-sunken px-4 py-3 sm:px-6">
          <span
            className={cn(
              "type-code inline-flex shrink-0 items-center rounded-[var(--radius-sm)] border px-2 py-0.5 font-semibold",
              METHOD_TONE[endpoint.method],
            )}
          >
            {endpoint.method}
          </span>
          <code className="type-code min-w-0 break-all text-ink">
            {endpoint.path}
          </code>
        </div>

        <div className="min-w-0 px-4 py-5 sm:px-6 sm:py-6">
          <h2 className="type-h3 m-0 text-balance text-ink">
            {endpoint.title}
          </h2>
          <DocProse className="mt-2">
            <p>{endpoint.description}</p>
          </DocProse>

          <figure className="m-0 mt-5 min-w-0">
            <figcaption className="type-caption mb-2 text-faint">
              {endpoint.sampleLabel}
            </figcaption>
            <pre className="type-code m-0 min-w-0 overflow-x-auto rounded-[var(--radius-md)] border border-line bg-sunken px-4 py-3.5 text-ink">
              <code>{endpoint.sample}</code>
            </pre>
          </figure>
        </div>
      </div>
    </section>
  );
}

export default function ApiReference() {
  return (
    <MarketingPage>
      <MarketingHero
        align="left"
        kicker="v1.0.0 · Stable"
        title="API Reference"
        description="Integrate PathEd's career readiness data directly into your corporate HR systems or university dashboards using our robust REST API."
      />

      <DocsShell nav={API_NAV}>
        <div className="flex min-w-0 flex-col gap-8 pt-2 sm:gap-10">
          {ENDPOINTS.map((endpoint) => (
            <EndpointCard key={endpoint.id} endpoint={endpoint} />
          ))}
        </div>
      </DocsShell>
    </MarketingPage>
  );
}
