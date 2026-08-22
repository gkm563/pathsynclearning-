"use client";

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Rocket, Code } from 'lucide-react';

export default function ProjectNode({ data }: { data: any }) {
  const { status, onClick } = data;
  const label = data.label ?? data.title;
  
  const borderColor = '#f7971e';
  
  return (
    <div 
      onClick={() => onClick && onClick()}
      style={{
        width: 240,
        height: 90,
        background: 'var(--bg-card)',
        borderRadius: 16,
        border: `2px solid ${borderColor}`,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(247, 151, 30, 0.2)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Rocket size={18} color={borderColor} />
        <span style={{ 
          fontFamily: 'Fira Code', 
          fontSize: 11, 
          color: borderColor,
          fontWeight: 600
        }}>
          PROJECT
        </span>
      </div>
      
      <div style={{ 
        fontFamily: 'Outfit', 
        fontSize: 15, 
        fontWeight: 700, 
        color: 'var(--text-main)',
        textAlign: 'center'
      }}>
        {label}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
}
