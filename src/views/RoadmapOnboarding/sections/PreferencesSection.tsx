"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Check } from 'lucide-react';
import { OnboardingCard, StepHeader } from '../onboarding-ui';

const PREFERENCES = [
  "Video tutorials", "Documentation", "Building projects", 
  "Reading", "Interactive exercises", "Coding challenges", 
  "Courses", "Mentorship", "Community/Open Source"
];

export default function PreferencesSection({ data, onChange }: { data: any, onChange: (data: any) => void; hideRole?: boolean }) {
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
    <OnboardingCard accent="#f7971e">
      <StepHeader icon={<Settings size={22} color="#f7971e" />} kicker="Format" title="How you learn" subtitle="We bias resources toward videos, docs, or practice based on this." />
      
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
    </OnboardingCard>
  );
}
