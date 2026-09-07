import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/routes";

type Pillar = {
  img: string;
  title: string;
  desc: string;
  tag: string;
  href: string;
};

const PILLARS: readonly Pillar[] = [
  {
    img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    title: "Real-world projects",
    desc: "Stop building to-do apps. PathEd's HackAttack engine connects you with industry-grade projects that recruiters actually care about. Build in public, get reviewed by peers, and showcase verified work.",
    tag: "Experience",
    href: routes.marketing.platform,
  },
  {
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
    title: "Peer-to-peer community",
    desc: "You are not learning alone. Join a vibrant community of 40,000+ ambitious students. Find co-founders, get unstuck in minutes, and participate in exclusive weekend hackathons.",
    tag: "Network",
    href: routes.marketing.community,
  },
  {
    img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
    title: "AI-driven interview prep",
    desc: "Don't get caught off-guard. Our AI simulates real interview rounds—from DSA to HR—tailored specifically to the companies you are targeting. Get instant feedback on your STAR answers.",
    tag: "Placements",
    href: routes.marketing.methodology,
  },
];

/**
 * Alternating media/copy rows. Static, so it stays a server component; the
 * "Explore feature" affordance is a real link rather than the dead `<button>`
 * it used to be.
 */
export default function PlatformOverview() {
  return (
    <section
      aria-labelledby="pillars-heading"
      className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[var(--measure-content)]">
        <div className="mx-auto max-w-[40rem] text-center">
          <p className="type-overline text-primary">The ecosystem</p>
          <h2 id="pillars-heading" className="type-h1 mt-3 text-ink">
            More than just roadmaps
          </h2>
          <p className="type-body-lg mt-4 text-muted">
            PathEd is a complete ecosystem designed to transform students into
            high-value industry professionals.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:mt-16 lg:gap-8">
          {PILLARS.map((pillar, i) => (
            <article
              key={pillar.title}
              className={`grid min-w-0 items-center gap-6 rounded-[var(--radius-xl)] border border-line bg-surface p-4 shadow-[var(--shadow-xs)] sm:p-6 lg:grid-cols-2 lg:gap-12 lg:p-8 ${
                i % 2 === 1 ? "lg:[&>figure]:order-2" : ""
              }`}
            >
              <figure className="m-0 min-w-0 overflow-hidden rounded-[var(--radius-lg)] bg-sunken">
                <div className="aspect-[16/10] w-full">
                  <img
                    src={pillar.img}
                    alt={pillar.title}
                    width={800}
                    height={500}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              </figure>

              <div className="min-w-0 lg:px-2">
                <p className="type-overline text-accent">{pillar.tag}</p>
                <h3 className="type-h2 mt-3 text-ink">{pillar.title}</h3>
                <p className="type-body-lg type-prose mt-3 text-muted">
                  {pillar.desc}
                </p>
                <Link
                  href={pillar.href}
                  className="type-label group mt-5 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] text-primary transition-colors duration-[var(--duration-fast)] hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
                >
                  Explore feature
                  <ArrowRight
                    size={16}
                    aria-hidden
                    className="transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
