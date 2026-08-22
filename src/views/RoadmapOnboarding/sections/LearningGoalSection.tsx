"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Plus, Check } from 'lucide-react';

const SUGGESTED_SKILLS = [
  "React", "Node.js", "System Design", "Machine Learning", 
  "AWS", "GraphQL", "TypeScript", "Docker", "Algorithms", "UI/UX"
];

export default function LearningGoalSection({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  const learningGoals = data.learningGoals || [];
  const reason = data.reason || '';
  const [customGoal, setCustomGoal] = useState('');

  const toggleGoal = (goal: string) => {
    if (learningGoals.includes(goal)) {
      onChange({ ...data, learningGoals: learningGoals.filter((g: string) => g !== goal) });
    } else {
      onChange({ ...data, learningGoals: [...learningGoals, goal] });
    }
  };

  const addCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (customGoal.trim() && !learningGoals.includes(customGoal.trim())) {
      onChange({ ...data, learningGoals: [...learningGoals, customGoal.trim()] });
      setCustomGoal('');
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
    padding: '8px 16px', borderRadius: '24px',
    border: `1px solid ${selected ? '#6c63ff' : 'var(--border-light)'}`,
    backgroundColor: selected ? '#6c63ff' : 'var(--bg-alt)',
    color: selected ? '#fff' : 'var(--text-main)',
    cursor: 'pointer', fontFamily: 'Outfit', fontSize: '14px',
    display: 'flex', alignItems: 'center', gap: '6px',
    transition: 'all 0.2s'
  });

  const textareaStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: '8px',
    border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)',
    color: 'var(--text-main)', fontFamily: 'Outfit', fontSize: '16px',
    minHeight: '100px', resize: 'vertical', outline: 'none'
  };

  return (
    <motion.div style={containerStyle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={titleStyle}>
        <Compass size={28} color="#6c63ff" />
        🧭 Learning Goals
      </div>
      
      <div>
        <label style={labelStyle}>What do you want to learn?</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {SUGGESTED_SKILLS.map(skill => {
            const selected = learningGoals.includes(skill);
            return (
              <div key={skill} style={getPillStyle(selected)} onClick={() => toggleGoal(skill)}>
                {selected && <Check size={14} />} {skill}
              </div>
            )
          })}
          <form onSubmit={addCustomGoal} style={{ display: 'flex', gap: '8px' }}>
            <input 
              style={{ padding: '8px 16px', borderRadius: '24px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'Outfit', fontSize: '14px', outline: 'none' }}
              placeholder="Add other..."
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
            />
            <button type="submit" style={{ ...getPillStyle(false), padding: '8px', border: 'none', background: 'transparent' }}>
              <Plus size={18} />
            </button>
          </form>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Why do you want to learn these?</label>
        <textarea 
          style={textareaStyle} 
          placeholder="E.g. I want to build a full-stack SaaS app for my portfolio..."
          value={reason}
          onChange={(e) => onChange({ ...data, reason: e.target.value })}
        />
      </div>
    </motion.div>
  );
}
