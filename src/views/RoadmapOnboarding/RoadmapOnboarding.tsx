"use client";
import React, { useState, useEffect } from 'react';
import { apiGet, apiSend } from '@/lib/api';
import EducationSection from './sections/EducationSection';
import CareerGoalSection from './sections/CareerGoalSection';
import SkillsSection from './sections/SkillsSection';
import ProjectsSection from './sections/ProjectsSection';
import LearningGoalSection from './sections/LearningGoalSection';
import TimeSection from './sections/TimeSection';
import PreferencesSection from './sections/PreferencesSection';
import TimelineSection from './sections/TimelineSection';
import AIFollowUpQuestions, { FollowUpQuestion } from './AIFollowUpQuestions';
import RoadmapGenerating from './RoadmapGenerating';

const SECTIONS = [
  { id: 'education', Component: EducationSection },
  { id: 'career', Component: CareerGoalSection },
  { id: 'skills', Component: SkillsSection },
  { id: 'projects', Component: ProjectsSection },
  { id: 'learning', Component: LearningGoalSection },
  { id: 'time', Component: TimeSection },
  { id: 'preferences', Component: PreferencesSection },
  { id: 'timeline', Component: TimelineSection },
];

export default function RoadmapOnboarding({ onComplete }: { onComplete: (roadmap: any) => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const [aiQuestions, setAiQuestions] = useState<FollowUpQuestion[]>([]);
  const [aiAnswers, setAiAnswers] = useState<Record<string, any>>({});
  const [isAiStep, setIsAiStep] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapToApi = (data: any, aiAns?: any) => {
    return {
      currentStudy: data.currentStudy,
      yearSemester: data.yearSemester,
      academicBackground: data.academicBackground,
      enjoyedSubjects: data.enjoyedSubjects,
      struggledSubjects: data.struggledSubjects,
      careerGoal: data.achieveGoal,
      targetRole: data.roleOfInterest === 'Other' && data.customRole ? data.customRole : data.roleOfInterest,
      knownSkills: data.skills ? data.skills.map((s: any) => ({
        skill: s.skill,
        confidence: (s.confidence || '').toLowerCase().replace(' ', '_')
      })) : undefined,
      hasProjects: data.hasProjects,
      projects: data.projects ? data.projects.map((p: any) => ({
        name: p.name,
        technologies: p.tech ? p.tech.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        difficulty: p.difficulty === 'Beginner' ? 'easy' : p.difficulty === 'Intermediate' ? 'medium' : 'hard',
        deployed: !!p.deployed,
        solo: !!p.solo
      })) : undefined,
      experienceLevel: data.realWorldExperience,
      wantToLearn: data.learningGoals,
      learningMotivation: data.reason,
      weeklyHours: data.weeklyHours,
      projectVsLearning: data.balance,
      learningStyles: data.learningPreferences,
      targetTimeline: data.timeline,
      topPriority: data.priority,
      ...(aiAns ? { aiFollowUpAnswers: aiAns } : {})
    };
  };

  const mapFromApi = (profile: any) => {
    return {
      currentStudy: profile.currentStudy,
      yearSemester: profile.yearSemester,
      academicBackground: profile.academicBackground,
      enjoyedSubjects: profile.enjoyedSubjects,
      struggledSubjects: profile.struggledSubjects,
      achieveGoal: profile.careerGoal,
      roleOfInterest: profile.targetRole,
      customRole: profile.targetRole,
      skills: profile.knownSkills ? profile.knownSkills.map((s: any) => ({
        skill: s.skill,
        confidence: s.confidence === 'very_confident' ? 'Very confident' : s.confidence === 'never_used' ? 'Never used' : s.confidence.charAt(0).toUpperCase() + s.confidence.slice(1)
      })) : undefined,
      hasProjects: profile.hasProjects,
      projects: profile.projects ? profile.projects.map((p: any) => ({
        name: p.name,
        tech: p.technologies ? p.technologies.join(', ') : '',
        difficulty: p.difficulty === 'easy' ? 'Beginner' : p.difficulty === 'medium' ? 'Intermediate' : 'Advanced',
        deployed: !!p.deployed,
        solo: !!p.solo
      })) : undefined,
      realWorldExperience: profile.experienceLevel,
      learningGoals: profile.wantToLearn,
      reason: profile.learningMotivation,
      weeklyHours: profile.weeklyHours,
      balance: profile.projectVsLearning,
      learningPreferences: profile.learningStyles,
      timeline: profile.targetTimeline,
      priority: profile.topPriority,
    };
  };

  useEffect(() => {
    // Attempt to load existing profile
    apiGet<{ profile: any }>('/api/roadmap/profile').then(res => {
      if (res && res.profile) {
        setFormData(prev => ({ ...prev, ...mapFromApi(res.profile) }));
      }
    }).catch(() => {});
  }, []);

  const handleNext = async () => {
    setError(null);
    if (currentStepIndex < SECTIONS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentStepIndex === SECTIONS.length - 1 && !isAiStep) {
      // Reached end of manual sections, save profile and fetch questions
      setIsLoading(true);
      try {
        const payload = mapToApi(formData);
        await apiSend('/api/roadmap/profile', 'PUT', payload);
        const res = await apiSend<{ needsMoreInformation: boolean; questions: FollowUpQuestion[] }>('/api/roadmap/questions', 'POST', payload);
        if (res.needsMoreInformation && res.questions && res.questions.length > 0) {
          setAiQuestions(res.questions);
          setIsAiStep(true);
        } else {
          // No follow-up questions needed, generate directly
          await generateRoadmap();
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (isAiStep) {
      // Finished AI questions, generate roadmap
      setIsLoading(true);
      try {
        await apiSend('/api/roadmap/profile', 'PUT', mapToApi(formData, aiAnswers));
        await generateRoadmap();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (isAiStep) {
      setIsAiStep(false);
    } else if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const generateRoadmap = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await apiSend<{ roadmap: any }>('/api/roadmap/generate', 'POST', {});
      // Wait for animation to finish before calling onComplete
      setTimeout(() => {
        onComplete(res.roadmap);
      }, 6000); // 1.5s per step * 4 steps
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      setError(err instanceof Error ? err.message : 'Failed to generate roadmap. Please try again.');
    }
  };

  const updateSectionData = (sectionId: string, data: any) => {
    setFormData(prev => ({ ...prev, [sectionId]: data }));
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '800px', margin: '0 auto', padding: '40px 20px',
    display: 'flex', flexDirection: 'column', gap: '32px'
  };

  const progressBarStyle: React.CSSProperties = {
    display: 'flex', gap: '8px', marginBottom: '24px'
  };

  const getDotStyle = (active: boolean, completed: boolean): React.CSSProperties => ({
    flex: 1, height: '6px', borderRadius: '3px',
    backgroundColor: active ? '#6c63ff' : completed ? 'var(--border-strong)' : 'var(--bg-alt)',
    transition: 'background-color 0.3s'
  });

  const btnStyle = (primary: boolean, disabled: boolean): React.CSSProperties => ({
    padding: '12px 24px', borderRadius: '8px', border: 'none',
    backgroundColor: primary ? '#6c63ff' : 'var(--bg-alt)',
    color: primary ? '#fff' : 'var(--text-main)',
    fontFamily: 'Outfit', fontWeight: 'bold', fontSize: '16px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1, transition: 'all 0.2s'
  });

  if (isGenerating) {
    return <RoadmapGenerating isOpen={isGenerating} onComplete={() => {}} />;
  }

  const CurrentSection = SECTIONS[currentStepIndex].Component;
  const currentSectionId = SECTIONS[currentStepIndex].id;

  return (
    <div style={containerStyle}>
      <div style={progressBarStyle}>
        {SECTIONS.map((s, i) => (
          <div key={s.id} style={getDotStyle(i === currentStepIndex && !isAiStep, i < currentStepIndex || isAiStep)} />
        ))}
        <div style={getDotStyle(isAiStep, false)} />
      </div>

      {!isAiStep ? (
        <CurrentSection 
          data={formData} 
          onChange={(d: any) => setFormData(d)} 
        />
      ) : (
        <AIFollowUpQuestions 
          questions={aiQuestions}
          answers={aiAnswers}
          onChange={setAiAnswers}
        />
      )}

      {error && (
        <p style={{ color: '#c0392b', fontFamily: 'Outfit', fontSize: '14px', margin: 0 }} role="alert">
          {error}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <button 
          onClick={handleBack} 
          style={{ ...btnStyle(false, currentStepIndex === 0 && !isAiStep), visibility: (currentStepIndex === 0 && !isAiStep) ? 'hidden' : 'visible' }}
        >
          Back
        </button>
        <button 
          onClick={handleNext} 
          disabled={isLoading}
          style={btnStyle(true, isLoading)}
        >
          {isLoading ? 'Loading...' : (isAiStep || currentStepIndex === SECTIONS.length - 1) ? 'Generate Roadmap ✨' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
