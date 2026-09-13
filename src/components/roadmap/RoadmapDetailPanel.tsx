"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useDragControls,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  X,
  Clock,
  ExternalLink,
  Book,
  Video,
  Code,
  CheckCircle,
  SkipForward,
  Play,
  Lock,
  ClipboardCheck,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  StickyNote,
  ListChecks,
  GraduationCap,
  Sparkles,
  History,
  Plus,
} from "lucide-react";
import type { RoadmapNode, RoadmapNodeResource } from "@/types/roadmap";
import {
  getNodeAssessments,
  isAssessableNode,
  nodeRequiresAssessment,
} from "@/lib/roadmap/assessment";
import { AddNoteButton, NotesForSource } from "@/components/memory-lane/AddNoteButton";
import StudyRoomTutor, { type TutorChrome } from "@/components/roadmap/StudyRoomTutor";
import { Alert, Badge, Button, Card, IconButton, Segmented, Tabs } from "@/components/ui";
import { cn } from "@/lib/cn";

type PanelTab = "overview" | "resources";
type SideRail = "playlist" | "notes" | "tutor";
type MobileStudyTab = "playlist" | "overview" | "resources";
type StudyBubble = "tutor" | "notes";

const STUDY_BUBBLE_H_KEY = "pathed:study-bubble-height";
const STUDY_BUBBLE_W_KEY = "pathed:study-bubble-width";
const STUDY_RAIL_KEY = "pathed:study-rail-width";
const STUDY_FS_KEY = "pathed:study-room-fullscreen";
const STUDY_RAIL_DEFAULT = 402;
const STUDY_RAIL_MIN = 280;
const STUDY_RAIL_MAX = 760;
const SHEET_MID_PCT = 66;
const SHEET_FULL_PCT = 90;
const SHEET_SPRING = { type: "spring" as const, stiffness: 380, damping: 34, mass: 0.8 };

function loadStudyFullscreenPref() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STUDY_FS_KEY) === "1";
  } catch {
    return false;
  }
}

function saveStudyFullscreenPref(on: boolean) {
  try {
    window.localStorage.setItem(STUDY_FS_KEY, on ? "1" : "0");
  } catch {
    // private mode
  }
}

function clampStudyRail(width: number, viewport = 1200) {
  const max = Math.min(STUDY_RAIL_MAX, Math.max(STUDY_RAIL_MIN, Math.floor(viewport * 0.58)));
  return Math.min(max, Math.max(STUDY_RAIL_MIN, Math.round(width)));
}

function loadStudyRailWidth() {
  if (typeof window === "undefined") return STUDY_RAIL_DEFAULT;
  const n = Number(window.localStorage.getItem(STUDY_RAIL_KEY));
  if (!Number.isFinite(n)) return STUDY_RAIL_DEFAULT;
  return clampStudyRail(n, window.innerWidth);
}

const STUDY_BUBBLE_H_MIN = 0.42;
const STUDY_BUBBLE_H_DEFAULT = 0.72;
const STUDY_BUBBLE_W_MIN = 300;
const STUDY_BUBBLE_W_MAX = 720;
const STUDY_BUBBLE_W_DEFAULT = 420;
const BUBBLE_SPRING = { type: "spring" as const, stiffness: 420, damping: 36, mass: 0.72 };

function loadStudyBubbleHeight() {
  if (typeof window === "undefined") return STUDY_BUBBLE_H_DEFAULT;
  try {
    const h = Number(window.localStorage.getItem(STUDY_BUBBLE_H_KEY));
    if (Number.isFinite(h) && h >= STUDY_BUBBLE_H_MIN && h <= 1) return h;
  } catch {
    /* ignore */
  }
  return STUDY_BUBBLE_H_DEFAULT;
}

function loadStudyBubbleWidth() {
  if (typeof window === "undefined") return STUDY_BUBBLE_W_DEFAULT;
  try {
    const w = Number(window.localStorage.getItem(STUDY_BUBBLE_W_KEY));
    if (Number.isFinite(w) && w >= STUDY_BUBBLE_W_MIN && w <= STUDY_BUBBLE_W_MAX) return w;
  } catch {
    /* ignore */
  }
  return STUDY_BUBBLE_W_DEFAULT;
}

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.split("/").filter(Boolean)[0] || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") return parts[1] || null;
    }
  } catch {
    return null;
  }
  return null;
}

function youtubeEmbedUrl(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
}

function youtubeThumb(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
}

function isYoutubeVideo(r: RoadmapNodeResource) {
  return r.type === "video" && /youtube\.com|youtu\.be/i.test(r.url);
}

