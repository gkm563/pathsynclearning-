/**
 * Canonical PathEd routes — single source of truth.
 *
 * URL rules:
 * - kebab-case path segments
 * - Clerk auth: /sign-in, /sign-up
 * - Route groups `(marketing)` `(auth)` `(app)` never appear in URLs
 *
 * Always import from here — never hardcode path strings in UI.
 */

export const routes = {
  home: "/",

  marketing: {
    platform: "/platform",
    methodology: "/methodology",
    mission: "/mission",
    company: "/company",
    blog: "/blog",
    community: "/community",
    pricing: "/pricing",
    guides: "/guides",
    documentation: "/documentation",
    apiReference: "/api-reference",
    privacy: "/privacy-policy",
    terms: "/terms-of-service",
    cookies: "/cookie-policy",
    accessibility: "/accessibility",
  },

  auth: {
    signIn: "/sign-in",
    signUp: "/sign-up",
    ssoCallback: "/sso-callback",
    continue: "/auth/continue",
  },

  onboarding: {
    root: "/onboarding",
    stage1: "/onboarding/stage1",
    stage2: "/onboarding/stage2",
    stage3: "/onboarding/stage3",
    stage4: "/onboarding/stage4",
  },

  /** Authenticated student product (portal). */
  app: {
    dashboard: "/dashboard",
    challenges: "/challenges",
    roadmap: "/roadmap",
    memoryLane: "/memory-lane",
    progress: "/progress",
    techNews: "/tech-news",
    store: "/store",
    wallet: "/store/wallet",
    mentorship: "/mentorship",
    events: "/events",
    hackSquad: "/hack-squad",
    alumniNetwork: "/alumni-network",
    projectCollab: "/project-collab",
    ogOpportunities: "/og-opportunities",
    notifications: "/notifications",
    settings: "/settings",
    profile: "/profile",
    placementInbox: "/placement-inbox",
    placementInsights: "/placement-insights",
    recordsCerts: "/records-certs",
    liveClass: "/live-class",
    community: "/student-community",
  },

  api: {
    me: "/api/me",
    store: "/api/store",
    ai: "/api/ai",
  },
} as const;

export type AppRoute = (typeof routes.app)[keyof typeof routes.app];
export type MarketingRoute = (typeof routes.marketing)[keyof typeof routes.marketing];

function withChildren(path: string) {
  return `${path}(.*)` as const;
}

/** Exact marketing `/platform` only — not `/platform/*` student legacy paths. */
export function isMarketingPlatformPath(pathname: string): boolean {
  return (
    pathname === routes.marketing.platform ||
    pathname === `${routes.marketing.platform}/`
  );
}

/**
 * Public matchers (Clerk middleware).
 * Marketing `/platform` is exact; other marketing/auth paths allow children.
 */
export const PUBLIC_ROUTE_MATCHERS = [
  routes.home,
  withChildren("/home"),
  routes.marketing.platform,
  ...Object.values(routes.marketing)
    .filter((p) => p !== routes.marketing.platform)
    .map(withChildren),
  ...Object.values(routes.auth).map(withChildren),
] as const;

/** Sign-in / sign-up — signed-in users are sent to /auth/continue. */
export const AUTH_PAGE_MATCHERS = [
  withChildren(routes.auth.signIn),
  withChildren(routes.auth.signUp),
] as const;

/** Student product + authenticated APIs. */
export const PROTECTED_ROUTE_MATCHERS = [
  withChildren(routes.onboarding.root),
  ...Object.values(routes.app).map(withChildren),
  withChildren(routes.api.me),
  withChildren(routes.api.store),
  withChildren(routes.api.ai),
] as const;

/** Portal paths that require completed onboarding (excludes onboarding itself). */
export const STUDENT_PORTAL_PREFIXES = Object.values(routes.app);

/**
 * Sidebar / header tab id → canonical path.
 * Unknown ids fall back to dashboard?tab=… in nav handlers.
 */
