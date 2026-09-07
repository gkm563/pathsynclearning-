"use client";

import { cn } from "@/lib/cn";
import type { ImageRow } from "./content";
import {
  Kicker,
  MediaFrame,
  Reveal,
  SectionBlock,
  SplitRow,
  bodyClass,
  headingClass,
} from "./shell";

/** Renders one copy-beside-photograph band from a typed content record. */
export default function ImageRowSection({ row }: { row: ImageRow }) {
  const headingId = `${row.slug}-title`;
  const inverse = row.tone === "inverse";

  return (
    <SectionBlock id={row.id} tone={row.tone} labelledBy={headingId}>
      <SplitRow
        mediaFirst={row.mediaFirst}
        media={
          <Reveal delay={0.06}>
            <MediaFrame
              src={row.image.src}
              alt={row.image.alt}
              className={inverse ? "border-on-inverse/15 bg-inverse" : undefined}
            />
          </Reveal>
        }
      >
        <Reveal>
          <Kicker variant={row.kickerVariant}>{row.kicker}</Kicker>
          <h2 id={headingId} className={cn("type-h1 mt-5", headingClass(row.tone))}>
            {row.title}
          </h2>
          {row.body.map((paragraph) => (
            <p
              key={paragraph}
              className={cn("type-body-lg mt-4", bodyClass(row.tone))}
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      </SplitRow>
    </SectionBlock>
  );
}
