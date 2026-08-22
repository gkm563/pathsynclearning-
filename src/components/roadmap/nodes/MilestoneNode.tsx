"use client";

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Trophy, Flag } from 'lucide-react';

export default function MilestoneNode({ data }: { data: any }) {
  const { status, onClick } = data;
  const label = data.label ?? data.title;
  
  const isCompleted = status === 'completed';
  const color = isCompleted ? '#ffd700' : 'var(--text-muted)';
  
  return (
    <div 
      onClick={() => onClick && onClick()}
      style={{
        width: 180,
        height: 70,
        background: 'var(--bg-card)',
        borderRadius: 35,
        border: `2px solid ${isCompleted ? color : 'var(--border-strong)'}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: isCompleted ? '0 4px 16px rgba(255, 215, 0, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
        padding: '0 16px'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isCompleted ? <Trophy size={16} color={color} /> : <Flag size={16} color={color} />}
        <span style={{ 
          fontFamily: 'Outfit', 
          fontSize: 14, 
          fontWeight: 700, 
          color: 'var(--text-main)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {label}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
}