export const APP_NAV_BY_ID: Record<string, string> = {
  dashboard: routes.app.dashboard,
  roadmap: routes.app.roadmap,
  challenges: routes.app.challenges,
  "memory-lane": routes.app.memoryLane,
  progress: routes.app.progress,
  mentorship: routes.app.mentorship,
  "project-collab": routes.app.projectCollab,
  hacksquad: routes.app.hackSquad,
  "hack-squad": routes.app.hackSquad,
  "hack-attack": routes.app.ogOpportunities,
  "og-opportunities": routes.app.ogOpportunities,
  "alumni-network": routes.app.alumniNetwork,
  events: routes.app.events,
  technews: routes.app.techNews,
  "tech-news": routes.app.techNews,
  store: routes.app.store,
  wallet: routes.app.wallet,
  "placement-inbox": routes.app.placementInbox,
  "placement-insights": routes.app.placementInsights,
  "records-certs": routes.app.recordsCerts,
  community: routes.app.community,
  notifications: routes.app.notifications,
  settings: routes.app.settings,
  profile: routes.app.profile,
  "live-class": routes.app.liveClass,
};

/** Legacy URLs → permanent destinations (next.config redirects). */
export const LEGACY_REDIRECTS: ReadonlyArray<{
  source: string;
  destination: string;
  permanent: boolean;
}> = [
  { source: "/home", destination: routes.home, permanent: true },
  { source: "/login", destination: routes.auth.signIn, permanent: true },
  { source: "/register", destination: routes.auth.signUp, permanent: true },

  // Old non-kebab / renamed portal paths
  { source: "/technews", destination: routes.app.techNews, permanent: true },
  { source: "/hacksquad", destination: routes.app.hackSquad, permanent: true },

  // Old /platform/* student URLs → portal
  { source: "/platform/challenges", destination: routes.app.challenges, permanent: true },
  { source: "/platform/roadmap", destination: routes.app.roadmap, permanent: true },
  { source: "/platform/memory-lane", destination: routes.app.memoryLane, permanent: true },
  { source: "/platform/progress", destination: routes.app.progress, permanent: true },
  { source: "/platform/technews", destination: routes.app.techNews, permanent: true },
  { source: "/platform/tech-news", destination: routes.app.techNews, permanent: true },
  { source: "/platform/wallet", destination: routes.app.wallet, permanent: true },
  { source: "/platform/mentorship", destination: routes.app.mentorship, permanent: true },
  { source: "/platform/events", destination: routes.app.events, permanent: true },
  { source: "/platform/hacksquad", destination: routes.app.hackSquad, permanent: true },
  { source: "/platform/hack-squad", destination: routes.app.hackSquad, permanent: true },
  { source: "/platform/alumni-network", destination: routes.app.alumniNetwork, permanent: true },
  { source: "/platform/project-collab", destination: routes.app.projectCollab, permanent: true },
  { source: "/platform/og-opportunities", destination: routes.app.ogOpportunities, permanent: true },
  { source: "/platform/notifications", destination: routes.app.notifications, permanent: true },
  { source: "/platform/settings", destination: routes.app.settings, permanent: true },
  { source: "/platform/profile", destination: routes.app.profile, permanent: true },
  { source: "/platform/placement-inbox", destination: routes.app.placementInbox, permanent: true },
  { source: "/platform/placement-insights", destination: routes.app.placementInsights, permanent: true },
  { source: "/platform/records-certs", destination: routes.app.recordsCerts, permanent: true },
  { source: "/platform/live-class", destination: routes.app.liveClass, permanent: true },
  { source: "/platform/community", destination: routes.app.community, permanent: true },
];

export function pathForNavId(id: string): string | null {
  return APP_NAV_BY_ID[id] ?? null;
}

/** Resolve a sidebar/header tab id to a navigable href (route or dashboard?tab=). */
export function hrefForNavId(id: string): string {
  return pathForNavId(id) ?? dashboardTabPath(id);
}

export function dashboardTabPath(tabId: string): string {
  return `${routes.app.dashboard}?tab=${encodeURIComponent(tabId)}`;
}

export function ssoCallbackWithRole(role: string): string {
  const q = new URLSearchParams({ role });
  return `${routes.auth.ssoCallback}?${q.toString()}`;
}

export function authContinueWithRole(role?: string | null): string {
  if (!role) return routes.auth.continue;
  const q = new URLSearchParams({ role });
  return `${routes.auth.continue}?${q.toString()}`;
}
