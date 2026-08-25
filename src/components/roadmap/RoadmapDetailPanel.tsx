"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, ExternalLink, Book, Video, Code, CheckCircle, SkipForward, Play, Lock, ClipboardCheck,
} from 'lucide-react';
import type { RoadmapNode } from '@/types/roadmap';
import { isAssessableNode, nodeRequiresAssessment } from '@/lib/roadmap/assessment';

function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export default function RoadmapDetailPanel({
  node,
  allNodes,
  onStatusChange,
  onTakeAssessment,
  onClose,
}: {
  node: RoadmapNode | null;
  allNodes: RoadmapNode[];
  onStatusChange: (id: string, status: string) => void | Promise<void>;
  onTakeAssessment?: (id: string) => void;
  onClose: () => void;
}) {
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

  const ytResources = (node?.resources || []).filter(
    (r) => r.type === 'video' && /youtube\.com|youtu\.be/i.test(r.url),
  );
  const otherResources = (node?.resources || []).filter(
    (r) => !(r.type === 'video' && /youtube\.com|youtu\.be/i.test(r.url)),
  );

  return (
    <AnimatePresence>
      {node && (
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
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: 24,
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
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
                }}
              >
                {node.title}
              </h2>
            </div>
            <button
              onClick={onClose}
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

          <div style={{ padding: 24, flex: 1 }}>
            {node.estimatedHours ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--text-muted)',
                  marginBottom: 24,
                }}
              >
                <Clock size={16} />
                <span style={{ fontFamily: 'Outfit', fontSize: 14 }}>
                  Estimated time: {node.estimatedHours} hours
                </span>
              </div>
            ) : null}

            {node.whyLearn && (
              <div style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: 16,
                    color: 'var(--text-main)',
                    marginBottom: 8,
                  }}
                >
                  Why learn this?
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter',
                    fontSize: 14,
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {node.whyLearn}
                </p>
              </div>
            )}

            {node.topics && node.topics.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: 16,
                    color: 'var(--text-main)',
                    marginBottom: 8,
                  }}
                >
                  Key Topics
                </h3>
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
                  {node.topics.map((topic: string, i: number) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {ytResources.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: 16,
                    color: 'var(--text-main)',
                    marginBottom: 8,
                  }}
                >
                  Free YouTube lessons
                </h3>
                {ytResources.map((res, i) => {
                  const embed = youtubeEmbedUrl(res.url);
                  return (
                    <div key={i} style={{ marginBottom: 12 }}>
                      {embed ? (
                        <div
                          style={{
                            position: 'relative',
                            paddingBottom: '56.25%',
                            height: 0,
                            borderRadius: 10,
                            overflow: 'hidden',
                            marginBottom: 8,
                          }}
                        >
                          <iframe
                            src={embed}
                            title={res.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{
                              position: 'absolute',
                              inset: 0,
                              width: '100%',
                              height: '100%',
                              border: 0,
                            }}
                          />
                        </div>
                      ) : null}
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: '#f7971e',
                          fontFamily: 'Inter',
                          fontSize: 13,
                          textDecoration: 'none',
                        }}
                      >
                        <Video size={14} /> {res.title} <ExternalLink size={12} />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            {otherResources.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: 16,
                    color: 'var(--text-main)',
                    marginBottom: 8,
                  }}
                >
                  Resources
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {otherResources.map((res: any, i: number) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 12,
                        background: 'var(--bg-alt)',
                        borderRadius: 8,
                        textDecoration: 'none',
                        color: 'var(--text-main)',
                        fontFamily: 'Inter',
                        fontSize: 14,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {res.type === 'video' ? (
                          <Video size={16} color="#f7971e" />
                        ) : res.type === 'practice' || res.type === 'project' ? (
                          <Code size={16} color="#00c9a7" />
                        ) : (
                          <Book size={16} color="#6c63ff" />
                        )}
                        <span>{res.title}</span>
                      </div>
                      <ExternalLink size={14} color="var(--text-muted)" />
                    </a>
                  ))}
                </div>
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
                  marginBottom: 8,
                }}
              >
                Pass a proctored {node.assessment?.type === 'coding' ? 'coding' : 'MCQ'}{' '}
                assessment to unlock the next nodes. Fullscreen · no tab switching · no
                copy/paste.
              </div>
            )}
          </div>

          <div
            style={{
              padding: 24,
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
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

            <div style={{ display: 'flex', gap: 12 }}>
              {!isCompleted && !isLocked && hasExam && onTakeAssessment && (
                <button
                  onClick={() => onTakeAssessment(node.id)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#00c9a7',
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
                  }}
                >
                  <ClipboardCheck size={18} /> Take Assessment
                </button>
              )}
              {!isCompleted && !isLocked && !needsExam && (
                <button
                  onClick={() => onStatusChange(node.id, 'completed')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#00c9a7',
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
                  }}
                >
                  <CheckCircle size={18} /> Mark Complete
                </button>
              )}
              {!isInProgress && !isCompleted && !isLocked && (
                <button
                  onClick={() => onStatusChange(node.id, 'in_progress')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#6c63ff',
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
                  }}
                >
                  <Play size={18} /> Start Learning
                </button>
              )}
              {!isSkipped && !isCompleted && !isLocked && !needsExam && (
                <button
                  onClick={() => onStatusChange(node.id, 'skipped')}
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
