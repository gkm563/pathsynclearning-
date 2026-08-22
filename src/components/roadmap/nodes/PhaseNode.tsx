"use client";

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Check, Lock, Play } from 'lucide-react';

export default function PhaseNode({ data }: { data: any }) {
  const label = data.label ?? data.title;
  const phaseNumber = data.phaseNumber;
  const status = data.status || 'locked';
  const onClick = data.onClick;

  const isCompleted = status === 'completed' || status === 'skipped';
  const isLocked = status === 'locked';
  const isInProgress = status === 'in_progress';
  const isAvailable = status === 'available';

  let border = '2px dashed var(--border-strong)';
  if (isCompleted) border = '2px solid #00c9a7';
  else if (isInProgress || isAvailable) border = '2px solid #6c63ff';

  return (
    <div
      onClick={() => onClick?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
      style={{
        width: 260,
        background: isCompleted ? 'rgba(0, 201, 167, 0.08)' : 'var(--bg-card)',
        borderRadius: 12,
        border,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        opacity: isLocked ? 0.75 : 1,
        boxShadow: isAvailable || isInProgress ? '0 0 0 3px rgba(108, 99, 255, 0.15)' : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {isCompleted ? (
          <Check size={12} color="#00c9a7" />
        ) : isLocked ? (
          <Lock size={12} color="var(--text-muted)" />
        ) : (
          <Play size={12} color="#6c63ff" />
        )}
        <span
          style={{
            fontFamily: 'Fira Code',
            fontSize: 10,
            color: isCompleted ? '#00c9a7' : isLocked ? 'var(--text-muted)' : '#6c63ff',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          PHASE {phaseNumber || ''} · {String(status).replace('_', ' ')}
        </span>
      </div>

      <div
        style={{
          fontFamily: 'Outfit',
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--text-main)',
          textAlign: 'center',
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontFamily: 'Outfit',
          fontSize: 11,
          color: 'var(--text-muted)',
          marginTop: 6,
          textAlign: 'center',
        }}
      >
        {isLocked
          ? 'Complete the node above first'
          : isCompleted
            ? 'Completed'
            : 'Click → Mark Complete to unlock skills'}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
}
