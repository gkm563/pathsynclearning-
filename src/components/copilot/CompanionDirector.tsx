"use client";

import { useEffect, useState } from "react";
import { useSyncExternalStore } from "react";
import type { CopilotInteract } from "@/lib/ai/copilot-interact";
import type { CopilotNavigate } from "@/lib/ai/copilot-types";
import {
  companionStandPoint,
  findMoreButton,
  inferCompanionIntent,
  pressCompanionTarget,
  resolveCompanionTarget,
  scanCompanionTargets,
} from "./companion-targets";
import {
  defaultChatSize,
  defaultFabPos,
  finishCompanionWalk,
  getCompanionPos,
  homeBesidePinnedChat,
  pinCompanionChat,
  placeChat,
  setCompanionActing,
  setCompanionTapping,
  walkCompanionTo,
} from "./copilot-layout";

type CompanionJob = {
  interact: CopilotInteract[];
  navigate: CopilotNavigate[];
};

const jobs = new Map<number, CompanionJob>();
let generation = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function enqueueCompanionJob(next: CompanionJob) {
  generation += 1;
  jobs.set(generation, next);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getGeneration() {
  return generation;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function clickElement(
  el: HTMLElement,
  ctx: { cancelled: () => boolean; setRing: (rect: DOMRect | null) => void },
) {
  el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  await sleep(180);
  if (ctx.cancelled()) return false;
  ctx.setRing(el.getBoundingClientRect());
  await walkCompanionTo(companionStandPoint(el));
  if (ctx.cancelled()) return false;
  setCompanionTapping(true);
  await sleep(220);
  pressCompanionTarget(el);
  setCompanionTapping(false);
  await sleep(280);
  ctx.setRing(null);
  return true;
}

async function clickOnScreen(
  step: CopilotInteract,
  ctx: { cancelled: () => boolean; setRing: (rect: DOMRect | null) => void },
) {
  scanCompanionTargets();
  let el = resolveCompanionTarget(step);
  if (!el) {
    const more = findMoreButton();
    if (more && displayedApprox(more)) {
      await clickElement(more, ctx);
      if (ctx.cancelled()) return false;
      await sleep(320);
      scanCompanionTargets();
      el = resolveCompanionTarget(step);
    }
  }
  if (!el) return false;
  return clickElement(el, ctx);
}

function displayedApprox(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = el.getBoundingClientRect();
  return rect.width >= 4 && rect.height >= 4;
}

function mergeSteps(input: CompanionJob): CopilotInteract[] {
  const steps: CopilotInteract[] = [];
  const seen = new Set<string>();
  const push = (step: CopilotInteract) => {
    const hrefKey = (step.href || "").split("?")[0];
    const key = `${step.id || ""}|${hrefKey}|${(step.label || "").toLowerCase()}`;
    if (seen.has(key)) return;
    if (hrefKey && seen.has(`href:${hrefKey}`)) return;
    seen.add(key);
    if (hrefKey) seen.add(`href:${hrefKey}`);
    steps.push(step);
  };
  for (const step of input.interact) push(step);
  for (const nav of input.navigate) {
    const inferred = inferCompanionIntent(`${nav.label} ${nav.href}`);
    push(inferred || { type: "click", href: nav.href, label: nav.label });
  }
  return steps.slice(0, 3);
}

export function CompanionDirector() {
  const queued = useSyncExternalStore(subscribe, getGeneration, () => 0);
  const [ring, setRing] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!queued) return;
    const next = jobs.get(queued);
    if (!next) return;
    let cancelled = false;

    const run = async () => {
      const steps = mergeSteps(next);
      if (!steps.length) return;
      setCompanionActing(true);
      const companion = getCompanionPos() ?? defaultFabPos();
      const size = defaultChatSize();
      pinCompanionChat(placeChat(companion, size));
      scanCompanionTargets();

      try {
        for (const step of steps) {
          if (cancelled) return;
          const clicked = await clickOnScreen(step, {
            cancelled: () => cancelled,
            setRing,
          });
          if (clicked) continue;
        }
      } finally {
        if (!cancelled) {
          jobs.delete(queued);
          const home = homeBesidePinnedChat(defaultChatSize());
          if (home) await walkCompanionTo(home);
          pinCompanionChat(null);
          setRing(null);
          setCompanionTapping(false);
          setCompanionActing(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
      finishCompanionWalk(false);
      pinCompanionChat(null);
      setCompanionActing(false);
      setCompanionTapping(false);
    };
  }, [queued]);

  if (!ring) return null;

  return (
    <div
      aria-hidden
      className="companion-target-ring pointer-events-none fixed z-[calc(var(--z-overlay)+1)] rounded-[18px]"
      style={{
        left: ring.left - 6,
        top: ring.top - 6,
        width: ring.width + 12,
        height: ring.height + 12,
      }}
    />
  );
}
