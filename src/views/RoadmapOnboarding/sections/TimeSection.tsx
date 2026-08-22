"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const HOURS = ["1–3 hours", "3–5 hours", "5–10 hours", "10–15 hours", "15–20 hours", "20+ hours"];
const BALANCES = ["Mostly learning", "Balanced", "Mostly projects"];

export default function TimeSection({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const weeklyHours = data.weeklyHours || '';
  const balance = data.balance || '';

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
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px'
  };

  const getCardStyle = (selected: boolean): React.CSSProperties => ({
    padding: '16px', borderRadius: '12px', textAlign: 'center',
    border: `2px solid ${selected ? '#00c9a7' : 'var(--border-light)'}`,
    backgroundColor: selected ? 'rgba(0, 201, 167, 0.1)' : 'var(--bg-alt)',
    color: 'var(--text-main)', cursor: 'pointer', fontFamily: 'Outfit',
    fontWeight: selected ? 600 : 400, transition: 'all 0.2s'
  });

  return (
    <motion.div style={containerStyle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={titleStyle}>
        <Clock size={28} color="#00c9a7" />
        ⏳ Time Availability
      </div>
      
      <div>
        <label style={labelStyle}>Weekly hours you can commit</label>
        <div style={gridStyle}>
          {HOURS.map(h => (
            <div key={h} style={getCardStyle(weeklyHours === h)} onClick={() => onChange({ ...data, weeklyHours: h })}>
              {h}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Project vs learning balance</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {BALANCES.map(b => (
            <div key={b} style={getCardStyle(balance === b)} onClick={() => onChange({ ...data, balance: b })}>
              {b}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
