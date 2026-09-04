"use client";

import React, { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Focus, Search, Filter, RefreshCw, Target, Map } from 'lucide-react';

export default function RoadmapToolbar({ 
  onSearch, 
  onFilter, 
  onRegenerate,
  activeFilter,
  isFullscreen,
  onToggleFullscreen,
  showMinimap,
  onToggleMinimap,
  onFocusGoal,
}: { 
  onSearch: (q: string) => void;
  onFilter: (f: string) => void;
  onRegenerate: () => void;
  activeFilter: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  showMinimap?: boolean;
  onToggleMinimap?: () => void;
  onFocusGoal?: () => void;
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  
  const filters = ['All', 'Skills', 'Projects', 'Milestones', 'Completed', 'In Progress', 'Locked', 'High Priority'];

  return (
    <div style={{
      position: 'absolute',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      background: 'rgba(var(--bg-card-rgb, 255, 255, 255), 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-light)',
      borderRadius: 100,
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <button onClick={() => zoomOut()} title="Zoom out" style={btnStyle}><ZoomOut size={18} /></button>
      <button onClick={() => zoomIn()} title="Zoom in" style={btnStyle}><ZoomIn size={18} /></button>
      <button onClick={() => fitView({ duration: 600 })} title="Fit view" style={btnStyle}><Focus size={18} /></button>
      {onToggleFullscreen && (
        <button 
          onClick={onToggleFullscreen} 
          title={isFullscreen ? "Exit full screen" : "Full screen"} 
          style={btnStyle}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      )}
      {onToggleMinimap && (
        <button 
          onClick={onToggleMinimap} 
          title={showMinimap ? "Hide minimap" : "Show minimap"} 
          style={{
            ...btnStyle,
            color: showMinimap ? '#6c63ff' : 'var(--text-muted)'
          }}
        >
          <Map size={18} />
        </button>
      )}
      
      <div style={{ width: 1, height: 24, background: 'var(--border-strong)' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        {searchOpen ? (
          <input 
            autoFocus
            onChange={(e) => onSearch(e.target.value)}
            onBlur={() => setSearchOpen(false)}
            placeholder="Search nodes..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontFamily: 'Outfit',
              width: 150,
              padding: '0 8px'
            }}
          />
        ) : (
          <button onClick={() => setSearchOpen(true)} style={btnStyle}><Search size={18} /></button>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button onClick={() => setFilterOpen(!filterOpen)} style={btnStyle}>
          <Filter size={18} color={activeFilter !== 'All' ? '#6c63ff' : 'currentColor'} />
        </button>
        {filterOpen && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 16,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            minWidth: 150
          }}>
            {filters.map(f => (
              <button 
                key={f}
                onClick={() => { onFilter(f); setFilterOpen(false); }}
                style={{
                  padding: '8px 12px',
                  background: activeFilter === f ? 'var(--bg-alt)' : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'Outfit',
                  color: activeFilter === f ? '#6c63ff' : 'var(--text-main)'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--border-strong)' }} />

      <button
        onClick={() => onFocusGoal?.()}
        title="Center on my goal"
        style={{...btnStyle, color: '#00c9a7', display: 'flex', gap: 6, padding: '0 8px'}}
      >
        <Target size={18} />
        <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 14 }}>My Goal</span>
      </button>

      <button onClick={() => {
        if(confirm('Regenerate this roadmap? A new version becomes active — your other saved roadmaps stay available. Progress on the current active roadmap will not carry over.')) {
          onRegenerate();
        }
      }} style={{...btnStyle, color: '#f7971e'}}>
        <RefreshCw size={18} />
      </button>
    </div>
  );
}

const btnStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 4,
  borderRadius: 8,
  transition: 'all 0.2s'
};
