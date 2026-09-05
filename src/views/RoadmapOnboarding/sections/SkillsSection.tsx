"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Plus, X } from 'lucide-react';
import { OnboardingCard, StepHeader } from '../onboarding-ui';

const COMMON_SKILLS = [
  "HTML", "CSS", "JavaScript", "TypeScript", "Python", "C", "C++", "Java",
  "React", "Next.js", "Node.js", "Express", "Flutter", "React Native", 
  "SQL", "MongoDB", "PostgreSQL", "Git", "Docker", "AWS", "Linux", "Figma"
];

const CONFIDENCE_LEVELS = ["Never used", "Beginner", "Basic", "Intermediate", "Advanced", "Very confident"];

export default function SkillsSection({ data, onChange }: { data: any, onChange: (data: any) => void; hideRole?: boolean }) {
  const skills = data.skills || []; // array of { skill: string, confidence: string }
  const [customSkill, setCustomSkill] = useState('');

  const toggleSkill = (skill: string) => {
    const existing = skills.find((s: any) => s.skill === skill);
    if (existing) {
      onChange({ ...data, skills: skills.filter((s: any) => s.skill !== skill) });
    } else {
      onChange({ ...data, skills: [...skills, { skill, confidence: 'Beginner' }] });
    }
  };

  const updateConfidence = (skill: string, confidence: string) => {
    const updated = skills.map((s: any) => s.skill === skill ? { ...s, confidence } : s);
    onChange({ ...data, skills: updated });
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !skills.find((s: any) => s.skill === customSkill.trim())) {
      onChange({ ...data, skills: [...skills, { skill: customSkill.trim(), confidence: 'Beginner' }] });
      setCustomSkill('');
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '24px',
    backgroundColor: 'transparent', padding: 0,
    borderRadius: 0, border: 'none'
  };

  const titleStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '12px',
    fontSize: '24px', fontWeight: 'bold', fontFamily: 'Outfit',
    color: 'var(--text-main)', marginBottom: '8px'
  };

  const pillContainerStyle: React.CSSProperties = {
    display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px'
  };

  const getPillStyle = (selected: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: '24px',
    border: `1px solid ${selected ? '#f7971e' : 'var(--border-light)'}`,
    backgroundColor: selected ? '#f7971e' : 'var(--bg-alt)',
    color: selected ? '#fff' : 'var(--text-main)',
    cursor: 'pointer', fontFamily: 'Outfit', fontSize: '14px',
    transition: 'all 0.2s'
  });

  const ratingContainer: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '12px',
    padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-alt)',
    border: '1px solid var(--border-light)'
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 16px', borderRadius: '24px',
    border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)',
    color: 'var(--text-main)', fontFamily: 'Outfit', fontSize: '14px',
    outline: 'none'
  };

  return (
    <OnboardingCard accent="#f7971e">
      <StepHeader icon={<Wrench size={22} color="#f7971e" />} kicker="Baseline" title="Current skills" subtitle="Rate what you already know so we skip advanced nodes you have already earned." />
      
      <div>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'Outfit' }}>
          What skills do you already know?
        </label>
        <div style={pillContainerStyle}>
          {COMMON_SKILLS.map(skill => (
            <div 
              key={skill} 
              style={getPillStyle(!!skills.find((s: any) => s.skill === skill))}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </div>
          ))}
          <form onSubmit={addCustomSkill} style={{ display: 'flex', gap: '8px' }}>
            <input 
              style={inputStyle}
              placeholder="Add other skill..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
            />
            <button type="submit" style={{ ...getPillStyle(false), padding: '8px', border: 'none', background: 'transparent' }}>
              <Plus size={18} />
            </button>
          </form>
        </div>
      </div>

      {skills.length > 0 && (
        <div>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'Outfit' }}>
            Rate your confidence in these skills:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {skills.map((item: any) => (
              <div key={item.skill} style={ratingContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontFamily: 'Outfit', color: 'var(--text-main)' }}>{item.skill}</span>
                  <button onClick={() => toggleSkill(item.skill)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {CONFIDENCE_LEVELS.map(level => (
                    <div
                      key={level}
                      onClick={() => updateConfidence(item.skill, level)}
                      style={{
                        padding: '6px 12px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
                        background: item.confidence === level ? '#6c63ff' : 'var(--bg-main)',
                        color: item.confidence === level ? '#fff' : 'var(--text-muted)',
                        border: `1px solid ${item.confidence === level ? '#6c63ff' : 'var(--border-light)'}`
                      }}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </OnboardingCard>
  );
}
