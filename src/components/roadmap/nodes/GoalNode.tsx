"use client";

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Target, Check, Lock, Play } from 'lucide-react';

export default function GoalNode({ data }: { data: any }) {
  const label = data.label ?? data.title;
  const status = data.status || 'available';
  const onClick = data.onClick;

  const isCompleted = status === 'completed' || status === 'skipped';
  const isLocked = status === 'locked';
  const isInProgress = status === 'in_progress';

  return (
    <div
      onClick={() => onClick?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
      style={{
        width: 280,
        minHeight: 100,
        background: 'var(--bg-card)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '2px solid transparent',
        backgroundImage: isCompleted
          ? 'linear-gradient(var(--bg-card), var(--bg-card)), linear-gradient(90deg, #00c9a7, #00c9a7)'
          : 'linear-gradient(var(--bg-card), var(--bg-card)), linear-gradient(90deg, #6c63ff, #00c9a7)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        boxShadow: '0 8px 24px rgba(108, 99, 255, 0.2)',
        cursor: 'pointer',
        opacity: isLocked ? 0.7 : 1,
        padding: 12,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {isCompleted ? (
          <Check size={20} color="#00c9a7" />
        ) : isLocked ? (
          <Lock size={18} color="var(--text-muted)" />
        ) : isInProgress ? (
          <Play size={18} color="#6c63ff" />
        ) : (
          <Target size={20} color="#00c9a7" />
        )}
        <span style={{ fontFamily: 'Fira Code', fontSize: 12, color: '#00c9a7', fontWeight: 600 }}>
          YOUR CAREER GOAL
        </span>
      </div>
      <div
        style={{
          fontFamily: 'Outfit',
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--text-main)',
          textAlign: 'center',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'Fira Code',
          fontSize: 10,
          color: 'var(--text-muted)',
          marginTop: 6,
          textTransform: 'uppercase',
        }}
      >
        {isLocked ? 'Locked — click for details' : 'Click to open · Mark complete to unlock next'}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
}
