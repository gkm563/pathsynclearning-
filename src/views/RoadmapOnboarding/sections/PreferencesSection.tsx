"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Check } from 'lucide-react';

const PREFERENCES = [
  "Video tutorials", "Documentation", "Building projects", 
  "Reading", "Interactive exercises", "Coding challenges", 
  "Courses", "Mentorship", "Community/Open Source"
];

export default function PreferencesSection({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const learningPreferences = data.learningPreferences || [];

  const togglePref = (pref: string) => {
    if (learningPreferences.includes(pref)) {
      onChange({ ...data, learningPreferences: learningPreferences.filter((p: string) => p !== pref) });
    } else {
      onChange({ ...data, learningPreferences: [...learningPreferences, pref] });
    }
  };

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

  const getPillStyle = (selected: boolean): React.CSSProperties => ({
    padding: '12px 20px', borderRadius: '24px',
    border: `1px solid ${selected ? '#f7971e' : 'var(--border-light)'}`,
    backgroundColor: selected ? '#f7971e' : 'var(--bg-alt)',
    color: selected ? '#fff' : 'var(--text-main)',
    cursor: 'pointer', fontFamily: 'Outfit', fontSize: '15px',
    display: 'flex', alignItems: 'center', gap: '8px',
    transition: 'all 0.2s'
  });

  return (
    <motion.div style={containerStyle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={titleStyle}>
        <Settings size={28} color="#f7971e" />
        ⚙️ Learning Preferences
      </div>
      
      <div>
        <label style={labelStyle}>How do you learn best?</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {PREFERENCES.map(pref => {
            const selected = learningPreferences.includes(pref);
            return (
              <div key={pref} style={getPillStyle(selected)} onClick={() => togglePref(pref)}>
                {selected && <Check size={16} />} {pref}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  );
}
