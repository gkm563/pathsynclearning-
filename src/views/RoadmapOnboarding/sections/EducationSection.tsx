"use client";
import React from 'react';
import { BookOpen, Check } from 'lucide-react';
import { OnboardingCard, Pill, StepHeader, inputStyle, labelStyle } from '../onboarding-ui';

const SUBJECTS = ["Mathematics", "Physics", "Programming", "Data Structures", "Databases", "Networks", "Operating Systems", "Web Development", "AI/ML", "Statistics", "Electronics", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "MSc", "PhD", "Other"];

export default function EducationSection({ data, onChange }: { data: any, onChange: (data: any) => void; hideRole?: boolean }) {
  const currentStudy = data.currentStudy || '';
  const yearSemester = data.yearSemester || '';
  const academicBackground = data.academicBackground || '';
  const enjoyedSubjects = data.enjoyedSubjects || [];
  const struggledSubjects = data.struggledSubjects || [];

  const toggleSubject = (field: 'enjoyedSubjects' | 'struggledSubjects', subject: string) => {
    const list = data[field] || [];
    if (list.includes(subject)) {
      onChange({ ...data, [field]: list.filter((s: string) => s !== subject) });
    } else {
      onChange({ ...data, [field]: [...list, subject] });
    }
  };

  return (
    <OnboardingCard accent="#6c63ff">
      <StepHeader icon={<BookOpen size={22} color="#6c63ff" />} kicker="Background" title="Education" subtitle="Skip school-level nodes you already finished, and slow down topics you struggle with." />

      <div>
        <label style={labelStyle}>Current study / degree</label>
        <input style={inputStyle} placeholder="e.g. B.Tech in Computer Science" value={currentStudy} onChange={(e) => onChange({ ...data, currentStudy: e.target.value })} />
      </div>

      <div>
        <label style={labelStyle}>Year / semester</label>
        <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={yearSemester} onChange={(e) => onChange({ ...data, yearSemester: e.target.value })}>
          <option value="">Select year…</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Academic background</label>
        <input style={inputStyle} placeholder="e.g. High school science with math" value={academicBackground} onChange={(e) => onChange({ ...data, academicBackground: e.target.value })} />
      </div>

      <div>
        <label style={labelStyle}>Subjects you enjoy</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SUBJECTS.map(sub => (
            <Pill key={sub} selected={enjoyedSubjects.includes(sub)} onClick={() => toggleSubject('enjoyedSubjects', sub)} accent="#6c63ff">
              {enjoyedSubjects.includes(sub) ? <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Check size={14} /> {sub}</span> : sub}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Subjects you struggle with</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SUBJECTS.map(sub => (
            <Pill key={`s-${sub}`} selected={struggledSubjects.includes(sub)} onClick={() => toggleSubject('struggledSubjects', sub)} accent="#f7971e">
              {struggledSubjects.includes(sub) ? <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Check size={14} /> {sub}</span> : sub}
            </Pill>
          ))}
        </div>
      </div>
    </OnboardingCard>
  );
}
