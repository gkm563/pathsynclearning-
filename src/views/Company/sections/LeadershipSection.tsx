"use client";

import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

type TeamMember = {
  readonly name: string;
  readonly role: string;
  readonly img: string;
  /**
   * Crop anchor for the portrait. Kept as a token rather than an inline
   * `object-position` so the whole card stays style-attribute free.
   */
  readonly crop?: "top" | "center";
};

const TEAM: readonly TeamMember[] = [
  {
    name: "Rahul Kushwaha",
    role: "CEO & Chief Designer",
    img: "/team/Rahul Kushwaha.jpeg",
  },
  {
    name: "Devesh Singh",
    role: "Head of Research and Development",
    img: "/team/Devesh SIngh.jpeg",
  },
  {
    name: "Ayush Yadav",
    role: "Chief Engineer & Developer",
    img: "/team/Ayush yadav.jpg",
  },
  {
    name: "Prabhat Pandey",
    role: "Chief Technical Head",
    img: "/team/Prabhat Pandey.jpg",
    crop: "top",
  },
];

export default function LeadershipSection() {
  return (
    <section
      aria-labelledby="leadership-title"
      className="border-b border-line bg-sunken"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="min-w-0 max-w-2xl">
          <p className="type-overline text-primary">Leadership</p>
          <h2 id="leadership-title" className="type-h1 mt-3 text-ink">
            The architects behind the platform
          </h2>
        </Reveal>

        <ul className="mt-10 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {TEAM.map((member, index) => (
            <Reveal
              as="li"
              key={member.name}
              delay={index * 0.05}
              className="min-w-0"
            >
              <article className="flex h-full min-w-0 flex-col items-center rounded-[var(--radius-lg)] border border-line bg-surface p-6 text-center shadow-[var(--shadow-xs)]">
                <div className="h-28 w-28 overflow-hidden rounded-full border border-primary-border bg-sunken">
                  <img
                    src={member.img}
                    alt={`Portrait of ${member.name}`}
                    width={224}
                    height={224}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "h-full w-full object-cover",
                      member.crop === "top" ? "object-top" : "object-center",
                    )}
                  />
                </div>
                <h3 className="type-h3 mt-5 text-ink">{member.name}</h3>
                <p className="type-overline mt-2 text-primary">{member.role}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
