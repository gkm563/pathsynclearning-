import { Compass, Layers, Target, TrendingUp, type LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  img: string;
};

const FEATURES: readonly Feature[] = [
  {
    icon: Target,
    title: "Choose your goal",
    desc: "Pick your dream role—SDE, DevOps, ML Engineer, or Product. Our AI maps it to the exact skills top companies hire for.",
    img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Compass,
    title: "Build your roadmap",
    desc: "AI-generated skill paths built on real hiring data and core technical standards.",
    img: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Layers,
    title: "Learn & practice",
    desc: "Targeted resources, hands-on labs, DSA challenges, and real-world project tracks with peer review.",
    img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: TrendingUp,
    title: "Track & reflect",
    desc: "Monitor your Career Readiness Index live, archive your Memory Lane, and unlock nodes as you level up.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
];

/**
 * Static feature grid. Hover treatment is pure CSS, so this stays a server
 * component; the aspect-ratio wrapper reserves the image box up front to keep
 * the section free of layout shift.
 */
export default function VisualFeatures() {
  return (
    <section
      aria-labelledby="workflow-heading"
      className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[var(--measure-content)]">
        <div className="mx-auto max-w-[40rem] text-center">
          <p className="type-overline text-accent">Core workflow</p>
          <h2 id="workflow-heading" className="type-h1 mt-3 text-ink">
            The blueprint for your career launchpad
          </h2>
          <p className="type-body-lg mt-4 text-muted">
            Every step is designed to optimize your readiness. No more guessing
            what to learn next — just targeted progression.
          </p>
        </div>

        <ol className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:mt-16 xl:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <li
              key={feature.title}
              className="group flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] duration-[var(--duration-normal)] ease-[var(--ease-standard)] hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-md)] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-sunken">
                <img
                  src={feature.img}
                  alt={feature.title}
                  width={800}
                  height={500}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-standard)] group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
                />
                <span
                  aria-hidden
                  className="absolute top-3 left-3 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-line bg-surface text-primary shadow-[var(--shadow-sm)]"
                >
                  <feature.icon size={18} strokeWidth={1.75} />
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col p-5">
                <p className="type-overline text-faint">
                  Step {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="type-h3 mt-2 text-ink">{feature.title}</h3>
                <p className="type-small mt-2 text-muted">{feature.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
