import Link from "next/link";
import { Compass } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui";
import { routes } from "@/lib/routes";

export const metadata = {
  title: "Page not found",
};

/**
 * 404. Offers two routes out rather than a dead end: back to the marketing
 * site, or through to the workspace (`/auth/continue` resolves the signed-in
 * user's real landing page, and falls through to sign-in if there's no
 * session, so it's safe for anonymous visitors too).
 */
export default function NotFound() {
  const suggestions = [
    { href: routes.app.dashboard, label: "Dashboard" },
    { href: routes.app.roadmap, label: "Roadmap" },
    { href: routes.marketing.platform, label: "Platform" },
    { href: routes.marketing.pricing, label: "Pricing" },
    { href: routes.marketing.documentation, label: "Documentation" },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <div className="px-5 py-5 sm:px-8">
        <BrandMark href={routes.home} size="sm" showWordmark />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <span
          aria-hidden
          className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-primary shadow-[var(--shadow-sm)]"
        >
          <Compass size={20} />
        </span>

        <p className="type-overline mb-2 text-accent">Error 404</p>
        <h1 className="type-h1 m-0 max-w-xl text-ink">
          We couldn&apos;t find that page
        </h1>
        <p className="type-body mx-auto mt-3 mb-0 max-w-md text-muted">
          The link may be broken, or the page may have moved since you last
          visited.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Link href={routes.home}>
            <Button>Back to home</Button>
          </Link>
          <Link href={routes.auth.continue}>
            <Button variant="secondary">Go to my workspace</Button>
          </Link>
        </div>

        <nav aria-label="Suggested pages" className="mt-12 w-full max-w-lg">
          <h2 className="type-overline mb-3 text-faint">Popular destinations</h2>
          <ul className="flex list-none flex-wrap justify-center gap-2 p-0">
            {suggestions.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="type-small inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-line bg-surface px-3.5 font-medium text-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
