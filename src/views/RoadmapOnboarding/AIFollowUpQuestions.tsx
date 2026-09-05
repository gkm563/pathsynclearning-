"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Check } from 'lucide-react';

import { OnboardingCard, StepHeader } from './onboarding-ui';

export type FollowUpQuestion = {
  id: string;
  type: 'single_choice' | 'multi_choice' | 'text' | 'rating';
  question: string;
  options?: string[];
  reason?: string;
};

interface AIFollowUpQuestionsProps {
  questions: FollowUpQuestion[];
  answers: Record<string, any>;
  onChange: (answers: Record<string, any>) => void;
  mode?: 'targeted' | 'general' | null;
}

export default function AIFollowUpQuestions({ questions, answers, onChange, mode }: AIFollowUpQuestionsProps) {
  
  const handleUpdate = (id: string, value: any) => {
    onChange({ ...answers, [id]: value });
  };

  return (
    <OnboardingCard accent={mode === 'targeted' ? '#6c63ff' : '#00c9a7'}>
      <StepHeader
        icon={<Brain size={22} color="#6c63ff" />}
        kicker={mode === 'targeted' ? 'Company-only questions' : 'Role-only questions'}
        title={mode === 'targeted' ? 'Hiring-loop details' : 'Role-path details'}
        subtitle={
          mode === 'targeted'
            ? 'These are not the same as the role-path questions. We only fill gaps that change this company’s interview plan.'
            : 'These are not company questions. We only fill gaps that change this role’s curriculum.'
        }
      />

      {questions.map((q, i) => (
        <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '24px', backgroundColor: 'var(--bg-alt)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'Outfit', marginBottom: '8px' }}>
            {q.question}
          </div>
          {q.reason && (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'Outfit', marginBottom: '16px', fontStyle: 'italic' }}>
              Why we ask: {q.reason}
            </div>
          )}

          {q.type === 'text' && (
            <input 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'Outfit', fontSize: '16px', outline: 'none' }}
              value={answers[q.id] || ''}
              onChange={e => handleUpdate(q.id, e.target.value)}
              placeholder="Type your answer here..."
            />
          )}

          {q.type === 'single_choice' && q.options && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {q.options.map(opt => {
                const selected = answers[q.id] === opt;
                return (
                  <div 
                    key={opt}
                    onClick={() => handleUpdate(q.id, opt)}
                    style={{ padding: '10px 16px', borderRadius: '24px', border: `1px solid ${selected ? '#00c9a7' : 'var(--border-light)'}`, backgroundColor: selected ? '#00c9a7' : 'var(--bg-main)', color: selected ? '#fff' : 'var(--text-main)', cursor: 'pointer', fontFamily: 'Outfit', fontSize: '14px', transition: 'all 0.2s' }}
                  >
                    {opt}
                  </div>
                )
              })}
            </div>
          )}

          {q.type === 'multi_choice' && q.options && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {q.options.map(opt => {
                const current = answers[q.id] || [];
                const selected = current.includes(opt);
                return (
                  <div 
                    key={opt}
                    onClick={() => {
                      if (selected) {
                        handleUpdate(q.id, current.filter((x: string) => x !== opt));
                      } else {
                        handleUpdate(q.id, [...current, opt]);
                      }
                    }}
                    style={{ padding: '10px 16px', borderRadius: '24px', border: `1px solid ${selected ? '#f7971e' : 'var(--border-light)'}`, backgroundColor: selected ? '#f7971e' : 'var(--bg-main)', color: selected ? '#fff' : 'var(--text-main)', cursor: 'pointer', fontFamily: 'Outfit', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                  >
                    {selected && <Check size={14} />} {opt}
                  </div>
                )
              })}
            </div>
          )}

          {q.type === 'rating' && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <div 
                  key={val}
                  onClick={() => handleUpdate(q.id, val)}
                  style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: `1px solid ${answers[q.id] === val ? '#6c63ff' : 'var(--border-light)'}`, backgroundColor: answers[q.id] === val ? '#6c63ff' : 'var(--bg-main)', color: answers[q.id] === val ? '#fff' : 'var(--text-main)', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, transition: 'all 0.2s' }}
                >
                  {val}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </OnboardingCard>
  );
}
