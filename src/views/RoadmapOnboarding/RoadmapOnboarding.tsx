"use client";
import React, { useState, useEffect } from 'react';
import { apiGet, apiSend, streamRoadmapGenerate } from '@/lib/api';
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
import { resolvedTargetCompany, resolvedTargetRole } from '@/lib/roadmap/hiring-catalog';
import { setRoadmapDeferred } from '@/lib/roadmap/defer';
import { progressFor, type RoadmapGenerationProgress } from '@/lib/roadmap/generation-progress';
import { useRouter, usePathname } from 'next/navigation';
import { routes } from '@/lib/routes';
import { Alert, Button } from '@/components/ui';
import { cn } from '@/lib/cn';

const CORE_SECTIONS = [
  { id: 'education', Component: EducationSection },
  { id: 'career', Component: CareerGoalSection },
  { id: 'skills', Component: SkillsSection },
  { id: 'projects', Component: ProjectsSection },
  { id: 'time', Component: TimeSection },
  { id: 'preferences', Component: PreferencesSection },
  { id: 'timeline', Component: TimelineSection },
];

const GENERAL_SECTIONS = [
  ...CORE_SECTIONS.slice(0, 4),
  { id: 'learning', Component: LearningGoalSection },
  ...CORE_SECTIONS.slice(4),
];

