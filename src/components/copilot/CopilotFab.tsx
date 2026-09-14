"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  firstNameFrom,
  resolveCopilotName,
} from "@/lib/ai/copilot-identity";
import { copilotIdleLine } from "@/lib/ai/copilot-presence";
import { useStudent } from "@/components/dashboard/StudentContext";
import { CompanionAvatar } from "./CompanionAvatar";
import { useCopilot } from "./CopilotProvider";
import {
  FAB_MARGIN,
  FAB_SIZE,
  clampFab,
  defaultFabPos,
  finishCompanionWalk,
  getWalkTask,
  initCompanionPos,
  setCompanionPos,
  tabBarInset,
  useCompanionActing,
  useCompanionPos,
  useCompanionTapping,
  useCompanionWalkTask,
  type CompanionPos,
} from "./copilot-layout";

const DRAG_THRESHOLD = 8;
const FIRST_BUBBLE_MS = 2800;
const BUBBLE_GAP_MS = 48000;
const BUBBLE_HOLD_MS = 7000;

type MoveStyle = "walk" | "run" | "climb" | "jump";
type CompanionPose = "idle" | "walk" | "run" | "climb" | "jump" | "tap" | "wave" | "stretch" | "still";

const MOVE_SPEED: Record<MoveStyle, number> = {
  walk: 58,
  run: 158,
  climb: 44,
  jump: 124,
};

function pickMoveStyle(dx: number, dy: number, dist: number, guided: boolean): MoveStyle {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ay > 52 && ay > ax * 1.12) return "climb";
  if (dy < -40 && ax > 28) return "jump";
  if (guided && dist > 130) return ay > ax ? "climb" : "run";
  if (dist > 190) return "run";
  if (!guided && dist > 70 && Math.random() < 0.34) {
    return Math.random() < 0.45 ? "jump" : "run";
  }
  return "walk";
}

