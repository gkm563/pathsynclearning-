"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check } from 'lucide-react';

const SUBJECTS = ["Mathematics", "Physics", "Programming", "Data Structures", "Databases", "Networks", "Operating Systems", "Web Development", "AI/ML", "Statistics", "Electronics", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "MSc", "PhD", "Other"];

export default function EducationSection({ data, onChange }: { data: any, onChange: (data: any) => void }) {
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

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    backgroundColor: 'var(--bg-card)',
    padding: '32px',
    borderRadius: '16px',
    border: '1px solid var(--border-light)'
  };

  const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'Outfit',
    color: 'var(--text-main)',
    marginBottom: '8px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: 'var(--text-main)',
    fontFamily: 'Outfit'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-main)',
    fontFamily: 'Outfit',
    fontSize: '16px',
    outline: 'none'
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    cursor: 'pointer'
  };

  const pillContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  };

  const getPillStyle = (selected: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '24px',
    border: `1px solid ${selected ? '#6c63ff' : 'var(--border-light)'}`,
    backgroundColor: selected ? '#6c63ff' : 'var(--bg-alt)',
    color: selected ? '#fff' : 'var(--text-main)',
    cursor: 'pointer',
    fontFamily: 'Outfit',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  });

  return (
    <motion.div style={containerStyle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={titleStyle}>
        <BookOpen size={28} color="#6c63ff" />
        📚 Education
      </div>
      
      <div>
        <label style={labelStyle}>Current Study / Degree</label>
        <input 
          style={inputStyle} 
          placeholder="e.g. B.Tech in Computer Science"
          value={currentStudy}
          onChange={(e) => onChange({ ...data, currentStudy: e.target.value })}
        />
      </div>

      <div>
        <label style={labelStyle}>Year / Semester</label>
        <select 
          style={selectStyle}
          value={yearSemester}
          onChange={(e) => onChange({ ...data, yearSemester: e.target.value })}
        >
          <option value="">Select Year...</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Academic Background</label>
        <input 
          style={inputStyle} 
          placeholder="e.g. High school science with math..."
          value={academicBackground}
          onChange={(e) => onChange({ ...data, academicBackground: e.target.value })}
        />
      </div>

      <div>
        <label style={labelStyle}>Subjects you enjoy</label>
        <div style={pillContainerStyle}>
          {SUBJECTS.map(sub => {
            const selected = enjoyedSubjects.includes(sub);
            return (
              <div key={sub} style={getPillStyle(selected)} onClick={() => toggleSubject('enjoyedSubjects', sub)}>
                {selected && <Check size={14} />} {sub}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Subjects you struggle with</label>
        <div style={pillContainerStyle}>
          {SUBJECTS.map(sub => {
            const selected = struggledSubjects.includes(sub);
            return (
              <div key={sub} style={getPillStyle(selected)} onClick={() => toggleSubject('struggledSubjects', sub)}>
                {selected && <Check size={14} />} {sub}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  );
}
