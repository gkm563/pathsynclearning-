"use client";

import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

type TeamMember = {
  readonly name: string;
  readonly role: string;
  readonly tag?: string;
  readonly img: string;
  readonly bio?: string;
  readonly crop?: "top" | "center";
};

const LEADERSHIP: readonly TeamMember[] = [
  {
    name: "Rahul Kushwaha",
    role: "Operations Lead",
    tag: "Founder",
    img: "/team/rahul-kushwaha.jpg",
    bio: "Overseeing platform development, operational workflows, and design systems.",
    crop: "center",
  },
  {
    name: "Gautam Kumar Maurya",
    role: "Technical Lead",
    tag: "Co-Founder",
    img: "/team/gautam-kumar-maurya.jpg",
    bio: "Driving core platform vision, system architecture, and technical execution.",
    crop: "center",
  },
  {
    name: "Ayush Yadav",
    role: "Technical Lead",
    tag: "Co-Founder",
    img: "/team/ayush-yadav.jpg",
    bio: "Architecting core infrastructure, developer pipelines, and platform reliability.",
    crop: "center",
  },
  {
    name: "Devesh Singh",
    role: "Research Lead",
    tag: "Co-Founder",
    img: "/team/devesh-singh.jpg",
    bio: "Heading product research, learning systems, and curriculum design.",
    crop: "center",
  },
  {
    name: "Ridhika Singh",
    role: "Business Lead",
    tag: "Co-Founder",
    img: "/team/ridhika-singh.jpg",
    bio: "Driving student operations, strategic growth, and business partnerships.",
    crop: "top",
  },
  {
    name: "Rohit Pal",
    role: "Marketing Lead",
    tag: "Leadership",
    img: "/team/rohit-pal.jpg",
    bio: "Leading social presence, brand growth, community engagement, and public outreach.",
    crop: "top",
  },
];

export default function LeadershipSection() {
  return (
    <section
      aria-labelledby="leadership-title"
      className="border-b border-line bg-sunken/40 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="type-overline text-primary font-bold tracking-wider">Co-Founders & Leadership</p>
          <h2 id="leadership-title" className="type-h1 mt-3 text-ink font-bold">
            The architects behind PathSync Learning
          </h2>
          <p className="type-body mx-auto mt-4 text-muted">
            Building the next generation of career readiness, industry mentorship, and verified proof-of-work for engineering students.
          </p>
        </Reveal>

        <ul className="mt-14 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {LEADERSHIP.map((member, index) => (
            <Reveal
              as="li"
              key={member.name}
              delay={index * 0.05}
              className="min-w-0"
            >
              <article className="group flex h-full min-w-0 flex-col items-center rounded-2xl border border-line bg-surface p-6 text-center shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
                <div className="relative mb-5 h-32 w-32 overflow-hidden rounded-2xl border-2 border-primary/20 bg-sunken shadow-md transition-transform duration-300 group-hover:scale-105">
                  <img
                    src={member.img}
                    alt={`Portrait of ${member.name}`}
                    width={256}
                    height={256}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "h-full w-full object-cover",
                      member.crop === "top" ? "object-top" : "object-center",
                    )}
                  />
                </div>

                <div className="flex flex-col items-center">
                  {member.tag && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
                      {member.tag}
                    </span>
                  )}
                  <h3 className="type-h3 font-bold text-ink">{member.name}</h3>
                  {member.role && member.role !== member.tag && (
                    <p className="type-overline mt-1 text-xs font-semibold tracking-wider text-primary">
                      {member.role}
                    </p>
                  )}
                  {member.bio && (
                    <p className="type-small mt-3 text-muted leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
