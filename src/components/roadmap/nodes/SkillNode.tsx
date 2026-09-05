"use client";

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lock, BookOpen, Check, Play, SkipForward } from 'lucide-react';

export default function SkillNode({ data }: { data: any }) {
  const { status, estimatedHours, onClick } = data;
  const label = data.label ?? data.title;
  const blurb = typeof data.description === 'string' ? data.description : '';
  const outcomes = Array.isArray(data.learningOutcomes) ? data.learningOutcomes.length : 0;
  const resources = Array.isArray(data.resources) ? data.resources.length : 0;
  
  let borderColor = 'var(--border-light)';
  let bg = 'var(--bg-card)';
  let Icon = BookOpen;
  let iconColor = 'var(--text-muted)';
  let opacity = 1;

  if (status === 'locked') {
    bg = 'var(--bg-alt)';
    Icon = Lock;
  } else if (status === 'available') {
    borderColor = '#6c63ff';
    iconColor = '#6c63ff';
  } else if (status === 'in_progress') {
    borderColor = '#6c63ff';
    Icon = Play;
    iconColor = '#6c63ff';
    bg = 'var(--bg-card)';
  } else if (status === 'completed') {
    bg = 'rgba(0, 201, 167, 0.1)';
    borderColor = '#00c9a7';
    Icon = Check;
    iconColor = '#00c9a7';
  } else if (status === 'skipped') {
    opacity = 0.6;
    Icon = SkipForward;
  }

  return (
    <div 
      onClick={() => onClick && onClick()}
      style={{
        width: 260,
        minHeight: 118,
        background: bg,
        borderRadius: 16,
        border: `2px solid ${borderColor}`,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        cursor: 'pointer',
        opacity,
        boxShadow: status === 'in_progress' ? '0 0 16px rgba(108, 99, 255, 0.3)' : '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        textDecoration: status === 'skipped' ? 'line-through' : 'none'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={16} color={iconColor} />
        <span style={{ 
          fontFamily: 'Outfit', 
          fontSize: 14, 
          fontWeight: 600, 
          color: 'var(--text-main)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {label}
        </span>
      </div>

      {blurb ? (
        <div style={{
          fontFamily: 'Inter',
          fontSize: 11,
          lineHeight: 1.4,
          color: 'var(--text-muted)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {blurb}
        </div>
      ) : null}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--text-muted)' }}>
          {resources ? `${resources} resources` : ''}
          {outcomes ? ` · ${outcomes} outcomes` : ''}
        </span>
        {estimatedHours ? (
          <span style={{ 
            fontFamily: 'Fira Code', 
            fontSize: 10,
            background: 'var(--bg-alt)',
            color: 'var(--text-muted)',
            padding: '2px 6px',
            borderRadius: 12
          }}>
            {estimatedHours}h
          </span>
        ) : null}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
}
