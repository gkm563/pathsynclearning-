"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

const TIMELINES = ["1 month", "3 months", "6 months", "9 months", "1 year", "No fixed deadline"];
const PRIORITIES = [
  "Build skills", "Get internship", "Get job", "Build portfolio", 
  "Improve coding", "Prepare for interviews", "Build projects", 
  "Earn through freelancing", "Contribute to open source"
];

export default function TimelineSection({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const timeline = data.timeline || '';
  const priority = data.priority || '';

  const containerStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '24px',
    backgroundColor: 'var(--bg-card)', padding: '32px',
    borderRadius: '16px', border: '1px solid var(--border-light)'
  };

  const titleStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '12px',
    fontSize: '24px', fontWeight: 'bold', fontFamily: 'Outfit',
    color: 'var(--text-main)', marginBottom: '8px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '12px', fontWeight: 600,
    color: 'var(--text-main)', fontFamily: 'Outfit', fontSize: '18px'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px'
  };

  const getCardStyle = (selected: boolean): React.CSSProperties => ({
    padding: '16px', borderRadius: '12px', textAlign: 'center',
    border: `2px solid ${selected ? '#6c63ff' : 'var(--border-light)'}`,
    backgroundColor: selected ? 'rgba(108, 99, 255, 0.1)' : 'var(--bg-alt)',
    color: 'var(--text-main)', cursor: 'pointer', fontFamily: 'Outfit',
    fontWeight: selected ? 600 : 400, transition: 'all 0.2s'
  });

  return (
    <motion.div style={containerStyle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={titleStyle}>
        <Calendar size={28} color="#6c63ff" />
        📅 Timeline & Priority
      </div>
      
      <div>
        <label style={labelStyle}>When do you want to achieve your goal?</label>
        <div style={gridStyle}>
          {TIMELINES.map(t => (
            <div key={t} style={getCardStyle(timeline === t)} onClick={() => onChange({ ...data, timeline: t })}>
              {t}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>What is your biggest priority right now?</label>
        <div style={gridStyle}>
          {PRIORITIES.map(p => (
            <div key={p} style={getCardStyle(priority === p)} onClick={() => onChange({ ...data, priority: p })}>
              {p}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
