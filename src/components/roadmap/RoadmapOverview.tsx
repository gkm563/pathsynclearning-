"use client";

import React from 'react';
import type { RoadmapNode } from '@/types/roadmap';

export default function RoadmapOverview({ 
  nodes, 
  progress 
}: { 
  nodes: RoadmapNode[]; 
  progress: Map<string, string>; 
}) {
  const trackable = nodes.filter((n) => n.type !== 'phase' && n.type !== 'goal' && n.type !== 'career');
  const totalNodes = trackable.length;
  const completedNodes = trackable.filter((n) => progress.get(n.id) === 'completed' || progress.get(n.id) === 'skipped').length;
  const completionPercentage = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
  
  const estimatedTotalHours = nodes.reduce((acc, node) => acc + (node.estimatedHours || 0), 0);
  const completedHours = nodes.reduce((acc, node) => {
    if (progress.get(node.id) === 'completed') {
      return acc + (node.estimatedHours || 0);
    }
    return acc;
  }, 0);
  const remainingHours = Math.max(0, estimatedTotalHours - completedHours);

  return (
    <div style={{
      position: 'absolute',
      top: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      background: 'rgba(var(--bg-card-rgb, 255, 255, 255), 0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-light)',
      borderRadius: 16,
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 32,
      boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: 'Fira Code', fontSize: 11, color: 'var(--text-muted)' }}>PROGRESS</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 700, color: '#00c9a7' }}>{completionPercentage}%</span>
          <div style={{ width: 100, height: 6, background: 'var(--bg-alt)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${completionPercentage}%`, height: '100%', background: '#00c9a7', borderRadius: 3 }} />
          </div>
        </div>
      </div>
      
      <div style={{ width: 1, height: 32, background: 'var(--border-strong)' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: 'Fira Code', fontSize: 11, color: 'var(--text-muted)' }}>NODES COMPLETED</span>
        <span style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>{completedNodes} / {totalNodes}</span>
      </div>

      <div style={{ width: 1, height: 32, background: 'var(--border-strong)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: 'Fira Code', fontSize: 11, color: 'var(--text-muted)' }}>EST. REMAINING</span>
        <span style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>~{remainingHours} hours</span>
      </div>
    </div>
  );
}
