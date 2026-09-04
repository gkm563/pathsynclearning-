"use client";

import Link from "next/link";
import { ArrowRight, Map, Newspaper, Route } from "lucide-react";
import { routes, techNewsArticlePath } from "@/lib/routes";
import type { ProgressNextAction } from "@/lib/progress/types";
import type { NewsArticleDto } from "@/lib/news/types";
import { HOME, homeUi } from "./tokens";
import { SectionLabel } from "./shared";

type Props = {
  nextAction: ProgressNextAction | null;
  news: NewsArticleDto[];
  newsLoading: boolean;
};

export function FocusAndNews({ nextAction, news, newsLoading }: Props) {
  const href =
    nextAction?.href ||
    (nextAction?.kind === "caught_up" ? routes.app.roadmap : routes.app.challenges);

  return (
    <div className="grid grid-cols-1 gap-[18px] min-[901px]:grid-cols-[1fr_1.2fr]">
      <div className={homeUi.card}>
        <SectionLabel tone="teal">Next focus</SectionLabel>
        <h3 className={homeUi.cardTitle}>
          {nextAction?.title || "Continue your path"}
        </h3>
        <p className={homeUi.blockSub}>
          {nextAction?.subtitle ||
            "Pick up where you left off on roadmap or challenges."}
        </p>
        {typeof nextAction?.remainingTasks === "number" &&
        nextAction.remainingTasks > 0 ? (
          <p className="mt-2.5 mb-0 font-['Fira_Code',monospace] text-[11px] font-bold text-[#0f766e]">
            {nextAction.remainingTasks} remaining in this track
          </p>
        ) : null}
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#0f766e,#0369a1)] px-[18px] py-3 font-[Outfit,sans-serif] text-[0.95rem] font-extrabold text-white no-underline shadow-[0_10px_24px_rgba(15,118,110,0.25)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          Continue <ArrowRight size={16} />
        </Link>
        <div className="mt-[18px] flex flex-wrap gap-2.5">
          <Link
            href={routes.app.roadmap}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-alt)] px-3 py-2 text-[0.85rem] font-bold text-[var(--text-main)] no-underline transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-[rgba(15,118,110,0.4)]"
          >
            <Route size={15} /> Roadmap
          </Link>
          <Link
            href={routes.app.progress}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-alt)] px-3 py-2 text-[0.85rem] font-bold text-[var(--text-main)] no-underline transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-[rgba(15,118,110,0.4)]"
          >
            <Map size={15} /> Progress
          </Link>
          <Link
            href={routes.app.techNews}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-alt)] px-3 py-2 text-[0.85rem] font-bold text-[var(--text-main)] no-underline transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-[rgba(15,118,110,0.4)]"
          >
            <Newspaper size={15} /> Tech news
          </Link>
        </div>
      </div>

      <div className={homeUi.card}>
        <div className={homeUi.headRow}>
          <div>
            <SectionLabel tone="ocean">Tech news</SectionLabel>
            <h3 className={homeUi.cardTitle}>Latest for you</h3>
          </div>
          <Link href={routes.app.techNews} className={homeUi.textLink}>
            Browse
          </Link>
        </div>

        {newsLoading ? (
          <div className="flex flex-col gap-2.5">
            <div className={`${homeUi.skel} h-16`} />
            <div className={`${homeUi.skel} h-16`} />
            <div className={`${homeUi.skel} h-16`} />
          </div>
        ) : news.length === 0 ? (
          <p className={homeUi.emptyInline}>No articles yet. Check back soon.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {news.map((item) => (
              <li key={item.id}>
                <Link
                  href={techNewsArticlePath(item.id)}
                  className="flex flex-col gap-1.5 rounded-[14px] border border-[var(--border-light)] bg-[var(--bg-alt)] px-3.5 py-3 no-underline transition-[border-color,transform] duration-200 hover:translate-x-0.5 hover:border-[rgba(3,105,161,0.35)]"
                >
                  <span
                    className="self-start rounded-lg px-2 py-0.5 font-['Fira_Code',monospace] text-[10px] font-extrabold"
                    style={{ color: HOME.ocean, background: HOME.oceanSoft }}
                  >
                    {String(item.category || "TECH").toUpperCase()}
                  </span>
                  <span className="font-[Outfit,sans-serif] text-[0.95rem] leading-snug font-extrabold text-[var(--text-main)]">
                    {item.title}
                  </span>
                  <span className="text-[0.8rem] font-semibold text-[var(--text-muted)]">
                    {item.sourceName}
                    {item.readingMinutes
                      ? ` · ${item.readingMinutes} min`
                      : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