export default function RoadmapOnboarding({
  onComplete,
  onSkip,
}: {
  onComplete?: (roadmap: unknown) => void;
  onSkip?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const fromRoadmap = Boolean(pathname?.startsWith(routes.app.roadmap));
  const [showStartChoice, setShowStartChoice] = useState(!fromRoadmap);
  const [generationMode, setGenerationMode] = useState<RoadmapGenerationMode | null>(null);
  const [showTypeSelect, setShowTypeSelect] = useState(fromRoadmap);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const [aiQuestions, setAiQuestions] = useState<FollowUpQuestion[]>([]);
  const [aiAnswers, setAiAnswers] = useState<Record<string, unknown>>({});
  const [isAiStep, setIsAiStep] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState<RoadmapGenerationProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sections = generationMode === 'general' ? GENERAL_SECTIONS : CORE_SECTIONS;

  const mapToApi = (data: any, aiAns?: any) => {
    const targeted = generationMode === 'targeted';
    return {
      currentStudy: data.currentStudy,
      yearSemester: data.yearSemester,
      academicBackground: data.academicBackground,
      enjoyedSubjects: data.enjoyedSubjects,
      struggledSubjects: data.struggledSubjects,
      careerGoal: data.achieveGoal,
      targetRole: resolvedTargetRole(data.roleOfInterest, data.customRole),
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
      ...(aiAns ? { aiFollowUpAnswers: { ...aiAns, generationMode } } : { aiFollowUpAnswers: { generationMode } })
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
      targetCompany: profile.targetCompany || '',
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

  const roleReady = !!resolvedTargetRole(formData.roleOfInterest, formData.customRole);
  const targetedReady =
    !!resolvedTargetCompany(formData.targetCompany, formData.customCompany) && roleReady;

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
    setAiQuestions([]);
    setAiAnswers({});
    setIsAiStep(false);
    if (mode === 'general') {
      setFormData((prev) => ({ ...prev, targetCompany: '', customCompany: '' }));
    }
  };

  const handleNext = async () => {
    setError(null);
    if (showStartChoice) return;
    if (showTypeSelect) {
      if (!generationMode) {
        setError('Choose company hiring or a role path.');
        return;
      }
      if (generationMode === 'targeted' && !targetedReady) {
        setError('Pick a company and a role that company hires.');
        return;
      }
      if (generationMode === 'general' && !roleReady) {
        setError('Pick the role this roadmap is for.');
        return;
      }
      if (generationMode === 'targeted') {
        try {
          const companyName = resolvedTargetCompany(formData.targetCompany, formData.customCompany);
          const roleName = resolvedTargetRole(formData.roleOfInterest, formData.customRole);
          const check = await apiSend<{ ok: boolean; message: string }>('/api/roadmap/catalog', 'POST', {
            company: companyName,
            role: roleName,
          });
          if (!check.ok) {
            setError(check.message);
            return;
          }
        } catch {
          // continue with local selection if catalog is unavailable
        }
      }
      setShowTypeSelect(false);
      setCurrentStepIndex(0);
      return;
    }
    if (currentStepIndex < sections.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentStepIndex === sections.length - 1 && !isAiStep) {
      setIsLoading(true);
      try {
        const payload = mapToApi(formData);
        await apiSend('/api/roadmap/profile', 'PUT', payload);
        const res = await apiSend<{ needsMoreInformation: boolean; questions: FollowUpQuestion[] }>('/api/roadmap/questions', 'POST', { mode: generationMode });
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
    } else if (showTypeSelect && !fromRoadmap) {
      setShowTypeSelect(false);
      setShowStartChoice(true);
    }
  };

  const generateRoadmap = async () => {
    setIsGenerating(true);
    setError(null);
    setGenProgress(progressFor('profile'));
    try {
      const res = await streamRoadmapGenerate((p) => {
        setGenProgress({
          step: p.step as RoadmapGenerationProgress['step'],
          percent: p.percent,
          message: p.message,
        });
      });
      setRoadmapDeferred(false);
      setGenProgress(progressFor('done'));
      if (onComplete) onComplete(res.roadmap);
      else if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/roadmap';
      }
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      setGenProgress(null);
      setError(err instanceof Error ? err.message : 'Failed to generate roadmap. Please try again.');
    }
  };

  if (isGenerating) {
    const generatingCompany =
      generationMode === 'targeted'
        ? resolvedTargetCompany(formData.targetCompany, formData.customCompany)
        : null;
    const generatingRole = resolvedTargetRole(formData.roleOfInterest, formData.customRole) || undefined;

    return (
      <RoadmapGenerating
        isOpen={isGenerating}
        progress={genProgress}
        error={null}
        targetCompany={generatingCompany}
        targetRole={generatingRole}
      />
    );
  }

  const CurrentSection = sections[currentStepIndex]?.Component;
  const typeSelectBlocked =
    showTypeSelect &&
    (!generationMode ||
      (generationMode === 'targeted' && !targetedReady) ||
      (generationMode === 'general' && !roleReady));
  const continueDisabled = isLoading || showStartChoice || typeSelectBlocked;
  const hideNav = showStartChoice;
  const hideBack = showStartChoice || (fromRoadmap && showTypeSelect);
  const inFormSteps = !showStartChoice && !showTypeSelect;

  const stepLabels = [
    ...(fromRoadmap ? [] : ['Start']),
    'Path',
    ...sections.map((s) => s.id),
    'Focus',
  ];
  const activeStep = showStartChoice
    ? 0
    : showTypeSelect
      ? fromRoadmap ? 0 : 1
      : isAiStep
        ? stepLabels.length - 1
        : (fromRoadmap ? 1 : 2) + currentStepIndex;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-7 sm:px-6">
      <div className="flex flex-wrap gap-1.5" aria-label="Onboarding progress">
        {stepLabels.map((label, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <div key={label} className="min-w-14 flex-1">
              <div
                className={cn(
                  "h-1.5 rounded-full",
                  active ? "bg-primary" : done ? "bg-success" : "bg-sunken",
                )}
              />
              <p
                className={cn(
                  "type-caption mt-1.5 mb-0 capitalize",
                  active ? "font-semibold text-ink" : "text-muted",
                )}
              >
                {label}
              </p>
            </div>
          );
        })}
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
      ) : !isAiStep && CurrentSection ? (
        <CurrentSection
          data={formData}
          onChange={(d: Record<string, unknown>) => setFormData(d)}
          hideRole
        />
      ) : (
        <AIFollowUpQuestions
          questions={aiQuestions}
          answers={aiAnswers}
          onChange={setAiAnswers}
          mode={generationMode}
        />
      )}

      {error ? (
        <Alert tone="error" title="Couldn't continue">
          {error}
        </Alert>
      ) : null}

      {hideNav ? null : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            className={hideBack ? "invisible" : undefined}
          >
            Back
          </Button>
          {fromRoadmap ? <span /> : (
            <Button type="button" variant="ghost" onClick={skipForLater}>
              Skip for later
            </Button>
          )}
          <Button
            type="button"
            onClick={() => void handleNext()}
            disabled={continueDisabled}
            loading={isLoading}
          >
            {isLoading
              ? "Loading..."
              : isAiStep || (inFormSteps && currentStepIndex === sections.length - 1)
                ? "Generate roadmap"
                : "Continue"}
          </Button>
        </div>
      )}
    </div>
  );
}