export default function RoadmapDetailPanel({
  node,
  allNodes,
  onStatusChange,
  onTakeAssessment,
  onClose,
  onExpandedChange,
}: {
  node: RoadmapNode | null;
  allNodes: RoadmapNode[];
  onStatusChange: (id: string, status: string) => void | Promise<void>;
  onTakeAssessment?: (id: string) => void;
  onClose: () => void;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<PanelTab>("overview");
  const [sideRail, setSideRail] = useState<SideRail>("playlist");
  const [studyBubble, setStudyBubble] = useState<StudyBubble | null>(null);
  const [sheetSnap, setSheetSnap] = useState<"mid" | "full">("mid");
  const sheetDragControls = useDragControls();
  const sheetPct = useMotionValue(SHEET_MID_PCT);
  const sheetHeightCss = useTransform(sheetPct, (v) => `${v}%`);
  const sheetAnim = useRef<{ stop: () => void } | null>(null);
  const [activeVideo, setActiveVideo] = useState(0);
  const [railWidth, setRailWidth] = useState(STUDY_RAIL_DEFAULT);
  const [narrowStudy, setNarrowStudy] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024,
  );
  const [mobileStudyTab, setMobileStudyTab] = useState<MobileStudyTab>("playlist");
  const [railDragging, setRailDragging] = useState(false);
  const [isStudyFullscreen, setIsStudyFullscreen] = useState(false);
  const studyRoomRef = useRef<HTMLDivElement>(null);
  const draggingRail = useRef(false);
  const railDrag = useRef({ x: 0, w: STUDY_RAIL_DEFAULT });
  const railWidthRef = useRef(STUDY_RAIL_DEFAULT);
  const railRaf = useRef(0);
  railWidthRef.current = railWidth;
  const [tutorChrome, setTutorChrome] = useState<TutorChrome | null>(null);
  const [bubbleResizing, setBubbleResizing] = useState(false);
  const bubbleHeightRef = useRef(STUDY_BUBBLE_H_DEFAULT);
  const bubbleWidthRef = useRef(STUDY_BUBBLE_W_DEFAULT);
  const bubbleRaf = useRef(0);
  const bubbleAnim = useRef<{ stop: () => void } | null>(null);
  const bubbleHMv = useMotionValue(STUDY_BUBBLE_H_DEFAULT * 100);
  const bubbleWMv = useMotionValue(STUDY_BUBBLE_W_DEFAULT);
  const bubbleHeightCss = useTransform(bubbleHMv, (v) => `${v}%`);
  const bubbleWidthCss = useTransform(bubbleWMv, (v) => `${v}px`);

  useEffect(() => {
    setExpanded(false);
    setTab("overview");
    setSideRail("playlist");
    setStudyBubble(null);
    setSheetSnap("mid");
    sheetPct.set(SHEET_MID_PCT);
    setMobileStudyTab("playlist");
    setActiveVideo(0);
  }, [node?.id]);

  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);

  useEffect(() => {
    if (!node) onExpandedChange?.(false);
  }, [node, onExpandedChange]);

  useEffect(() => {
    if (narrowStudy || !studyBubble) return;
    setSideRail(studyBubble);
    setStudyBubble(null);
  }, [narrowStudy, studyBubble]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      // Browser exits fullscreen first; don't also close the room.
      if (e.key !== "Escape" || document.fullscreenElement) return;
      if (studyBubble) {
        setStudyBubble(null);
        return;
      }
      setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, studyBubble]);

  useEffect(() => {
    const sync = () => {
      setIsStudyFullscreen(document.fullscreenElement === studyRoomRef.current);
    };
    document.addEventListener("fullscreenchange", sync);
    sync();
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const enterStudyFullscreen = async () => {
    const el = studyRoomRef.current;
    if (!el || document.fullscreenElement === el) return;
    try {
      await el.requestFullscreen();
    } catch {
      // permission / policy — stay in the in-canvas study room
    }
  };

  const exitStudyFullscreen = async () => {
    if (document.fullscreenElement !== studyRoomRef.current) return;
    try {
      await document.exitFullscreen();
    } catch {
      // ignore
    }
  };

  const toggleStudyFullscreen = async () => {
    if (document.fullscreenElement === studyRoomRef.current) {
      saveStudyFullscreenPref(false);
      await exitStudyFullscreen();
      return;
    }
    saveStudyFullscreenPref(true);
    await enterStudyFullscreen();
  };

  useEffect(() => {
    if (!expanded) {
      void exitStudyFullscreen();
      return;
    }
    if (window.matchMedia("(max-width: 1023px)").matches) return;
    if (loadStudyFullscreenPref()) {
      void enterStudyFullscreen();
    }
  }, [expanded]);

  useEffect(() => {
    setRailWidth(loadStudyRailWidth());
    const h = loadStudyBubbleHeight();
    const w = loadStudyBubbleWidth();
    bubbleHeightRef.current = h;
    bubbleHMv.set(h * 100);
    bubbleWidthRef.current = w;
    bubbleWMv.set(w);
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setNarrowStudy(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const stopRailDrag = () => {
    if (!draggingRail.current) return;
    draggingRail.current = false;
    setRailDragging(false);
    if (railRaf.current) {
      cancelAnimationFrame(railRaf.current);
      railRaf.current = 0;
    }
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    try {
      window.localStorage.setItem(STUDY_RAIL_KEY, String(railWidthRef.current));
    } catch {
      /* ignore */
    }
  };

  const moveRailDrag = (clientX: number) => {
    if (!draggingRail.current) return;
    const next = clampStudyRail(railDrag.current.w + (railDrag.current.x - clientX), window.innerWidth);
    railWidthRef.current = next;
    if (railRaf.current) return;
    railRaf.current = requestAnimationFrame(() => {
      railRaf.current = 0;
      setRailWidth(railWidthRef.current);
    });
  };

  function persistBubbleSize() {
    try {
      window.localStorage.setItem(STUDY_BUBBLE_H_KEY, String(bubbleHeightRef.current));
      window.localStorage.setItem(STUDY_BUBBLE_W_KEY, String(bubbleWidthRef.current));
    } catch {
      /* ignore */
    }
  }

  function springBubbleSize(nextH = bubbleHeightRef.current, nextW = bubbleWidthRef.current) {
    bubbleAnim.current?.stop();
    const h = animate(bubbleHMv, nextH * 100, {
      ...BUBBLE_SPRING,
      velocity: bubbleHMv.getVelocity(),
    });
    const w = animate(bubbleWMv, nextW, {
      ...BUBBLE_SPRING,
      velocity: bubbleWMv.getVelocity(),
    });
    bubbleAnim.current = {
      stop: () => {
        h.stop();
        w.stop();
      },
    };
    bubbleHeightRef.current = nextH;
    bubbleWidthRef.current = nextW;
    persistBubbleSize();
  }

  function springSheetPct(next: number) {
    sheetAnim.current?.stop();
    sheetAnim.current = animate(sheetPct, next, SHEET_SPRING);
  }

  function openStudyBubble(kind: StudyBubble) {
    const targetH = bubbleHeightRef.current;
    const targetW = bubbleWidthRef.current;
    bubbleAnim.current?.stop();
    bubbleHMv.set(Math.max(STUDY_BUBBLE_H_MIN * 100, targetH * 78));
    bubbleWMv.set(Math.max(STUDY_BUBBLE_W_MIN, targetW * 0.92));
    setStudyBubble(kind);
    requestAnimationFrame(() => {
      springBubbleSize(targetH, targetW);
    });
  }

  function startBubbleResize(e: React.PointerEvent, axis: "height" | "width") {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    bubbleAnim.current?.stop();
    const startY = e.clientY;
    const startX = e.clientX;
    const startH = bubbleHMv.get() / 100;
    const startW = bubbleWMv.get();
    setBubbleResizing(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      if (bubbleRaf.current) return;
      bubbleRaf.current = requestAnimationFrame(() => {
        bubbleRaf.current = 0;
        if (axis === "height") {
          const room = studyRoomRef.current?.getBoundingClientRect();
          if (!room || room.height <= 0) return;
          const next = Math.min(1, Math.max(STUDY_BUBBLE_H_MIN, startH + (startY - ev.clientY) / room.height));
          bubbleHeightRef.current = next;
          bubbleHMv.set(next * 100);
        } else {
          const nextW = Math.min(
            STUDY_BUBBLE_W_MAX,
            Math.max(STUDY_BUBBLE_W_MIN, startW + (startX - ev.clientX)),
          );
          bubbleWidthRef.current = nextW;
          bubbleWMv.set(nextW);
        }
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (bubbleRaf.current) cancelAnimationFrame(bubbleRaf.current);
      bubbleRaf.current = 0;
      setBubbleResizing(false);
      springBubbleSize(bubbleHeightRef.current, bubbleWidthRef.current);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  useEffect(() => {
    const onUp = () => stopRailDrag();
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointercancel", onUp, true);
    window.addEventListener("blur", onUp);
    document.addEventListener("visibilitychange", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onUp, true);
      window.removeEventListener("blur", onUp);
      document.removeEventListener("visibilitychange", onUp);
      if (railRaf.current) cancelAnimationFrame(railRaf.current);
    };
  }, []);

  const status = node?.status ?? "locked";
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";
  const isSkipped = status === "skipped";
  const depCount = node?.dependencies?.length ?? 0;
  const examList = node ? getNodeAssessments(node) : [];
  const needsExam = node ? nodeRequiresAssessment(node) : false;
  const hasExam = node ? isAssessableNode(node) : false;

  const lockedHint = isLocked
    ? depCount > 0
      ? `Complete ${depCount} prerequisite${depCount === 1 ? "" : "s"} first.`
      : "Complete prerequisite nodes first."
    : null;

  const rawResources = node?.resources || [];
  const hasSuggestedFlag = rawResources.some((r) => r.suggested);
  const ytAll = rawResources.filter(isYoutubeVideo);
  const ytLessons = hasSuggestedFlag
    ? ytAll.filter((r) => !r.suggested)
    : ytAll.slice(0, Math.min(2, ytAll.length));
  const ytSuggested = hasSuggestedFlag
    ? ytAll.filter((r) => r.suggested)
    : ytAll.slice(ytLessons.length);
  const ytResources = [...ytLessons, ...ytSuggested];
  const otherResources = rawResources.filter((r) => !isYoutubeVideo(r));

  const currentVideo =
    ytResources.length > 0 ? ytResources[Math.min(activeVideo, ytResources.length - 1)] : null;
  const currentEmbed = currentVideo ? youtubeEmbedUrl(currentVideo.url) : null;

  const openStudyRoom = async (markInProgress = false) => {
    if (!node || isLocked) return;
    if (markInProgress && !isInProgress && !isCompleted) {
      await onStatusChange(node.id, "in_progress");
    }
    setExpanded(true);
    setSideRail("playlist");
    setStudyBubble(null);
    setMobileStudyTab(ytResources.length > 0 ? "playlist" : "overview");
    setTab("overview");
  };

  const footerActions = (
    <div className="flex gap-2 sm:gap-3">
      {!isCompleted && !isLocked && hasExam && onTakeAssessment && (
        <Button className="min-w-0 flex-1" onClick={() => onTakeAssessment(node!.id)}>
          <ClipboardCheck size={18} /> Take Assessment
        </Button>
      )}
      {!isCompleted && !isLocked && !needsExam && (
        <Button className="min-w-0 flex-1" onClick={() => onStatusChange(node!.id, "completed")}>
          <CheckCircle size={18} /> Mark Complete
        </Button>
      )}
      {!isInProgress && !isCompleted && !isLocked && (
        <Button className="min-w-0 flex-1" onClick={() => void openStudyRoom(true)}>
          <Play size={18} /> Start Learning
        </Button>
      )}
      {isInProgress && !expanded && (
        <Button className="min-w-0 flex-1" onClick={() => void openStudyRoom(false)}>
          <Maximize2 size={18} /> Open Study Room
        </Button>
      )}
      {!isSkipped && !isCompleted && !isLocked && !needsExam && (
        <IconButton
          label="Skip"
          variant="secondary"
          onClick={() => onStatusChange(node!.id, "skipped")}
        >
          <SkipForward size={18} />
        </IconButton>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {node && !expanded && narrowStudy ? (
        <motion.button
          key="node-sheet-backdrop"
          type="button"
          aria-label="Close"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-[19] bg-[color-mix(in_srgb,var(--ink)_32%,transparent)]"
          onClick={onClose}
        />
      ) : null}
      {node && !expanded && (
        <motion.div
          key={node.id}
          initial={narrowStudy ? { y: "100%" } : { x: 48, opacity: 0 }}
          animate={narrowStudy ? { y: 0 } : { x: 0, opacity: 1 }}
          exit={narrowStudy ? { y: "100%" } : { x: 48, opacity: 0 }}
          transition={SHEET_SPRING}
          drag={narrowStudy ? "y" : false}
          dragControls={sheetDragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.12, bottom: 0.55 }}
          onDragEnd={(_, info) => {
            if (!narrowStudy) return;
            const dy = info.offset.y;
            const vy = info.velocity.y;
            if (sheetSnap === "full") {
              if (dy > 160 || vy > 900) onClose();
              else if (dy > 56 || vy > 450) {
                setSheetSnap("mid");
                springSheetPct(SHEET_MID_PCT);
              }
            } else if (dy > 90 || vy > 650) {
              onClose();
            } else if (dy < -48 || vy < -400) {
              setSheetSnap("full");
              springSheetPct(SHEET_FULL_PCT);
            }
          }}
          className="absolute inset-x-0 bottom-0 z-20 flex w-full flex-col overflow-hidden rounded-t-[var(--radius-xl)] border-t border-line bg-surface shadow-[var(--shadow-xl)] lg:inset-y-0 lg:right-0 lg:left-auto lg:top-0 lg:h-full lg:w-[400px] lg:rounded-none lg:border-t-0 lg:border-l"
          style={narrowStudy ? { height: sheetHeightCss, maxHeight: "100%" } : undefined}
        >
          <div
            className="flex shrink-0 cursor-grab touch-none flex-col items-center pt-2 pb-1 active:cursor-grabbing lg:hidden"
            onPointerDown={(e) => sheetDragControls.start(e)}
          >
            <span className="h-1.5 w-12 rounded-full bg-[var(--border-strong)]" />
            <span className="sr-only">Drag to expand or close</span>
          </div>
          <div
            className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-4 py-3 sm:p-6 max-lg:touch-none"
            onPointerDown={(e) => {
              if (!narrowStudy) return;
              if ((e.target as HTMLElement).closest("button, a, input, textarea")) return;
              sheetDragControls.start(e);
            }}
          >
            <div className="min-w-0 flex-1">
              <Badge tone="accent">
                {node.type} · {status.replace("_", " ")}
                {hasExam
                  ? examList.length > 1
                    ? ` · ${examList.length} assessments`
                    : ` · ${examList[0]?.type}`
                  : ""}
              </Badge>
              <h2 className="type-h3 mt-2 mb-0 text-ink lg:mt-3">{node.title}</h2>
              {node.source === "loop_refresh" ? (
                <p className="type-caption mt-2 mb-0 text-primary">
                  Review again — new materials. Previous assessment attempts do not count.
                </p>
              ) : null}
              {node.source === "remediation" ? (
                <p className="type-caption mt-2 mb-0 text-primary">
                  Added after interview to close a weak topic.
                </p>
              ) : null}
              <div className="mt-2 hidden flex-wrap gap-2 lg:flex">
                <AddNoteButton
                  sourceType="roadmap_node"
                  sourceId={node.id}
                  defaultTitle={node.title}
                  contextLabel={`Roadmap · ${node.title}`}
                  links={[{ entityType: "roadmap_node", entityId: node.id }]}
                  compact
                />
                <Button size="sm" variant="outline" onClick={() => void openStudyRoom(false)}>
                  <Maximize2 size={14} /> Full study
                </Button>
              </div>
            </div>
            <IconButton label="Close" onClick={onClose}>
              <X size={20} />
            </IconButton>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:p-6">
            <CompactOverview
              node={node}
              ytLessons={ytLessons}
              ytSuggested={ytSuggested}
              otherResources={otherResources}
              needsExam={needsExam}
              onOpenStudy={() => void openStudyRoom(false)}
              onPlayIndex={(i) => {
                setActiveVideo(i);
                void openStudyRoom(false);
              }}
            />
          </div>

          <div className="mt-auto flex shrink-0 flex-col gap-2 border-t border-line bg-surface px-4 py-3 sm:gap-3 sm:p-6">
            {lockedHint && (
              <Alert tone="warning">
                {lockedHint}
                {node.dependencies?.length
                  ? ` (${node.dependencies
                      .map((id) => allNodes.find((n) => n.id === id)?.title || id)
                      .join(", ")})`
                  : ""}
              </Alert>
            )}
            {footerActions}
          </div>
        </motion.div>
      )}

      {node && expanded && (
        <motion.div
          key="study-room"
          ref={studyRoomRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[var(--z-modal)] flex flex-col overflow-hidden bg-canvas pt-[env(safe-area-inset-top)] lg:absolute lg:z-40 lg:pt-0"
        >
          <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-line bg-surface px-2 text-ink lg:h-14 lg:gap-4 lg:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-1 lg:gap-2.5">
              {narrowStudy ? (
                <IconButton
                  label="Back to roadmap"
                  size="sm"
                  onClick={() => setExpanded(false)}
                >
                  <ChevronLeft size={20} />
                </IconButton>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 px-3"
                  onClick={() => setExpanded(false)}
                >
                  <ChevronLeft size={20} />
                  Roadmap
                </Button>
              )}
              {!narrowStudy ? (
                <div className="h-5 w-px shrink-0 bg-[var(--border-light)]" />
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="type-label truncate text-ink">
                  {node.title}
                </div>
                {!narrowStudy ? (
                  <div className="type-caption truncate text-muted">
                    {status.replace("_", " ")}
                    {node.estimatedHours ? ` · ~${node.estimatedHours}h` : ""}
                    {ytResources.length
                      ? ` · ${ytResources.length} lesson${ytResources.length === 1 ? "" : "s"}`
                      : ""}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5 lg:gap-2">
              {!isCompleted && !isLocked && !needsExam ? (
                narrowStudy ? (
                  <IconButton
                    label="Mark complete"
                    size="sm"
                    onClick={() => onStatusChange(node.id, "completed")}
                  >
                    <CheckCircle size={18} />
                  </IconButton>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onStatusChange(node.id, "completed")}
                  >
                    <CheckCircle size={16} /> Mark complete
                  </Button>
                )
              ) : null}
              {!isCompleted && !isLocked && hasExam && onTakeAssessment ? (
                narrowStudy ? (
                  <IconButton
                    label="Take assessment"
                    size="sm"
                    onClick={() => onTakeAssessment(node.id)}
                  >
                    <ClipboardCheck size={18} />
                  </IconButton>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onTakeAssessment(node.id)}
                  >
                    <ClipboardCheck size={16} /> Assessment
                  </Button>
                )
              ) : null}
              {!narrowStudy ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void toggleStudyFullscreen()}
                >
                  {isStudyFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  {isStudyFullscreen ? "Exit full screen" : "Full screen"}
                </Button>
              ) : null}
              <IconButton
                label="Close study room"
                size={narrowStudy ? "sm" : "md"}
                onClick={() => {
                  setExpanded(false);
                  onClose();
                }}
              >
                <X size={18} />
              </IconButton>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-canvas text-ink">
            {narrowStudy ? (
              <div className="mx-auto flex w-full max-w-[40rem] flex-col px-3 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div
                  className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-inverse shadow-[var(--shadow-md)]"
                  style={{ paddingBottom: "56.25%" }}
                >
                  {currentEmbed ? (
                    <iframe
                      key={currentEmbed}
                      src={currentEmbed}
                      title={currentVideo?.title || node.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center p-4 text-center type-small text-muted">
                      No video lesson for this topic yet. Use playlist, notes, or the tutor below.
                    </div>
                  )}
                </div>

                <h1 className="type-h4 mt-3 mb-1 text-ink">
                  {currentVideo?.title || node.title}
                </h1>
                <div className="mb-3 flex flex-wrap items-center gap-2 type-caption text-muted">
                  {ytResources.length > 0 ? (
                    <span>
                      {Math.min(activeVideo, ytResources.length - 1) + 1} / {ytResources.length}
                      {currentVideo?.suggested ? " · Suggested" : ""}
                    </span>
                  ) : null}
                  {currentVideo ? (
                    <a
                      href={currentVideo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-accent no-underline"
                    >
                      YouTube <ExternalLink size={12} />
                    </a>
                  ) : null}
                </div>

                {ytResources.length > 1 ? (
                  <div className="mb-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      disabled={activeVideo <= 0}
                      onClick={() => setActiveVideo((i) => Math.max(0, i - 1))}
                    >
                      <ChevronLeft size={16} /> Prev
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      disabled={activeVideo >= ytResources.length - 1}
                      onClick={() => setActiveVideo((i) => Math.min(ytResources.length - 1, i + 1))}
                    >
                      Next <ChevronRight size={16} />
                    </Button>
                  </div>
                ) : null}

                <Tabs
                  ariaLabel="Study sections"
                  items={[
                    {
                      id: "playlist",
                      label: "Playlist",
                      icon: <Video size={14} />,
                      badge: ytResources.length || undefined,
                    },
                    { id: "overview", label: "Overview", icon: <GraduationCap size={14} /> },
                    {
                      id: "resources",
                      label: "Reading",
                      icon: <Book size={14} />,
                      badge: otherResources.length || undefined,
                    },
                  ]}
                  value={mobileStudyTab}
                  onChange={(id) => setMobileStudyTab(id as MobileStudyTab)}
                />

                <div className="mt-3">
                  {mobileStudyTab === "playlist" ? (
                    ytResources.length === 0 ? (
                      <p className="type-small m-0 rounded-[var(--radius-md)] border border-line bg-surface p-4 text-muted">
                        No video playlist for this topic. Use the AI or notes bubbles.
                      </p>
                    ) : (
                      <div className="overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface">
                        {ytLessons.map((res, i) => (
                          <PlaylistRow
                            key={`${res.url}-${i}`}
                            res={res}
                            index={i}
                            active={i === activeVideo}
                            onSelect={() => setActiveVideo(i)}
                            compact
                          />
                        ))}
                        {ytSuggested.length > 0 ? (
                          <div className="type-overline border-b border-line bg-sunken px-3 py-2 text-muted">
                            Suggested
                          </div>
                        ) : null}
                        {ytSuggested.map((res, i) => {
                          const idx = ytLessons.length + i;
                          return (
                            <PlaylistRow
                              key={`${res.url}-s-${i}`}
                              res={res}
                              index={idx}
                              active={idx === activeVideo}
                              onSelect={() => setActiveVideo(idx)}
                              suggested
                              compact
                            />
                          );
                        })}
                      </div>
                    )
                  ) : null}

                  {mobileStudyTab === "overview" ? (
                    <Card>
                      <StudyOverview node={node} needsExam={needsExam} />
                    </Card>
                  ) : null}

                  {mobileStudyTab === "resources" ? (
                    <Card>
                      {otherResources.length > 0 ? (
                        <ResourceList resources={otherResources} />
                      ) : (
                        <p className="type-body m-0 text-muted">
                          No extra docs for this node. Use the playlist or the notes bubble.
                        </p>
                      )}
                    </Card>
                  ) : null}
                </div>
              </div>
            ) : (
            <div
              className="roadmap-study-grid mx-auto w-full max-w-[1600px] px-6 py-5 pb-8"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 0,
                boxSizing: "border-box",
              }}
            >
              <div className="min-w-0 flex-1">
                <div
                  className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-inverse shadow-[var(--shadow-md)]"
                  style={{
                    paddingBottom: "56.25%",
                    pointerEvents: railDragging ? "none" : undefined,
                  }}
                >
                  {currentEmbed ? (
                    <iframe
                      key={currentEmbed}
                      src={currentEmbed}
                      title={currentVideo?.title || node.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center p-6 text-center type-small text-muted">
                      No video lesson for this topic yet. Use resources and notes below.
                    </div>
                  )}
                </div>

                <h1 className="type-h3 mt-4 mb-2 text-ink">
                  {currentVideo?.title || node.title}
                </h1>

                <div className="mb-3.5 flex flex-wrap items-center gap-2.5 type-small text-muted">
                  {ytResources.length > 0 ? (
                    <span>
                      Video {Math.min(activeVideo, ytResources.length - 1) + 1} / {ytResources.length}
                      {currentVideo?.suggested ? " · Suggested" : " · Lesson"}
                    </span>
                  ) : null}
                  <Badge>{node.type}</Badge>
                  {currentVideo ? (
                    <a
                      href={currentVideo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-accent no-underline"
                    >
                      Open on YouTube <ExternalLink size={12} />
                    </a>
                  ) : null}
                  {currentVideo?.channel ? <span>{currentVideo.channel}</span> : null}
                </div>

                {ytResources.length > 1 ? (
                  <div className="mb-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={activeVideo <= 0}
                      onClick={() => setActiveVideo((i) => Math.max(0, i - 1))}
                    >
                      <ChevronLeft size={16} /> Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={activeVideo >= ytResources.length - 1}
                      onClick={() => setActiveVideo((i) => Math.min(ytResources.length - 1, i + 1))}
                    >
                      Next video <ChevronRight size={16} />
                    </Button>
                  </div>
                ) : null}

                <Tabs
                  ariaLabel="Study sections"
                  items={[
                    { id: "overview", label: "Overview", icon: <GraduationCap size={14} /> },
                    {
                      id: "resources",
                      label: "Suggested reading",
                      icon: <Book size={14} />,
                      badge: otherResources.length || undefined,
                    },
                  ]}
                  value={tab}
                  onChange={(id) => setTab(id as PanelTab)}
                />

                <Card className="mt-4">
                  {tab === "overview" && <StudyOverview node={node} needsExam={needsExam} />}
                  {tab === "resources" &&
                    (otherResources.length > 0 ? (
                      <ResourceList resources={otherResources} />
                    ) : (
                      <p className="type-body m-0 text-muted">
                        No extra docs for this node. Watch the playlist in the player — every video
                        plays in the same window.
                      </p>
                    ))}
                </Card>
              </div>

              {!narrowStudy ? (
                <div
                  role="separator"
                  aria-orientation="vertical"
                  aria-valuenow={railWidth}
                  aria-label="Resize study sidebar"
                  title="Drag to resize · double-click to reset"
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    draggingRail.current = true;
                    setRailDragging(true);
                    railDrag.current = { x: e.clientX, w: railWidthRef.current };
                    document.body.style.cursor = "col-resize";
                    document.body.style.userSelect = "none";
                  }}
                  onPointerMove={(e) => {
                    if (!draggingRail.current) return;
                    moveRailDrag(e.clientX);
                  }}
                  onPointerUp={(e) => {
                    try {
                      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                      }
                    } catch {
                      /* already released */
                    }
                    stopRailDrag();
                  }}
                  onPointerCancel={() => stopRailDrag()}
                  onLostPointerCapture={() => stopRailDrag()}
                  onDoubleClick={() => {
                    stopRailDrag();
                    const next = clampStudyRail(STUDY_RAIL_DEFAULT, window.innerWidth);
                    railWidthRef.current = next;
                    setRailWidth(next);
                    try {
                      window.localStorage.setItem(STUDY_RAIL_KEY, String(next));
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="relative z-[2] mx-0.5 w-2.5 shrink-0 cursor-col-resize self-stretch touch-none"
                >
                  <div
                    className={cn(
                      "absolute top-3 bottom-3 left-1/2 w-0.5 -ml-[1.5px] rounded-full",
                      railDragging ? "bg-primary" : "bg-[var(--border-light)]",
                    )}
                  />
                </div>
              ) : null}

              <aside
                className="sticky top-0 flex shrink-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]"
                style={{
                  width: railWidth,
                  minHeight: 0,
                  height: "calc(100vh - 120px)",
                  maxHeight: "calc(100vh - 120px)",
                  alignSelf: "start",
                }}
              >
                <div className="shrink-0 border-b border-line bg-sunken p-2">
                  <Segmented
                    size="sm"
                    fullWidth
                    ariaLabel="Study sidebar"
                    value={sideRail}
                    onChange={(id) => setSideRail(id as SideRail)}
                    items={[
                      { id: "playlist", label: "Playlist", icon: <Video size={14} /> },
                      { id: "notes", label: "Notes", icon: <StickyNote size={14} /> },
                      { id: "tutor", label: "AI", icon: <Sparkles size={14} /> },
                    ]}
                  />
                </div>
                {sideRail === "tutor" && tutorChrome ? (
                  <div className="flex shrink-0 items-center justify-end gap-0.5 border-b border-line px-1.5 py-1">
                    <IconButton
                      size="sm"
                      label={tutorChrome.showHistory ? "Back to chat" : "Chat history"}
                      variant={tutorChrome.showHistory ? "secondary" : "ghost"}
                      onClick={tutorChrome.toggleHistory}
                    >
                      <History size={16} />
                    </IconButton>
                    <IconButton
                      size="sm"
                      label="New chat"
                      onClick={tutorChrome.startNewChat}
                      disabled={tutorChrome.busy}
                    >
                      <Plus size={16} />
                    </IconButton>
                  </div>
                ) : null}
                <div
                  className={cn(
                    "min-h-0 flex-1",
                    sideRail === "tutor"
                      ? "flex flex-col overflow-hidden"
                      : "overflow-auto",
                  )}
                  style={{ overscrollBehavior: "contain" }}
                >
                  {sideRail === "playlist" ? (
                    ytResources.length === 0 ? (
                      <p className="type-small m-0 p-4 leading-relaxed text-muted">
                        No video playlist for this topic. Open Notes or AI in this sidebar while you
                        read.
                      </p>
                    ) : (
                      <>
                        {ytLessons.length > 0 ? (
                          <div className="type-overline border-b border-line bg-sunken px-3 py-2.5 text-muted">
                            Lessons
                          </div>
                        ) : null}
                        {ytLessons.map((res, i) => (
                          <PlaylistRow
                            key={`${res.url}-${i}`}
                            res={res}
                            index={i}
                            active={i === activeVideo}
                            onSelect={() => setActiveVideo(i)}
                          />
                        ))}
                        {ytSuggested.length > 0 ? (
                          <div className="type-overline border-b border-line bg-sunken px-3 py-2.5 text-muted">
                            Suggested · other channels
                          </div>
                        ) : null}
                        {ytSuggested.map((res, i) => {
                          const idx = ytLessons.length + i;
                          return (
                            <PlaylistRow
                              key={`${res.url}-s-${i}`}
                              res={res}
                              index={idx}
                              active={idx === activeVideo}
                              onSelect={() => setActiveVideo(idx)}
                              suggested
                            />
                          );
                        })}
                      </>
                    )
                  ) : null}
                  {sideRail === "notes" ? (
                    <div className="p-3">
                      <NotesForSource
                        sourceType="roadmap_node"
                        sourceId={node.id}
                        defaultTitle={node.title}
                        contextLabel={`Roadmap · ${node.title}`}
                        links={[{ entityType: "roadmap_node", entityId: node.id }]}
                        emptyHint="Capture takeaways while you watch — notes stay linked to this node."
                        inline
                      />
                    </div>
                  ) : null}
                  {sideRail === "tutor" ? (
                    <StudyRoomTutor
                      node={node}
                      videoTitle={currentVideo?.title}
                      videoChannel={currentVideo?.channel}
                      embedded
                      onChrome={setTutorChrome}
                    />
                  ) : null}
                </div>
              </aside>
            </div>
            )}
          </div>

          {narrowStudy && !studyBubble ? (
            <div className="absolute bottom-4 left-3 right-3 z-40 flex items-end justify-between">
              <button
                type="button"
                aria-label="Notes"
                onClick={() => openStudyBubble("notes")}
                className="grid h-14 w-14 place-items-center rounded-full border border-line bg-surface text-primary shadow-[var(--shadow-lg)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <StickyNote size={22} />
              </button>
              <button
                type="button"
                aria-label="AI Tutor"
                onClick={() => openStudyBubble("tutor")}
                className="grid h-14 w-14 place-items-center rounded-full border border-line bg-surface text-primary shadow-[var(--shadow-lg)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Sparkles size={22} />
              </button>
            </div>
          ) : null}

          <AnimatePresence>
            {narrowStudy && studyBubble ? (
              <>
                <motion.button
                  key="study-bubble-backdrop"
                  type="button"
                  aria-label="Close panel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 z-30 bg-[color-mix(in_srgb,var(--ink)_28%,transparent)]"
                  onClick={() => setStudyBubble(null)}
                />
                <motion.div
                  key={studyBubble}
                  role="dialog"
                  aria-label={studyBubble === "tutor" ? "AI Tutor" : "Notes"}
                  initial={{ y: "32%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "28%", opacity: 0 }}
                  transition={
                    bubbleResizing
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 34, mass: 0.8 }
                  }
                  className={cn(
                    "absolute bottom-0 z-30 flex flex-col overflow-hidden border-t border-line bg-surface shadow-[var(--shadow-xl)]",
                    narrowStudy
                      ? "inset-x-0 rounded-t-[var(--radius-xl)]"
                      : "right-6 rounded-[var(--radius-xl)] border",
                  )}
                  style={{
                    height: bubbleHeightCss,
                    maxHeight: "calc(100% - 3rem)",
                    width: narrowStudy ? "100%" : bubbleWidthCss,
                    maxWidth: "100%",
                    willChange: bubbleResizing ? "height, width" : undefined,
                  }}
                >
                  <div
                    role="separator"
                    aria-orientation="horizontal"
                    aria-label="Resize panel height"
                    title="Drag to resize · double-click to reset"
                    onPointerDown={(e) => startBubbleResize(e, "height")}
                    onDoubleClick={() => springBubbleSize(STUDY_BUBBLE_H_DEFAULT, bubbleWidthRef.current)}
                    className="flex h-5 shrink-0 cursor-ns-resize items-center justify-center touch-none hover:bg-sunken"
                  >
                    <motion.span
                      className={cn(
                        "h-1 w-10 rounded-full",
                        bubbleResizing ? "bg-primary" : "bg-ink/20",
                      )}
                      animate={{ scaleX: bubbleResizing ? 1.35 : 1 }}
                      transition={BUBBLE_SPRING}
                    />
                  </div>
                  {!narrowStudy ? (
                    <div
                      role="separator"
                      aria-orientation="vertical"
                      aria-label="Resize panel width"
                      title="Drag to resize · double-click to reset"
                      onPointerDown={(e) => startBubbleResize(e, "width")}
                      onDoubleClick={() => springBubbleSize(bubbleHeightRef.current, STUDY_BUBBLE_W_DEFAULT)}
                      className="absolute left-0 top-5 bottom-0 z-10 w-2 cursor-ew-resize touch-none hover:bg-ink/5"
                    />
                  ) : null}
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {studyBubble === "tutor" ? (
                        <Sparkles size={16} className="text-primary" />
                      ) : (
                        <StickyNote size={16} className="text-primary" />
                      )}
                      <span className="type-label text-ink">
                        {studyBubble === "tutor" ? "AI Tutor" : "Notes"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {studyBubble === "tutor" && tutorChrome ? (
                        <>
                          <IconButton
                            size="sm"
                            label={tutorChrome.showHistory ? "Back to chat" : "Chat history"}
                            variant={tutorChrome.showHistory ? "secondary" : "ghost"}
                            onClick={tutorChrome.toggleHistory}
                          >
                            <History size={16} />
                          </IconButton>
                          <IconButton
                            size="sm"
                            label="New chat"
                            onClick={tutorChrome.startNewChat}
                            disabled={tutorChrome.busy}
                          >
                            <Plus size={16} />
                          </IconButton>
                        </>
                      ) : null}
                      <IconButton size="sm" label="Close panel" onClick={() => setStudyBubble(null)}>
                        <X size={18} />
                      </IconButton>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "min-h-0 flex-1",
                      studyBubble === "tutor" ? "flex flex-col overflow-hidden" : "overflow-y-auto p-3",
                    )}
                  >
                    {studyBubble === "tutor" ? (
                      <StudyRoomTutor
                        node={node}
                        videoTitle={currentVideo?.title}
                        videoChannel={currentVideo?.channel}
                        embedded
                        onChrome={setTutorChrome}
                      />
                    ) : (
                      <NotesForSource
                        sourceType="roadmap_node"
                        sourceId={node.id}
                        defaultTitle={node.title}
                        contextLabel={`Roadmap · ${node.title}`}
                        links={[{ entityType: "roadmap_node", entityId: node.id }]}
                        emptyHint="Capture takeaways while you watch — notes stay linked to this node."
                        inline
                      />
                    )}
                  </div>
                </motion.div>
              </>
            ) : null}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlaylistRow({
  res,
  index,
  active,
  onSelect,
  suggested,
  compact,
}: {
  res: RoadmapNodeResource;
  index: number;
  active: boolean;
  onSelect: () => void;
  suggested?: boolean;
  compact?: boolean;
}) {
  const thumb = youtubeThumb(res.url);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "grid w-full items-center border-0 border-b border-line text-left text-ink",
        compact
          ? "grid-cols-[20px_88px_1fr] gap-2 px-2 py-2"
          : "grid-cols-[24px_120px_1fr] gap-2.5 px-3 py-2.5",
        active ? "bg-primary-soft" : "bg-transparent",
      )}
    >
      <span className={cn("text-center type-caption", active ? "text-primary" : "text-muted")}>
        {active ? <Play size={12} fill="var(--primary)" color="var(--primary)" /> : index + 1}
      </span>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-line bg-sunken",
          compact ? "h-12 w-[88px]" : "h-[68px] w-[120px]",
        )}
      >
        {thumb ? (
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <Video size={18} className="text-muted" />
          </div>
        )}
        {active ? (
          <div className="absolute inset-0 grid place-items-center bg-[var(--primary-border)]">
            <span className="type-overline rounded bg-primary px-1.5 py-0.5 text-[var(--text-on-primary)]">
              Now
            </span>
          </div>
        ) : null}
      </div>
      <div className="min-w-0">
        <div className="type-label line-clamp-2 leading-snug">{res.title}</div>
        <div className="type-caption mt-1 text-muted">
          {suggested ? "Suggested · " : ""}
          {res.channel || "YouTube"}
        </div>
      </div>
    </button>
  );
}

function CompactVideoList({
  title,
  items,
  indexOffset,
  onPlayIndex,
}: {
  title: string;
  items: RoadmapNodeResource[];
  indexOffset: number;
  onPlayIndex: (i: number) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="mb-6">
      <h3 className="type-h4 mb-2 text-ink">{title}</h3>
      <div className="flex flex-col gap-2">
        {items.map((res, i) => {
          const thumb = youtubeThumb(res.url);
          return (
            <button
              key={`${res.url}-${indexOffset + i}`}
              type="button"
              onClick={() => onPlayIndex(indexOffset + i)}
              className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-line bg-sunken p-2 text-left text-ink"
            >
              <div className="relative h-[50px] w-[88px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-inverse">
                {thumb ? (
                  <img src={thumb} alt="" className="h-full w-full object-cover" />
                ) : null}
                <div className="absolute inset-0 grid place-items-center bg-[color-mix(in_srgb,var(--bg-inverse)_25%,transparent)]">
                  <Play size={16} className="text-on-inverse" fill="currentColor" />
                </div>
              </div>
              <span className="type-label">
                {res.title}
                {res.channel ? (
                  <span className="mt-0.5 block font-medium type-caption text-muted">
                    {res.channel}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CompactOverview({
  node,
  ytLessons,
  ytSuggested,
  otherResources,
  needsExam,
  onOpenStudy,
  onPlayIndex,
}: {
  node: RoadmapNode;
  ytLessons: RoadmapNodeResource[];
  ytSuggested: RoadmapNodeResource[];
  otherResources: RoadmapNodeResource[];
  needsExam: boolean;
  onOpenStudy: () => void;
  onPlayIndex: (i: number) => void;
}) {
  return (
    <>
      {node.estimatedHours ? (
        <div className="mb-5 flex items-center gap-2 text-muted">
          <Clock size={16} />
          <span className="type-body">Estimated time: {node.estimatedHours} hours</span>
        </div>
      ) : null}

      {node.description ? (
        <div className="mb-6">
          <h3 className="type-h4 mb-2 text-ink">About this topic</h3>
          <p className="type-body m-0 text-muted">{node.description}</p>
        </div>
      ) : null}

      {node.whyLearn && (
        <div className="mb-6">
          <h3 className="type-h4 mb-2 text-ink">Why learn this?</h3>
          <p className="type-body m-0 text-muted">{node.whyLearn}</p>
        </div>
      )}

      {node.interviewFocus ? (
        <div className="mb-6">
          <h3 className="type-h4 mb-2 text-ink">Interview focus</h3>
          <p className="type-body m-0 text-muted">{node.interviewFocus}</p>
        </div>
      ) : null}

      {node.learningOutcomes && node.learningOutcomes.length > 0 ? (
        <div className="mb-6">
          <h3 className="type-h4 mb-2 text-ink">You will be able to</h3>
          <ul className="type-body m-0 list-disc pl-5 text-muted">
            {node.learningOutcomes.map((item, i) => (
              <li key={i} className="mb-1">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {node.topics && node.topics.length > 0 && (
        <div className="mb-6">
          <h3 className="type-h4 mb-2 text-ink">Key Topics</h3>
          <ul className="type-body m-0 list-disc pl-5 text-muted">
            {node.topics.map((topic, i) => (
              <li key={i} className="mb-1">
                {topic}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(ytLessons.length > 0 || ytSuggested.length > 0) && (
        <div className="mb-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="type-h4 m-0 text-ink">Watch in study room</h3>
            <Button size="sm" variant="ghost" onClick={onOpenStudy}>
              Open player →
            </Button>
          </div>
          <p className="type-small mb-3 text-muted">
            Every video plays in the same player. Suggested clips from other channels are listed
            separately so they are not mixed with core lessons.
          </p>
          <CompactVideoList title="Lessons" items={ytLessons} indexOffset={0} onPlayIndex={onPlayIndex} />
          <CompactVideoList
            title="Suggested from other channels"
            items={ytSuggested}
            indexOffset={ytLessons.length}
            onPlayIndex={onPlayIndex}
          />
        </div>
      )}

      {otherResources.length > 0 && (
        <div className="mb-6">
          <h3 className="type-h4 mb-2 text-ink">Suggested reading</h3>
          <ResourceList resources={otherResources} />
        </div>
      )}

      {needsExam && (
        <Alert>
          <span className="inline-flex items-start gap-2">
            <ListChecks size={16} className="mt-0.5 shrink-0 text-primary" />
            <span>
              Pass{" "}
              {(() => {
                const exams = getNodeAssessments(node);
                return exams.length > 1
                  ? `all ${exams.length} assessments (${exams.map((a) => a.type).join(", ")})`
                  : `a proctored ${node.assessment?.type === "coding" ? "coding" : "MCQ"} assessment`;
              })()}{" "}
              to unlock the next nodes.
            </span>
          </span>
        </Alert>
      )}
    </>
  );
}

function StudyOverview({
  node,
  needsExam,
  dark,
}: {
  node: RoadmapNode;
  needsExam: boolean;
  dark?: boolean;
}) {
  const muted = dark ? "var(--text-inverse)" : undefined;
  const main = dark ? "var(--text-inverse)" : undefined;

  return (
    <div className="grid gap-4">
      {node.description ? (
        <div>
          <h3 className="type-h4 mb-2 text-ink" style={{ color: main }}>
            About
          </h3>
          <p className="type-body m-0 text-muted" style={{ color: muted }}>
            {node.description}
          </p>
        </div>
      ) : null}
      {node.whyLearn ? (
        <div>
          <h3 className="type-h4 mb-2 text-ink" style={{ color: main }}>
            Why learn this?
          </h3>
          <p className="type-body m-0 text-muted" style={{ color: muted }}>
            {node.whyLearn}
          </p>
        </div>
      ) : null}
      {node.interviewFocus ? (
        <div>
          <h3 className="type-h4 mb-2 text-ink" style={{ color: main }}>
            Interview focus
          </h3>
          <p className="type-body m-0 text-muted" style={{ color: muted }}>
            {node.interviewFocus}
          </p>
        </div>
      ) : null}
      {node.learningOutcomes?.length ? (
        <div>
          <h3 className="type-h4 mb-2 text-ink" style={{ color: main }}>
            You will be able to
          </h3>
          <ul className="type-body m-0 list-disc pl-4.5 text-muted" style={{ color: muted }}>
            {node.learningOutcomes.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {node.topics?.length ? (
        <div>
          <h3 className="type-h4 mb-2 text-ink" style={{ color: main }}>
            Key topics
          </h3>
          <ul className="type-body m-0 list-disc pl-4.5 text-muted" style={{ color: muted }}>
            {node.topics.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {node.skills?.length ? (
        <div className="flex flex-wrap gap-2">
          {node.skills.map((skill) => (
            <Badge key={skill} tone="accent">
              {skill}
            </Badge>
          ))}
        </div>
      ) : null}
      {needsExam ? (
        <p className="type-body m-0 text-muted" style={{ color: muted }}>
          {getNodeAssessments(node).length > 1
            ? `Pass all ${getNodeAssessments(node).length} assessments on this node to unlock what comes next.`
            : "Assessment required after this topic to unlock the next nodes."}
        </p>
      ) : null}
    </div>
  );
}

function ResourceList({
  resources,
  dark,
}: {
  resources: RoadmapNodeResource[];
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {resources.map((res, i) => (
        <a
          key={`${res.url}-${i}`}
          href={res.url}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "flex items-center justify-between rounded-[var(--radius-sm)] p-3 type-body no-underline",
            dark ? "border border-line bg-inverse text-on-inverse" : "bg-sunken text-ink",
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            {res.type === "video" ? (
              <Video size={16} className="text-accent" />
            ) : res.type === "practice" || res.type === "project" ? (
              <Code size={16} className="text-success" />
            ) : (
              <Book size={16} className="text-primary" />
            )}
            <span className="overflow-hidden text-ellipsis">
              {res.title}
              {res.channel ? ` · ${res.channel}` : ""}
            </span>
          </div>
          <ExternalLink size={14} className="text-muted" />
        </a>
      ))}
    </div>
  );
}
