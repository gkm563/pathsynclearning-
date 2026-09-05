"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, ExternalLink, Book, Video, Code, CheckCircle, SkipForward, Play, Lock, ClipboardCheck,
  Maximize2, ChevronLeft, ChevronRight, StickyNote, ListChecks, GraduationCap,
} from 'lucide-react';
import type { RoadmapNode, RoadmapNodeResource } from '@/types/roadmap';
import { isAssessableNode, nodeRequiresAssessment } from '@/lib/roadmap/assessment';
import { AddNoteButton, NotesForSource } from '@/components/memory-lane/AddNoteButton';

type PanelTab = 'overview' | 'resources' | 'notes';
type SideRail = 'playlist' | 'notes';

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.split('/').filter(Boolean)[0] || null;
    if (u.hostname.includes('youtube.com')) {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') return parts[1] || null;
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
  return r.type === 'video' && /youtube\.com|youtu\.be/i.test(r.url);
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Outfit',
  fontSize: 16,
  color: 'var(--text-main)',
  marginBottom: 8,
};

const bodyText: React.CSSProperties = {
  fontFamily: 'Inter',
  fontSize: 14,
  color: 'var(--text-muted)',
  lineHeight: 1.6,
  margin: 0,
};

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
  const [tab, setTab] = useState<PanelTab>('overview');
  const [sideRail, setSideRail] = useState<SideRail>('playlist');
  const [activeVideo, setActiveVideo] = useState(0);

  useEffect(() => {
    setExpanded(false);
    setTab('overview');
    setSideRail('playlist');
    setActiveVideo(0);
  }, [node?.id]);

  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);

  useEffect(() => {
    if (!node) onExpandedChange?.(false);
  }, [node, onExpandedChange]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const status = node?.status ?? 'locked';
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';
  const isSkipped = status === 'skipped';
  const depCount = node?.dependencies?.length ?? 0;
  const needsExam = node ? nodeRequiresAssessment(node) : false;
  const hasExam = node ? isAssessableNode(node) : false;

  const lockedHint = isLocked
    ? depCount > 0
      ? `Complete ${depCount} prerequisite${depCount === 1 ? '' : 's'} first.`
      : 'Complete prerequisite nodes first.'
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
    ytResources.length > 0
      ? ytResources[Math.min(activeVideo, ytResources.length - 1)]
      : null;
  const currentEmbed = currentVideo ? youtubeEmbedUrl(currentVideo.url) : null;

  const openStudyRoom = async (markInProgress = false) => {
    if (!node || isLocked) return;
    if (markInProgress && !isInProgress && !isCompleted) {
      await onStatusChange(node.id, 'in_progress');
    }
    setExpanded(true);
    setSideRail(ytResources.length > 0 ? 'playlist' : 'notes');
    setTab('overview');
  };

  const footerActions = (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {!isCompleted && !isLocked && hasExam && onTakeAssessment && (
        <button onClick={() => onTakeAssessment(node!.id)} style={primaryBtn('#00c9a7')}>
          <ClipboardCheck size={18} /> Take Assessment
        </button>
      )}
      {!isCompleted && !isLocked && !needsExam && (
        <button onClick={() => onStatusChange(node!.id, 'completed')} style={primaryBtn('#00c9a7')}>
          <CheckCircle size={18} /> Mark Complete
        </button>
      )}
      {!isInProgress && !isCompleted && !isLocked && (
        <button onClick={() => void openStudyRoom(true)} style={primaryBtn('#6c63ff')}>
          <Play size={18} /> Start Learning
        </button>
      )}
      {isInProgress && !expanded && (
        <button onClick={() => void openStudyRoom(false)} style={primaryBtn('#6c63ff')}>
          <Maximize2 size={18} /> Open Study Room
        </button>
      )}
      {!isSkipped && !isCompleted && !isLocked && !needsExam && (
        <button
          onClick={() => onStatusChange(node!.id, 'skipped')}
          title="Skip"
          style={{
            padding: '12px',
            background: 'var(--bg-alt)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            fontFamily: 'Outfit',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SkipForward size={18} />
        </button>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {node && !expanded && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 400,
            background: 'var(--bg-card)',
            borderLeft: '1px solid var(--border-light)',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.1)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: 24,
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
              flexShrink: 0,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <span
                style={{
                  fontFamily: 'Fira Code',
                  fontSize: 12,
                  color: '#6c63ff',
                  textTransform: 'uppercase',
                  background: 'rgba(108, 99, 255, 0.1)',
                  padding: '4px 8px',
                  borderRadius: 4,
                }}
              >
                {node.type} · {status.replace('_', ' ')}
                {hasExam ? ` · ${node.assessment?.type}` : ''}
              </span>
              <h2
                style={{
                  fontFamily: 'Outfit',
                  fontSize: 24,
                  margin: '12px 0 0 0',
                  color: 'var(--text-main)',
                  lineHeight: 1.25,
                }}
              >
                {node.title}
              </h2>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <AddNoteButton
                  sourceType="roadmap_node"
                  sourceId={node.id}
                  defaultTitle={node.title}
                  contextLabel={`Roadmap · ${node.title}`}
                  links={[{ entityType: 'roadmap_node', entityId: node.id }]}
                  compact
                />
                <button
                  type="button"
                  onClick={() => void openStudyRoom(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    borderRadius: 8,
                    border: '1.5px solid rgba(108,99,255,0.35)',
                    background: 'rgba(108,99,255,0.1)',
                    color: '#6c63ff',
                    padding: '6px 10px',
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <Maximize2 size={14} /> Full study
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={24} />
            </button>
          </div>

          <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
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

          <div
            style={{
              padding: 24,
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              flexShrink: 0,
            }}
          >
            {lockedHint && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  background: 'var(--bg-alt)',
                  borderRadius: 8,
                  color: 'var(--text-muted)',
                  fontFamily: 'Outfit',
                  fontSize: 13,
                }}
              >
                <Lock size={16} />
                <span>
                  {lockedHint}
                  {node.dependencies?.length
                    ? ` (${node.dependencies
                        .map((id) => allNodes.find((n) => n.id === id)?.title || id)
                        .join(', ')})`
                    : ''}
                </span>
              </div>
            )}
            {footerActions}
          </div>
        </motion.div>
      )}

      {node && expanded && (
        <motion.div
          key="study-room"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
            background: 'var(--bg-main, #f8fafc)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <header
            style={{
              flexShrink: 0,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '0 16px',
              borderBottom: '1px solid var(--border-light)',
              background: 'var(--bg-card, #fff)',
              color: 'var(--text-main)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                title="Back to roadmap"
                style={chromeBtn}
              >
                <ChevronLeft size={20} />
                <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>
                  Roadmap
                </span>
              </button>
              <div
                style={{
                  width: 1,
                  height: 20,
                  background: 'var(--border-light)',
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    fontSize: 14,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 'min(520px, 45vw)',
                    color: 'var(--text-main)',
                  }}
                >
                  {node.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter' }}>
                  {status.replace('_', ' ')}
                  {node.estimatedHours ? ` · ~${node.estimatedHours}h` : ''}
                  {ytResources.length
                    ? ` · ${ytResources.length} lesson${ytResources.length === 1 ? '' : 's'}`
                    : ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!isCompleted && !isLocked && !needsExam && (
                <button
                  type="button"
                  onClick={() => onStatusChange(node.id, 'completed')}
                  style={{
                    ...chromeBtn,
                    background: '#00c9a7',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 12px',
                  }}
                >
                  <CheckCircle size={16} /> Mark complete
                </button>
              )}
              {!isCompleted && !isLocked && hasExam && onTakeAssessment && (
                <button
                  type="button"
                  onClick={() => onTakeAssessment(node.id)}
                  style={{
                    ...chromeBtn,
                    background: '#00c9a7',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 12px',
                  }}
                >
                  <ClipboardCheck size={16} /> Assessment
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setExpanded(false);
                  onClose();
                }}
                aria-label="Close study room"
                style={chromeBtn}
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              background: 'var(--bg-main, #f8fafc)',
              color: 'var(--text-main)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 402px',
                gap: 24,
                padding: '20px 24px 32px',
                maxWidth: 1600,
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box',
              }}
              className="roadmap-study-grid"
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '56.25%',
                    background: '#0f172a',
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: '0 8px 28px rgba(15,23,42,0.12)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  {currentEmbed ? (
                    <iframe
                      key={currentEmbed}
                      src={currentEmbed}
                      title={currentVideo?.title || node.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        placeItems: 'center',
                        padding: 24,
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontFamily: 'Inter',
                        fontSize: 14,
                      }}
                    >
                      No video lesson for this topic yet. Use resources and notes below.
                    </div>
                  )}
                </div>

                <h1
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: 'clamp(18px, 2.2vw, 22px)',
                    fontWeight: 800,
                    margin: '16px 0 8px',
                    lineHeight: 1.3,
                    color: 'var(--text-main)',
                  }}
                >
                  {currentVideo?.title || node.title}
                </h1>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 14,
                    fontFamily: 'Inter',
                    fontSize: 13,
                    color: 'var(--text-muted)',
                  }}
                >
                  {ytResources.length > 0 ? (
                    <span>
                      Video {Math.min(activeVideo, ytResources.length - 1) + 1} / {ytResources.length}
                      {currentVideo?.suggested ? ' · Suggested' : ' · Lesson'}
                    </span>
                  ) : null}
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'var(--bg-alt)',
                      border: '1px solid var(--border-light)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {node.type}
                  </span>
                  {currentVideo ? (
                    <a
                      href={currentVideo.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#f7971e',
                        textDecoration: 'none',
                      }}
                    >
                      Open on YouTube <ExternalLink size={12} />
                    </a>
                  ) : null}
                  {currentVideo?.channel ? (
                    <span>{currentVideo.channel}</span>
                  ) : null}
                </div>

                {ytResources.length > 1 ? (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <button
                      type="button"
                      disabled={activeVideo <= 0}
                      onClick={() => setActiveVideo((i) => Math.max(0, i - 1))}
                      style={navVideoBtn(activeVideo <= 0)}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <button
                      type="button"
                      disabled={activeVideo >= ytResources.length - 1}
                      onClick={() => setActiveVideo((i) => Math.min(ytResources.length - 1, i + 1))}
                      style={navVideoBtn(activeVideo >= ytResources.length - 1)}
                    >
                      Next video <ChevronRight size={16} />
                    </button>
                  </div>
                ) : null}

                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    borderBottom: '1px solid var(--border-light)',
                    marginBottom: 16,
                  }}
                >
                  {(
                    [
                      {
                        id: 'overview' as const,
                        label: 'Overview',
                        icon: <GraduationCap size={14} />,
                      },
                      {
                        id: 'resources' as const,
                        label: 'Suggested reading',
                        icon: <Book size={14} />,
                        count: otherResources.length || undefined,
                      },
                      { id: 'notes' as const, label: 'Notes', icon: <StickyNote size={14} /> },
                    ] as const
                  ).map((t) => {
                    const active = tab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '12px 14px',
                          border: 'none',
                          borderBottom: active
                            ? '2px solid #6c63ff'
                            : '2px solid transparent',
                          background: 'transparent',
                          color: active ? '#6c63ff' : 'var(--text-muted)',
                          fontFamily: 'Outfit',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        {t.icon}
                        {t.label}
                        {'count' in t && typeof t.count === 'number' ? (
                          <span
                            style={{
                              fontSize: 11,
                              background: active
                                ? 'rgba(108,99,255,0.12)'
                                : 'var(--bg-alt)',
                              borderRadius: 999,
                              padding: '1px 6px',
                            }}
                          >
                            {t.count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 14,
                    padding: 16,
                    border: '1px solid var(--border-light)',
                  }}
                >
                  {tab === 'overview' && (
                    <StudyOverview node={node} needsExam={needsExam} />
                  )}
                  {tab === 'resources' &&
                    (otherResources.length > 0 ? (
                      <ResourceList resources={otherResources} />
                    ) : (
                      <p style={{ ...bodyText, margin: 0 }}>
                        No extra docs for this node. Watch the playlist in the player — every video plays in the same window.
                      </p>
                    ))}
                  {tab === 'notes' && (
                    <NotesForSource
                      sourceType="roadmap_node"
                      sourceId={node.id}
                      defaultTitle={node.title}
                      contextLabel={`Roadmap · ${node.title}`}
                      links={[{ entityType: 'roadmap_node', entityId: node.id }]}
                      emptyHint="Capture takeaways while you watch — notes stay linked to this node."
                      inline
                    />
                  )}
                </div>
              </div>

              <aside
                style={{
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  maxHeight: 'calc(100vh - 120px)',
                  position: 'sticky',
                  top: 0,
                  boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--border-light)',
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSideRail('playlist')}
                    style={railTab(sideRail === 'playlist')}
                  >
                    <Video size={14} /> Playlist
                    {ytResources.length ? (
                      <span style={{ opacity: 0.7 }}>({ytResources.length})</span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSideRail('notes')}
                    style={railTab(sideRail === 'notes')}
                  >
                    <StickyNote size={14} /> Notes
                  </button>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: sideRail === 'notes' ? 12 : 0,
                  }}
                >
                  {sideRail === 'playlist' ? (
                    ytResources.length === 0 ? (
                      <p
                        style={{
                          padding: 16,
                          margin: 0,
                          color: 'var(--text-muted)',
                          fontSize: 13,
                          fontFamily: 'Inter',
                          lineHeight: 1.5,
                        }}
                      >
                        No video playlist for this topic. Switch to Notes or check Resources under
                        the player.
                      </p>
                    ) : (
                      <>
                        {ytLessons.length > 0 ? (
                          <div style={playlistSectionLabel}>Lessons</div>
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
                          <div style={playlistSectionLabel}>Suggested · other channels</div>
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
                  ) : (
                    <NotesForSource
                      sourceType="roadmap_node"
                      sourceId={node.id}
                      defaultTitle={node.title}
                      contextLabel={`Roadmap · ${node.title}`}
                      links={[{ entityType: 'roadmap_node', entityId: node.id }]}
                      emptyHint="Jot takeaways while the video plays."
                      inline
                    />
                  )}
                </div>
              </aside>
            </div>
          </div>

          <style>{`
            @media (max-width: 980px) {
              .roadmap-study-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function railTab(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '12px 8px',
    border: 'none',
    borderBottom: active ? '2px solid #6c63ff' : '2px solid transparent',
    background: active ? 'rgba(108,99,255,0.06)' : 'transparent',
    color: active ? '#6c63ff' : 'var(--text-muted)',
    fontFamily: 'Outfit',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
  };
}

const chromeBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  borderRadius: 999,
  border: '1px solid var(--border-light)',
  background: 'var(--bg-alt)',
  color: 'var(--text-main)',
  padding: '8px 10px',
  cursor: 'pointer',
  fontFamily: 'Outfit',
  fontSize: 13,
};

function primaryBtn(bg: string): React.CSSProperties {
  return {
    flex: 1,
    minWidth: 140,
    padding: '12px',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontFamily: 'Outfit',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  };
}

function navVideoBtn(disabled: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid var(--border-light)',
    background: 'var(--bg-alt)',
    color: 'var(--text-main)',
    fontFamily: 'Outfit',
    fontWeight: 700,
    fontSize: 13,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
  };
}

const playlistSectionLabel: React.CSSProperties = {
  padding: '10px 12px 6px',
  fontFamily: 'Outfit',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  background: 'var(--bg-alt)',
  borderBottom: '1px solid var(--border-light)',
};

function PlaylistRow({
  res,
  index,
  active,
  onSelect,
  suggested,
}: {
  res: RoadmapNodeResource;
  index: number;
  active: boolean;
  onSelect: () => void;
  suggested?: boolean;
}) {
  const thumb = youtubeThumb(res.url);
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 120px 1fr',
        gap: 10,
        width: '100%',
        padding: '10px 12px',
        border: 'none',
        borderBottom: '1px solid var(--border-light)',
        background: active ? 'rgba(108,99,255,0.08)' : 'transparent',
        color: 'var(--text-main)',
        cursor: 'pointer',
        textAlign: 'left',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontFamily: 'Outfit',
          fontSize: 12,
          color: active ? '#6c63ff' : 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        {active ? <Play size={12} fill="#6c63ff" color="#6c63ff" /> : index + 1}
      </span>
      <div
        style={{
          position: 'relative',
          width: 120,
          height: 68,
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--bg-alt)',
          flexShrink: 0,
          border: '1px solid var(--border-light)',
        }}
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
            <Video size={18} color="#94a3b8" />
          </div>
        )}
        {active ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(108,99,255,0.28)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                fontFamily: 'Outfit',
                background: '#6c63ff',
                color: '#fff',
                padding: '3px 6px',
                borderRadius: 4,
              }}
            >
              NOW
            </span>
          </div>
        ) : null}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'Outfit',
            fontWeight: 700,
            fontSize: 13,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {res.title}
        </div>
        <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter' }}>
          {suggested ? 'Suggested · ' : ''}
          {res.channel || 'YouTube'}
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
    <div style={{ marginBottom: 24 }}>
      <h3 style={sectionTitle}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((res, i) => {
          const thumb = youtubeThumb(res.url);
          return (
            <button
              key={`${res.url}-${indexOffset + i}`}
              type="button"
              onClick={() => onPlayIndex(indexOffset + i)}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: 8,
                borderRadius: 10,
                border: '1px solid var(--border-light)',
                background: 'var(--bg-alt)',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--text-main)',
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 50,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#111',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(0,0,0,0.25)',
                  }}
                >
                  <Play size={16} color="#fff" fill="#fff" />
                </div>
              </div>
              <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600 }}>
                {res.title}
                {res.channel ? (
                  <span style={{ display: 'block', fontWeight: 500, color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-muted)',
            marginBottom: 20,
          }}
        >
          <Clock size={16} />
          <span style={{ fontFamily: 'Outfit', fontSize: 14 }}>
            Estimated time: {node.estimatedHours} hours
          </span>
        </div>
      ) : null}

      {node.description ? (
        <div style={{ marginBottom: 24 }}>
          <h3 style={sectionTitle}>About this topic</h3>
          <p style={bodyText}>{node.description}</p>
        </div>
      ) : null}

      {node.whyLearn && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={sectionTitle}>Why learn this?</h3>
          <p style={bodyText}>{node.whyLearn}</p>
        </div>
      )}

      {node.interviewFocus ? (
        <div style={{ marginBottom: 24 }}>
          <h3 style={sectionTitle}>Interview focus</h3>
          <p style={bodyText}>{node.interviewFocus}</p>
        </div>
      ) : null}

      {node.learningOutcomes && node.learningOutcomes.length > 0 ? (
        <div style={{ marginBottom: 24 }}>
          <h3 style={sectionTitle}>You will be able to</h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              color: 'var(--text-muted)',
              fontFamily: 'Inter',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {node.learningOutcomes.map((item, i) => (
              <li key={i} style={{ marginBottom: 4 }}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {node.topics && node.topics.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={sectionTitle}>Key Topics</h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              color: 'var(--text-muted)',
              fontFamily: 'Inter',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {node.topics.map((topic, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {topic}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(ytLessons.length > 0 || ytSuggested.length > 0) && (
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <h3 style={{ ...sectionTitle, marginBottom: 0 }}>Watch in study room</h3>
            <button
              type="button"
              onClick={onOpenStudy}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#6c63ff',
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Open player →
            </button>
          </div>
          <p style={{ ...bodyText, marginBottom: 12, fontSize: 13 }}>
            Every video plays in the same player. Suggested clips from other channels are listed separately so they are not mixed with core lessons.
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
        <div style={{ marginBottom: 24 }}>
          <h3 style={sectionTitle}>Suggested reading</h3>
          <ResourceList resources={otherResources} />
        </div>
      )}

      {needsExam && (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: 'rgba(108,99,255,0.08)',
            border: '1px solid rgba(108,99,255,0.25)',
            fontSize: 13,
            color: 'var(--text-muted)',
            fontFamily: 'Inter',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <ListChecks size={16} color="#6c63ff" style={{ marginTop: 2, flexShrink: 0 }} />
          <span>
            Pass a proctored {node.assessment?.type === 'coding' ? 'coding' : 'MCQ'} assessment to
            unlock the next nodes.
          </span>
        </div>
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
  const muted = dark ? '#aaa' : 'var(--text-muted)';
  const main = dark ? '#f1f1f1' : 'var(--text-main)';

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {node.description ? (
        <div>
          <h3 style={{ ...sectionTitle, color: main }}>About</h3>
          <p style={{ ...bodyText, color: muted }}>{node.description}</p>
        </div>
      ) : null}
      {node.whyLearn ? (
        <div>
          <h3 style={{ ...sectionTitle, color: main }}>Why learn this?</h3>
          <p style={{ ...bodyText, color: muted }}>{node.whyLearn}</p>
        </div>
      ) : null}
      {node.interviewFocus ? (
        <div>
          <h3 style={{ ...sectionTitle, color: main }}>Interview focus</h3>
          <p style={{ ...bodyText, color: muted }}>{node.interviewFocus}</p>
        </div>
      ) : null}
      {node.learningOutcomes?.length ? (
        <div>
          <h3 style={{ ...sectionTitle, color: main }}>You will be able to</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: muted, fontFamily: 'Inter', fontSize: 14, lineHeight: 1.6 }}>
            {node.learningOutcomes.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {node.topics?.length ? (
        <div>
          <h3 style={{ ...sectionTitle, color: main }}>Key topics</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: muted, fontFamily: 'Inter', fontSize: 14, lineHeight: 1.6 }}>
            {node.topics.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {node.skills?.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {node.skills.map((skill) => (
            <span
              key={skill}
              style={{
                fontFamily: 'Outfit',
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 10px',
                borderRadius: 999,
                background: dark ? 'rgba(108,99,255,0.25)' : 'rgba(108,99,255,0.1)',
                color: dark ? '#c4b5fd' : '#6c63ff',
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}
      {needsExam ? (
        <p style={{ ...bodyText, color: muted }}>
          Assessment required after this topic to unlock the next nodes.
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {resources.map((res, i) => (
        <a
          key={`${res.url}-${i}`}
          href={res.url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            background: dark ? 'rgba(255,255,255,0.06)' : 'var(--bg-alt)',
            borderRadius: 8,
            textDecoration: 'none',
            color: dark ? '#f1f1f1' : 'var(--text-main)',
            fontFamily: 'Inter',
            fontSize: 14,
            border: dark ? '1px solid rgba(255,255,255,0.08)' : undefined,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {res.type === 'video' ? (
              <Video size={16} color="#f7971e" />
            ) : res.type === 'practice' || res.type === 'project' ? (
              <Code size={16} color="#00c9a7" />
            ) : (
              <Book size={16} color="#6c63ff" />
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {res.title}{res.channel ? ` · ${res.channel}` : ''}
            </span>
          </div>
          <ExternalLink size={14} color={dark ? '#888' : 'var(--text-muted)'} />
        </a>
      ))}
    </div>
  );
}