export function CopilotFab() {
  const { open, toggle, voiceActive, voiceAlwaysOn, voicePhase, heard, startVoice, stopVoice } = useCopilot();
  const student = useStudent();
  const pathname = usePathname() || "/dashboard";
  const reduceMotion = useReducedMotion();
  const name = resolveCopilotName(student.preferences.copilotName);
  const pos = useCompanionPos();
  const walkTask = useCompanionWalkTask();
  const tapping = useCompanionTapping();
  const acting = useCompanionActing();
  const [dragging, setDragging] = useState(false);
  const [pose, setPose] = useState<CompanionPose>("idle");
  const [lift, setLift] = useState(0);
  const [facing, setFacing] = useState<"left" | "right">("left");
  const [blurb, setBlurb] = useState<string | null>(null);
  const posRef = useRef<CompanionPos | null>(null);
  const draggingRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const poseRef = useRef<CompanionPose>("idle");
  const facingRef = useRef<"left" | "right">("left");
  const slotRef = useRef(0);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);
  const movedRef = useRef(false);
  const holdTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const next = initCompanionPos();
    posRef.current = next;
  }, []);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    function onResize() {
      const current = posRef.current ?? defaultFabPos();
      const next = clampFab(current);
      posRef.current = next;
      setCompanionPos(next);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (reduceMotion && !walkTask) {
      poseRef.current = "idle";
      setPose("idle");
      setLift(0);
      return;
    }

    let raf = 0;
    let last = performance.now();
    let target: CompanionPos | null = null;
    let move: MoveStyle = "walk";
    let tripDist = 1;
    let restUntil = performance.now() + 2800;
    let fidgetUntil = 0;
    let fidget: "wave" | "stretch" | "hop" | null = null;
    let fidgetStarted = 0;

    const pickTarget = (from: CompanionPos): CompanionPos => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const play = Math.random();
      for (let i = 0; i < 10; i += 1) {
        let next: CompanionPos;
        if (play < 0.22) {
          next = clampFab({
            x: from.x + (Math.random() * 36 - 18),
            y: FAB_MARGIN + Math.random() * Math.max(1, vh - FAB_SIZE - tabBarInset() - FAB_MARGIN),
          });
        } else if (play < 0.4) {
          next = clampFab({
            x: from.x,
            y: from.y - (80 + Math.random() * 160),
          });
        } else {
          next = clampFab({
            x: FAB_MARGIN + Math.random() * Math.max(1, vw - FAB_SIZE - FAB_MARGIN * 2),
            y: FAB_MARGIN + Math.random() * Math.max(1, vh - FAB_SIZE - tabBarInset() - FAB_MARGIN),
          });
        }
        if (Math.hypot(next.x - from.x, next.y - from.y) > 80) return next;
      }
      return clampFab(from);
    };

    const setPoseNow = (next: CompanionPose) => {
      if (poseRef.current === next) return;
      poseRef.current = next;
      setPose(next);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const current = posRef.current;
      const guided = getWalkTask();

      if (!current) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const moveToward = (goal: CompanionPos, style: MoveStyle, distance0: number) => {
        const dx = goal.x - current.x;
        const dy = goal.y - current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 6) {
          posRef.current = goal;
          setCompanionPos(goal);
          setLift(0);
          return true;
        }
        const nextFacing: "left" | "right" = style === "climb"
          ? facingRef.current
          : dx < -1
            ? "left"
            : "right";
        if (style !== "climb" && facingRef.current !== nextFacing) {
          facingRef.current = nextFacing;
          setFacing(nextFacing);
        }
        setPoseNow(style);
        const speed = MOVE_SPEED[style];
        const step = Math.min(dist, speed * dt);
        const next = clampFab({
          x: current.x + (dx / dist) * step,
          y: current.y + (dy / dist) * step,
        });
        const traveled = Math.min(1, Math.max(0, 1 - dist / Math.max(24, distance0)));
        if (style === "jump") setLift(Math.sin(traveled * Math.PI) * 46);
        else if (style === "run") setLift(Math.abs(Math.sin(now / 70)) * 5);
        else if (style === "climb") setLift(Math.abs(Math.sin(now / 140)) * 3);
        else setLift(0);
        posRef.current = next;
        setCompanionPos(next);
        return false;
      };

      if (guided) {
        fidget = null;
        if (reduceMotion) {
          posRef.current = { x: guided.x, y: guided.y };
          setCompanionPos(posRef.current);
          setLift(0);
          setPoseNow("idle");
          finishCompanionWalk(true);
          raf = requestAnimationFrame(tick);
          return;
        }
        const dx = guided.x - current.x;
        const dy = guided.y - current.y;
        const dist = Math.hypot(dx, dy);
        if (!target || target.x !== guided.x || target.y !== guided.y) {
          target = { x: guided.x, y: guided.y };
          tripDist = Math.max(24, dist);
          move = pickMoveStyle(dx, dy, dist, true);
        }
        if (moveToward(guided, move, tripDist)) {
          target = null;
          setPoseNow("idle");
          finishCompanionWalk(true);
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      const blocked =
        open ||
        voiceActive ||
        acting ||
        draggingRef.current ||
        Date.now() < pauseUntilRef.current ||
        reduceMotion;

      if (blocked) {
        target = null;
        fidget = null;
        setLift(0);
        if (poseRef.current !== "tap" && poseRef.current !== "still") setPoseNow("idle");
        raf = requestAnimationFrame(tick);
        return;
      }

      if (!target) {
        if (now < restUntil) {
          if (!fidget && now > fidgetUntil && now > restUntil - 400) {
            // wait
          }
          if (!fidget && now > restUntil - 1800 && Math.random() < 0.012) {
            const pick = Math.random();
            fidget = pick < 0.34 ? "wave" : pick < 0.62 ? "stretch" : "hop";
            fidgetStarted = now;
            fidgetUntil = now + (fidget === "hop" ? 620 : 1400);
          }
          if (fidget) {
            if (now >= fidgetUntil) {
              fidget = null;
              setLift(0);
              setPoseNow("idle");
            } else if (fidget === "hop") {
              const t = (now - fidgetStarted) / 620;
              setLift(Math.sin(Math.min(1, t) * Math.PI) * 28);
              setPoseNow("jump");
            } else {
              setLift(0);
              setPoseNow(fidget);
            }
          } else {
            setLift(0);
            setPoseNow("idle");
          }
          raf = requestAnimationFrame(tick);
          return;
        }
        target = pickTarget(current);
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        tripDist = Math.max(24, Math.hypot(dx, dy));
        move = pickMoveStyle(dx, dy, tripDist, false);
        fidget = null;
      }

      if (moveToward(target, move, tripDist)) {
        if (posRef.current) setCompanionPos(posRef.current, true);
        target = null;
        setPoseNow("idle");
        restUntil = now + 2200 + Math.random() * 4800;
        fidgetUntil = now + 700;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, reduceMotion, walkTask, acting, voiceActive]);

  useEffect(() => {
    if (open || reduceMotion) {
      setBlurb(null);
      return;
    }
    let showTimer: number | undefined;
    let hideTimer: number | undefined;
    const speak = () => {
      const line = copilotIdleLine({
        seed: student.studentRegistrationId || student.name,
        companionName: name,
        studentFirstName: firstNameFrom(student.shortName || student.name),
        pathname,
        streak: student.streak,
        cri: student.cri,
        hasRoadmap: Boolean(student.goal.role),
        featuredChallenge: student.dailyChallenges[0]?.title || null,
        hasImportedMemory: Boolean(student.preferences.copilotMemory),
        slot: slotRef.current,
      });
      slotRef.current += 1;
      setBlurb(line);
      hideTimer = window.setTimeout(() => setBlurb(null), BUBBLE_HOLD_MS);
    };
    const loop = (delay: number) => {
      showTimer = window.setTimeout(() => {
        speak();
        loop(BUBBLE_GAP_MS);
      }, delay);
    };
    loop(FIRST_BUBBLE_MS);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [
    open,
    reduceMotion,
    name,
    pathname,
    student.studentRegistrationId,
    student.name,
    student.shortName,
    student.streak,
    student.cri,
    student.goal.role,
    student.dailyChallenges[0]?.title,
    student.preferences.copilotMemory,
  ]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const current = posRef.current ?? defaultFabPos();
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origX: current.x,
      origY: current.y,
      moved: false,
    };
    movedRef.current = false;
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      if (drag.current?.moved) return;
      movedRef.current = true;
      startVoice();
    }, 480);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [startVoice]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const session = drag.current;
    if (!session || event.pointerId !== session.pointerId) return;
    const dx = event.clientX - session.startX;
    const dy = event.clientY - session.startY;
    if (!session.moved && dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
    session.moved = true;
    movedRef.current = true;
    window.clearTimeout(holdTimer.current);
    draggingRef.current = true;
    setDragging(true);
    setPose("still");
    poseRef.current = "still";
    setLift(0);
    pauseUntilRef.current = Date.now() + 14000;
    setBlurb(null);
    const next = clampFab({ x: session.origX + dx, y: session.origY + dy });
    posRef.current = next;
    setCompanionPos(next);
  }, []);

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    window.clearTimeout(holdTimer.current);
    const session = drag.current;
    if (!session || event.pointerId !== session.pointerId) return;
    if (session.moved && posRef.current) setCompanionPos(posRef.current, true);
    draggingRef.current = false;
    setDragging(false);
    drag.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
  }, []);

  const flipLeft = (pos?.x ?? 0) > (typeof window === "undefined" ? 400 : window.innerWidth / 2);
  const flipBelow = (pos?.y ?? 0) < 88;

  return (
    <div
      className="fixed"
      data-companion-ignore
      style={{
        zIndex: open || voiceActive ? "calc(var(--z-overlay) + 2)" : "var(--z-header)",
        ...(pos
          ? { left: pos.x, top: pos.y }
          : {
              right: 16,
              bottom:
                "calc(var(--mobile-tabbar-height) + 1rem + env(safe-area-inset-bottom, 0px))",
            }),
      }}
    >
      {voiceActive && (heard || voicePhase === "thinking") ? (
        <p
          className={cn(
            "pointer-events-none absolute z-10 max-w-[9.5rem] rounded-2xl border border-line bg-surface px-2.5 py-1 text-left shadow-[var(--shadow-sm)]",
            "type-caption font-semibold leading-snug text-ink",
            flipBelow ? "top-full mt-1" : "bottom-full mb-1",
            flipLeft ? "right-0" : "left-full ml-1",
          )}
        >
          {voicePhase === "thinking" ? "Thinking…" : heard}
        </p>
      ) : blurb && !open && !voiceActive ? (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "companion-bubble absolute z-10 max-w-44 rounded-[18px] border border-line bg-surface px-3 py-2 text-left shadow-[var(--shadow-md)]",
            "type-caption font-semibold leading-snug text-ink",
            flipBelow ? "top-full mt-2" : "bottom-full mb-2",
            flipLeft ? "right-0" : "left-0",
          )}
        >
          {blurb}
          <span
            className={cn(
              "absolute h-2.5 w-2.5 rotate-45 border-line bg-surface",
              flipBelow
                ? "-top-1 border-l border-t"
                : "-bottom-1 border-r border-b",
              flipLeft ? "right-3" : "left-3",
            )}
            aria-hidden
          />
        </button>
      ) : null}

      <div
        className={cn(
          "companion-bob relative",
          (dragging || lift > 2 || (pose !== "idle" && pose !== "wave" && pose !== "stretch")) && "is-walk",
          lift > 8 && "is-airborne",
          dragging && "is-dragging",
        )}
        style={lift > 0.5 ? { transform: `translateY(-${lift}px)` } : undefined}
      >
        <IconButton
          label={
            voiceActive
              ? `End voice with ${name}`
              : open
                ? `Close ${name}. Hold to talk.`
                : `Open ${name}. Hold to talk, drag to move.`
          }
          variant="ghost"
          size="lg"
          onClick={() => {
            if (movedRef.current) {
              movedRef.current = false;
              return;
            }
            if (voiceActive) {
              stopVoice();
              return;
            }
            toggle();
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="h-14 w-12 cursor-grab overflow-visible bg-transparent shadow-none touch-none select-none hover:bg-transparent active:cursor-grabbing"
        >
          <CompanionAvatar
            name={name}
            size="lg"
            pose={
              tapping
                ? "tap"
                : voicePhase === "speaking"
                  ? "wave"
                  : dragging
                    ? "still"
                    : pose
            }
            facing={facing}
          />
        </IconButton>
        {voiceAlwaysOn || voiceActive ? (
          <span
            className={cn(
              "companion-voice-pip pointer-events-none absolute right-0.5 top-1 h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_0_2px_var(--surface)]",
              voicePhase === "listening" && "is-live",
              voicePhase === "thinking" && "is-think",
            )}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}
