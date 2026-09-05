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
import RoadmapTypeSelect, { type RoadmapGenerationMode } from './RoadmapTypeSelect';
import RoadmapStartChoice from './RoadmapStartChoice';
import { resolvedTargetCompany, resolvedTargetRole } from '@/lib/roadmap/target-companies';
import { setRoadmapDeferred } from '@/lib/roadmap/defer';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/routes';

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

export default function RoadmapOnboarding({
  onComplete,
  onSkip,
}: {
  onComplete?: (roadmap: unknown) => void;
  onSkip?: () => void;
}) {
  const router = useRouter();
  const [showStartChoice, setShowStartChoice] = useState(true);
  const [generationMode, setGenerationMode] = useState<RoadmapGenerationMode | null>(null);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const [aiQuestions, setAiQuestions] = useState<FollowUpQuestion[]>([]);
  const [aiAnswers, setAiAnswers] = useState<Record<string, unknown>>({});
  const [isAiStep, setIsAiStep] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapToApi = (data: any, aiAns?: any) => {
    const targeted = generationMode === 'targeted';
    return {
      currentStudy: data.currentStudy,
      yearSemester: data.yearSemester,
      academicBackground: data.academicBackground,
      enjoyedSubjects: data.enjoyedSubjects,
      struggledSubjects: data.struggledSubjects,
      careerGoal: data.achieveGoal,
      targetRole: data.roleOfInterest === 'Other' && data.customRole ? data.customRole : data.roleOfInterest,
      targetCompany: targeted ? resolvedTargetCompany(data.targetCompany, data.customCompany) : null,
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
    apiGet<{ profile: any }>('/api/roadmap/profile').then(res => {
      if (res && res.profile) {
        setFormData(prev => ({ ...prev, ...mapFromApi(res.profile) }));
      }
    }).catch(() => {});
  }, []);

  const targetedReady =
    !!resolvedTargetCompany(formData.targetCompany, formData.customCompany) &&
    !!resolvedTargetRole(formData.roleOfInterest, formData.customRole);

  const skipForLater = () => {
    setRoadmapDeferred(true);
    if (onSkip) onSkip();
    else router.push(routes.app.dashboard);
  };

  const handleCreateFromStart = () => {
    setRoadmapDeferred(false);
    setShowStartChoice(false);
    setShowTypeSelect(true);
    setError(null);
  };

  const handleModeChange = (mode: RoadmapGenerationMode) => {
    setGenerationMode(mode);
    setError(null);
    if (mode === 'general') {
      setFormData((prev) => ({ ...prev, targetCompany: '', customCompany: '' }));
    }
  };

  const handleNext = async () => {
    setError(null);
    if (showStartChoice) return;
    if (showTypeSelect) {
      if (!generationMode) {
        setError('Choose how you want this roadmap generated.');
        return;
      }
      if (generationMode === 'targeted' && !targetedReady) {
        setError('Pick a target company and job role to continue.');
        return;
      }
      setShowTypeSelect(false);
      setCurrentStepIndex(0);
      return;
    }
    if (currentStepIndex < SECTIONS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentStepIndex === SECTIONS.length - 1 && !isAiStep) {
      setIsLoading(true);
      try {
        const payload = mapToApi(formData);
        await apiSend('/api/roadmap/profile', 'PUT', payload);
        const res = await apiSend<{ needsMoreInformation: boolean; questions: FollowUpQuestion[] }>('/api/roadmap/questions', 'POST', payload);
        if (res.needsMoreInformation && res.questions && res.questions.length > 0) {
          setAiQuestions(res.questions);
          setIsAiStep(true);
        } else {
          await generateRoadmap();
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (isAiStep) {
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
    } else if (!showStartChoice && !showTypeSelect) {
      setShowTypeSelect(true);
    } else if (showTypeSelect) {
      setShowTypeSelect(false);
      setShowStartChoice(true);
    }
  };

  const generateRoadmap = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await apiSend<{ roadmap: any }>('/api/roadmap/generate', 'POST', {});
      setRoadmapDeferred(false);
      setTimeout(() => {
        if (onComplete) onComplete(res.roadmap);
        else if (typeof window !== "undefined") {
          window.location.href = "/dashboard/roadmap";
        }
      }, 6000);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      setError(err instanceof Error ? err.message : 'Failed to generate roadmap. Please try again.');
    }
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
    const generatingCompany =
      generationMode === 'targeted'
        ? resolvedTargetCompany(formData.targetCompany, formData.customCompany)
        : null;
    const generatingRole = resolvedTargetRole(formData.roleOfInterest, formData.customRole) || undefined;

    return (
      <RoadmapGenerating
        isOpen={isGenerating}
        onComplete={() => {}}
        targetCompany={generatingCompany}
        targetRole={generatingRole}
      />
    );
  }

  const CurrentSection = SECTIONS[currentStepIndex].Component;
  const continueDisabled =
    isLoading ||
    showStartChoice ||
    (showTypeSelect && (!generationMode || (generationMode === 'targeted' && !targetedReady)));
  const hideNav = showStartChoice;
  const hideBack = showStartChoice;
  const inFormSteps = !showStartChoice && !showTypeSelect;

  return (
    <div style={containerStyle}>
      <div style={progressBarStyle}>
        <div style={getDotStyle(showStartChoice, !showStartChoice)} />
        <div style={getDotStyle(showTypeSelect, inFormSteps || isAiStep)} />
        {SECTIONS.map((s, i) => (
          <div key={s.id} style={getDotStyle(inFormSteps && i === currentStepIndex && !isAiStep, inFormSteps && (i < currentStepIndex || isAiStep))} />
        ))}
        <div style={getDotStyle(isAiStep, false)} />
      </div>

      {showStartChoice ? (
        <RoadmapStartChoice onCreate={handleCreateFromStart} onSkip={skipForLater} />
      ) : showTypeSelect ? (
        <RoadmapTypeSelect
          mode={generationMode}
          data={formData}
          onModeChange={handleModeChange}
          onChange={setFormData}
        />
      ) : !isAiStep ? (
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

      {hideNav ? null : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', gap: 12 }}>
          <button
            onClick={handleBack}
            style={{ ...btnStyle(false, hideBack), visibility: hideBack ? 'hidden' : 'visible' }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={skipForLater}
            style={{
              ...btnStyle(false, false),
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            Skip for later
          </button>
          <button
            onClick={handleNext}
            disabled={continueDisabled}
            style={btnStyle(true, continueDisabled)}
          >
            {isLoading ? 'Loading...' : (isAiStep || (inFormSteps && currentStepIndex === SECTIONS.length - 1)) ? 'Generate Roadmap ✨' : 'Continue'}
          </button>
        </div>
      )}
    </div>
  );
}
