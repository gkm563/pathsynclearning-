"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { OnboardingCard, StepHeader } from '../onboarding-ui';

const EXPERIENCE_LEVELS = [
  "None", "Personal projects", "College projects", "Open source", 
  "Internship", "Freelance", "Professional"
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export default function ProjectsSection({ data, onChange }: { data: any, onChange: (data: any) => void; hideRole?: boolean }) {
  const hasProjects = data.hasProjects || false;
  const projects = data.projects || [];
  const realWorldExperience = data.realWorldExperience || '';

  const addProject = () => {
    if (projects.length >= 5) return;
    onChange({
      ...data, 
      projects: [...projects, { name: '', tech: '', difficulty: 'Beginner', deployed: false, solo: true }]
    });
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, projects: updated });
  };

  const removeProject = (index: number) => {
    const updated = projects.filter((_: any, i: number) => i !== index);
    onChange({ ...data, projects: updated });
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)',
    color: 'var(--text-main)', fontFamily: 'Outfit', fontSize: '14px',
    outline: 'none'
  };

  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer', appearance: 'none' };

  return (
    <OnboardingCard accent="#00c9a7">
      <StepHeader icon={<Briefcase size={22} color="#00c9a7" />} kicker="Proof" title="Projects and experience" subtitle="Existing work lets us skip beginner project nodes." />
      
      <div>
        <label style={labelStyle}>Have you built any projects?</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          {['Yes', 'No'].map(opt => {
            const isYes = opt === 'Yes';
            const selected = hasProjects === isYes;
            return (
              <div 
                key={opt}
                onClick={() => onChange({ ...data, hasProjects: isYes, projects: isYes ? projects : [] })}
                style={{
                  padding: '12px 32px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600,
                  background: selected ? '#00c9a7' : 'var(--bg-alt)', color: selected ? '#fff' : 'var(--text-main)',
                  border: `1px solid ${selected ? '#00c9a7' : 'var(--border-light)'}`
                }}
              >
                {opt}
              </div>
            )
          })}
        </div>
      </div>

      {hasProjects && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {projects.map((proj: any, idx: number) => (
            <motion.div key={idx} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ padding: '16px', background: 'var(--bg-alt)', borderRadius: '12px', border: '1px solid var(--border-light)', position: 'relative' }}>
              <button onClick={() => removeProject(idx)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}>
                <Trash2 size={18} />
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <input style={inputStyle} placeholder="Project Name" value={proj.name} onChange={e => updateProject(idx, 'name', e.target.value)} />
                <input style={inputStyle} placeholder="Technologies (comma separated)" value={proj.tech} onChange={e => updateProject(idx, 'tech', e.target.value)} />
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <select style={selectStyle} value={proj.difficulty} onChange={e => updateProject(idx, 'difficulty', e.target.value)}>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontFamily: 'Outfit', fontSize: '14px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={proj.deployed} onChange={e => updateProject(idx, 'deployed', e.target.checked)} /> Deployed
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontFamily: 'Outfit', fontSize: '14px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={proj.solo} onChange={e => updateProject(idx, 'solo', e.target.checked)} /> Solo Project
                  </label>
                </div>
              </div>
            </motion.div>
          ))}
          {projects.length < 5 && (
            <button onClick={addProject} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'transparent', border: '1px dashed var(--border-light)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', fontFamily: 'Outfit' }}>
              <Plus size={18} /> Add Project
            </button>
          )}
        </div>
      )}

      <div>
        <label style={labelStyle}>Real-world experience</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {EXPERIENCE_LEVELS.map(exp => (
            <div 
              key={exp}
              onClick={() => onChange({ ...data, realWorldExperience: exp })}
              style={{
                padding: '10px 16px', borderRadius: '24px', cursor: 'pointer', fontFamily: 'Outfit', fontSize: '14px',
                background: realWorldExperience === exp ? '#6c63ff' : 'var(--bg-alt)',
                color: realWorldExperience === exp ? '#fff' : 'var(--text-main)',
                border: `1px solid ${realWorldExperience === exp ? '#6c63ff' : 'var(--border-light)'}`
              }}
            >
              {exp}
            </div>
          ))}
        </div>
      </div>
    </OnboardingCard>
  );
}
