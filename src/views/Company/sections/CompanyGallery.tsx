"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Reveal } from "./Reveal";

/**
 * Behind-the-scenes photo wall.
 *
 * The photos are atmospheric rather than informative, so each one is marked
 * decorative; the visible count is exposed to assistive tech through a polite
 * live region instead, which is what actually changes when "Load more" runs.
 */

const GALLERY_IMAGES: readonly string[] = [
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1531496730074-83b638c0a7ac?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
  // 16 images above — the rest arrive through "Load more".
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1521737711867-e3cb66cb3cb6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
];

/** Photos revealed on first paint and added by each "Load more" press. */
const GALLERY_PAGE_SIZE = 16;

export default function CompanyGallery() {
  const [visibleGalleryCount, setVisibleGalleryCount] =
    useState(GALLERY_PAGE_SIZE);

  const visibleImages = GALLERY_IMAGES.slice(0, visibleGalleryCount);
  const hasMore = visibleGalleryCount < GALLERY_IMAGES.length;

  return (
    <section
      aria-labelledby="gallery-title"
      className="border-b border-line bg-canvas"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="min-w-0 max-w-2xl">
          <p className="type-overline text-accent">Behind the scenes</p>
          <h2 id="gallery-title" className="type-h1 mt-3 text-ink">
            PathEd company gallery
          </h2>
          <p className="type-body-lg mt-5 text-muted">
            A glimpse into our workspaces, hackathons, and the people building
            the future of education.
          </p>
        </Reveal>

        <ul className="mt-10 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {visibleImages.map((src, index) => (
            <Reveal
              as="li"
              key={src + index}
              delay={Math.min(index % GALLERY_PAGE_SIZE, 7) * 0.03}
              className="min-w-0"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-md)] border border-line bg-sunken">
                <img
                  src={src}
                  alt=""
                  aria-hidden
                  width={600}
                  height={450}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-3">
          <p role="status" aria-live="polite" className="type-small text-muted">
            Showing {visibleImages.length} of {GALLERY_IMAGES.length} photos
          </p>
          {hasMore ? (
            <Button
              variant="secondary"
              size="lg"
              className="min-h-11"
              onClick={() =>
                setVisibleGalleryCount((prev) => prev + GALLERY_PAGE_SIZE)
              }
            >
              Load more
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
