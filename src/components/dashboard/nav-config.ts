import {
  Award,
  BarChart2,
  BookOpen,
  Briefcase,
  Calendar,
  GitBranch,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  Map,
  Newspaper,
  Radio,
  Mic,
  ShoppingBag,
  UserRound,
  Users,
  Wallet,
  ListChecks,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@/lib/routes";

/**
 * The portal's information architecture — one definition consumed by the
 * desktop sidebar, the mobile drawer, the mobile tab bar and the header's
 * page-title/breadcrumb resolution.
 *
 * Previously each of those maintained its own copy of the link list, which is
 * why the navbar showed six destinations while the sidebar showed fifteen and
 * neither agreed on labels. Adding a route now means editing this file only.
 */

export type NavItem = {
  id: string;
  href: string;
  label: string;
  /** Shorter label for the mobile tab bar, where horizontal space is scarce. */
  shortLabel?: string;
  icon: LucideIcon;
  /**
   * `exact` for index routes that would otherwise stay highlighted while a
   * child route is active (e.g. `/dashboard` vs `/dashboard/roadmap`).
   */
  match?: "exact" | "prefix";
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        id: "dashboard",
        href: routes.app.dashboard,
        label: "Home",
        icon: LayoutDashboard,
        match: "exact",
      },
      {
        id: "progress",
        href: routes.app.progress,
        label: "Progress",
        icon: BarChart2,
      },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    items: [
      { id: "roadmap", href: routes.app.roadmap, label: "Roadmap", icon: Map },
      {
        id: "problems",
        href: routes.app.problems,
        label: "Problems",
        icon: ListChecks,
      },
      {
        id: "challenges",
        href: routes.app.challenges,
        label: "Challenges",
        icon: Zap,
      },
      {
        id: "memory-lane",
        href: routes.app.memoryLane,
        label: "Memory Lane",
        shortLabel: "Memory",
        icon: BookOpen,
      },
      {
        id: "tech-news",
        href: routes.app.techNews,
        label: "Tech News",
        shortLabel: "News",
        icon: Newspaper,
      },
      {
        id: "live-class",
        href: routes.app.liveClass,
        label: "Live Class",
        icon: Radio,
      },
    ],
  },
  {
    id: "career",
    label: "Career",
    items: [
      {
        id: "placement-inbox",
        href: routes.app.placementInbox,
        label: "Placement Inbox",
        icon: Inbox,
      },
      {
        id: "placement-insights",
        href: routes.app.placementInsights,
        label: "Placement Insights",
        icon: Lightbulb,
      },
      {
        id: "og-opportunities",
        href: routes.app.ogOpportunities,
        label: "OG Opportunities",
        icon: Briefcase,
      },
      {
        id: "events",
        href: routes.app.events,
        label: "Events",
        icon: Calendar,
      },
      {
        id: "mentorship",
        href: routes.app.mentorship,
        label: "Mentorship",
        icon: UserRound,
      },
      {
        id: "interview",
        href: routes.app.interview,
        label: "AI Interview",
        shortLabel: "Interview",
        icon: Mic,
      },
      {
        id: "records-certs",
        href: routes.app.recordsCerts,
        label: "Records & Certs",
        icon: Award,
      },
    ],
  },
  {
    id: "community",
    label: "Community",
    items: [
      {
        id: "student-community",
        href: routes.app.community,
        label: "Student Community",
        icon: Users,
      },
      {
        id: "project-collab",
        href: routes.app.projectCollab,
        label: "Project Collab",
        icon: GitBranch,
      },
      {
        id: "hack-squad",
        href: routes.app.hackSquad,
        label: "Hack Squad",
        icon: Zap,
      },
      {
        id: "alumni-network",
        href: routes.app.alumniNetwork,
        label: "Alumni Network",
        icon: Users,
      },
    ],
  },
  {
    id: "rewards",
    label: "Rewards",
    items: [
      {
        id: "store",
        href: routes.app.store,
        label: "Store",
        icon: ShoppingBag,
        match: "exact",
      },
      { id: "wallet", href: routes.app.wallet, label: "Wallet", icon: Wallet },
    ],
  },
];

/**
 * Thumb-reachable destinations for the mobile tab bar.
 *
 * Five slots maximum: beyond that the targets fall under the ~44px minimum
 * and become unreliable to hit. Everything else lives behind "More".
 */
export const MOBILE_TAB_IDS = [
  "dashboard",
  "roadmap",
  "challenges",
  "progress",
] as const;

const ALL_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

/** Routes that are reachable but intentionally absent from the nav chrome. */
const SATELLITE_ITEMS: Array<{ href: string; label: string; parentId?: string }> =
  [
    { href: routes.app.profile, label: "Profile" },
    { href: routes.app.settings, label: "Settings" },
    { href: routes.app.notifications, label: "Notifications" },
    {
      href: routes.app.techNewsSaved,
      label: "Saved articles",
      parentId: "tech-news",
    },
    {
      href: routes.app.roadmapPersonalize,
      label: "Personalize",
      parentId: "roadmap",
    },
  ];

export function findNavItem(id: string): NavItem | undefined {
  return ALL_ITEMS.find((item) => item.id === id);
}

export function getMobileTabs(): NavItem[] {
  return MOBILE_TAB_IDS.map(findNavItem).filter(
    (item): item is NavItem => Boolean(item),
  );
}

/** True when `pathname` is (or is nested under) this nav item's route. */
export function isNavItemActive(
  pathname: string | null,
  item: NavItem,
): boolean {
  if (!pathname) return false;
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Resolves the current route to a breadcrumb trail.
 *
 * Longest-prefix match, so `/dashboard/tech-news/saved` resolves to
 * Home → Tech News → Saved articles rather than stopping at the section.
 */
export function resolveBreadcrumb(
  pathname: string | null,
): Array<{ label: string; href?: string }> {
  const home = { label: "Home", href: routes.app.dashboard };
  if (!pathname || pathname === routes.app.dashboard) return [home];

  const satellite = SATELLITE_ITEMS.filter(
    (entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];

  const section = ALL_ITEMS.filter(
    (item) =>
      item.match !== "exact" &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  ).sort((a, b) => b.href.length - a.href.length)[0];

  const trail: Array<{ label: string; href?: string }> = [home];

  if (satellite) {
    const parent = satellite.parentId
      ? findNavItem(satellite.parentId)
      : undefined;
    if (parent) trail.push({ label: parent.label, href: parent.href });
    trail.push({ label: satellite.label });
    return trail;
  }

  if (section) {
    trail.push({ label: section.label, href: section.href });
    // A deeper segment (detail pages such as `/tech-news/[id]`) gets a generic
    // trailing crumb; the page itself can render a more specific header.
    if (pathname !== section.href) trail.push({ label: "Detail" });
    return trail;
  }

  const exact = ALL_ITEMS.find((item) => item.href === pathname);
  if (exact) trail.push({ label: exact.label });
  return trail;
}

/** Human-readable title for the current route, used by the header. */
export function resolvePageTitle(pathname: string | null): string {
  const trail = resolveBreadcrumb(pathname);
  return trail[trail.length - 1]?.label ?? "Dashboard";
}
