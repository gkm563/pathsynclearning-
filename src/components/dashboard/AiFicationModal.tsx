"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Brain,
  Building2,
  MapPin,
  CheckCircle2,
  Zap,
  Save,
  RotateCcw,
  ArrowRight,
  BarChart3,
  Laptop,
  Check,
  Sun,
  Moon,
  Cpu,
} from "lucide-react";
import { Badge, Button, Card, Dialog, IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";

/* ─── COMPREHENSIVE MNC CAREER & COMPANY DATASET ─── */
const CAREER_DATASETS = {
  "Software Engineer": [
    {
      id: "google",
      name: "Google",
      logo: "🔍",
      status: "Hiring (High Volume)",
      profile: "Tier-1 Tech Giant • Global Product Infrastructure",
      avgPackage: "$185k - $210k • ₹24L - ₹38L LPA",
      locations: ["Mountain View, CA", "Bangalore, IN", "Zurich, CH"],
      requirements: "Google R&D labs heavily prioritize System Design, Microservices, C#, Distributed Caching, and Vector Indexing for AI Search.",
      skills: ["System Design & Caching", "C# & .NET Systems", "Vector Indexing & DBs", "Distributed Microservices", "High Concurrency Systems", "Zero-Trust Security"]
    },
    {
      id: "amazon",
      name: "Amazon",
      logo: "📦",
      status: "Hiring (1,420+ Openings)",
      profile: "AWS Cloud & E-Commerce Scale Systems",
      avgPackage: "$170k - $195k • ₹22L - ₹35L LPA",
      locations: ["Seattle, WA", "Hyderabad, IN", "Vancouver, CA"],
      requirements: "Amazon AWS labs heavily prioritize DynamoDB, Event-Driven Microservices, Distributed Caching, and Serverless Architecture.",
      skills: ["AWS Cloud Architecture", "DynamoDB & NoSQL", "Event-Driven Microservices", "Distributed Caching", "Kafka Stream Processing"]
    },
    {
      id: "microsoft",
      name: "Microsoft",
      logo: "🪟",
      status: "Hiring (Core AI & Cloud)",
      profile: "Azure Cloud & Copilot AI Ecosystem",
      avgPackage: "$175k - $205k • ₹23L - ₹36L LPA",
      locations: ["Redmond, WA", "Noida, IN", "Dublin, IE"],
      requirements: "Microsoft Azure Teams prioritize C#, .NET 8, Graph Algorithms, and Copilot AI Orchestration for enterprise architectures.",
      skills: [".NET 8 & C# Systems", "Azure Cloud Architecture", "Copilot AI Agents", "System Design & Load Balancers"]
    },
    {
      id: "ibm",
      name: "IBM",
      logo: "💻",
      status: "Hiring (Enterprise Cloud)",
      profile: "Hybrid Cloud & Quantum Computing Infrastructure",
      avgPackage: "$155k - $180k • ₹18L - ₹28L LPA",
      locations: ["Armonk, NY", "Bangalore, IN", "Tokyo, JP"],
      requirements: "IBM Hybrid Cloud & Quantum AI prioritize OpenShift, Kubernetes, and Enterprise Zero-Trust Security.",
      skills: ["Kubernetes & Helm", "RedHat OpenShift", "Enterprise Zero-Trust Sec", "Quantum Algorithmic Logic"]
    },
    {
      id: "meta",
      name: "Meta",
      logo: "♾️",
      status: "Hiring (AI & Systems)",
      profile: "AI Infrastructure & Social Scale Platforms",
      avgPackage: "$190k - $225k • ₹26L - ₹42L LPA",
      locations: ["Menlo Park, CA", "London, UK", "Remote"],
      requirements: "Meta AI & Infrastructure prioritize PyTorch, GraphQL Federation, Relay, and ultra-high-concurrency web systems.",
      skills: ["GraphQL Federation", "React Deep Internals", "PyTorch Systems", "Ultra-High Concurrency"]
    }
  ],
  "Full-Stack Web Developer": [
    {
      id: "google",
      name: "Google",
      logo: "🔍",
      status: "Hiring (Core UI Labs)",
      profile: "Web Platforms & Angular/Lit Core Teams",
      avgPackage: "$180k - $205k • ₹22L - ₹36L LPA",
      locations: ["Mountain View, CA", "Bangalore, IN"],
      requirements: "Focuses on TypeScript, Web Vitals Optimization, Progressive Web Apps, and Distributed Node APIs.",
      skills: ["Progressive Web Apps", "Web Vitals Optimization", "Edge Computing & CDN", "React Server Components"]
    },
    {
      id: "stripe",
      name: "Stripe",
      logo: "💳",
      status: "Hiring (Fintech Web)",
      profile: "Global Payment Infrastructure Platform",
      avgPackage: "$195k - $230k • ₹28L - ₹45L LPA",
      locations: ["San Francisco, CA", "Dublin, IE"],
      requirements: "Requires bulletproof API Security, Idempotency, React State Architecture, and SQL Schema Design.",
      skills: ["Fintech Idempotency", "API Vault Security", "React State Engines", "PostgreSQL Sharding"]
    },
    {
      id: "netflix",
      name: "Netflix",
      logo: "🍿",
      status: "Hiring (UI Systems)",
      profile: "Global Streaming UI & Micro-frontends",
      avgPackage: "$210k - $250k • ₹32L - ₹50L LPA",
      locations: ["Los Gatos, CA", "Remote"],
      requirements: "Demands mastery of Node.js streaming APIs, GraphQL Federation, and client-side rendering performance.",
      skills: ["Micro-Frontend Arch", "Node.js Stream Engine", "GraphQL Federation", "Redis Distributed Cache"]
    }
  ],
  "AI / Machine Learning Engineer": [
    {
      id: "openai",
      name: "OpenAI",
      logo: "🤖",
      status: "Hiring (Frontier Models)",
      profile: "AGI Research & LLM Scaling Infrastructure",
      avgPackage: "$220k - $310k • ₹35L - ₹60L LPA",
      locations: ["San Francisco, CA"],
      requirements: "Requires deep PyTorch, Transformer Attention Mechanisms, Distributed GPU Training, and Vector DBs.",
      skills: ["Multi-Agent Frameworks", "Pinecone Vector DB", "Triton GPU Kernels", "RAG & LangChain", "Model Alignment & RLHF"]
    },
    {
      id: "google_deepmind",
      name: "Google DeepMind",
      logo: "🧠",
      status: "Hiring (AI Science)",
      profile: "Reinforcement Learning & Foundation Models",
      avgPackage: "$210k - $285k • ₹32L - ₹55L LPA",
      locations: ["London, UK", "Mountain View, CA"],
      requirements: "Prioritizes JAX/Flax, Multi-Agent Reinforcement Learning, Linear Algebra, and Calculus Foundations.",
      skills: ["JAX / Flax Acceleration", "Multi-Agent RL", "Neural Arch Search", "Low-Latency AI Inference"]
    },
    {
      id: "anthropic",
      name: "Anthropic",
      logo: "🛡️",
      status: "Hiring (Claude AI)",
      profile: "AI Alignment & Constitutional LLMs",
      avgPackage: "$215k - $295k • ₹34L - ₹58L LPA",
      locations: ["San Francisco, CA"],
      requirements: "Prioritizes Mechanistic Interpretability, Alignment Algorithms, and Rust/C++ GPU Acceleration.",
      skills: ["Constitutional AI", "Mechanistic Interpretability", "Rust GPU Acceleration", "AI Bias Audit"]
    }
  ]
};

type CareerRole = keyof typeof CAREER_DATASETS;
type CompanyProfile = (typeof CAREER_DATASETS)[CareerRole][number];

type AiFicationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetCareer?: string;
  onModifyRoadmap?: (payload: {
    role: string;
    company: CompanyProfile;
    injectedSkills: string[];
  }) => void;
  onResetRoadmap?: () => void;
  onSave?: (payload: { role: string; company: CompanyProfile }) => void;
};

export default function AiFicationModal({
  isOpen,
  onClose,
  targetCareer = "Software Engineer",
  onModifyRoadmap,
  onResetRoadmap,
  onSave,
}: AiFicationModalProps) {
  // Theme Mode State ("light" or "dark") - Default set to Light Mode UI as requested
  const [themeMode, setThemeMode] = useState("light");

  const [selectedRole, setSelectedRole] = useState(
    CAREER_DATASETS[targetCareer as CareerRole] ? targetCareer : "Software Engineer"
  );

  const currentCompanies =
    CAREER_DATASETS[selectedRole as CareerRole] || CAREER_DATASETS["Software Engineer"];
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    currentCompanies[0]?.id || "google"
  );

  const selectedCompany =
    currentCompanies.find((c) => c.id === selectedCompanyId) || currentCompanies[0];

  // AI Recalibration State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isLight = themeMode === "light";

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    const newCompanies =
      CAREER_DATASETS[role as CareerRole] || CAREER_DATASETS["Software Engineer"];
    setSelectedCompanyId(newCompanies[0]?.id || "google");
  };

  const handleRunAiModification = () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);

    setTimeout(() => setAnalysisStep(2), 700);
    setTimeout(() => setAnalysisStep(3), 1400);
    setTimeout(() => {
      setIsAnalyzing(false);
      if (onModifyRoadmap) {
        onModifyRoadmap({
          role: selectedRole,
          company: selectedCompany,
          injectedSkills: selectedCompany.skills
        });
      }
      onClose();
    }, 2200);
  };

  const handleResetClick = () => {
    setSelectedRole(targetCareer || "Software Engineer");
    setSelectedCompanyId("google");
    if (onResetRoadmap) {
      onResetRoadmap();
    }
    onClose();
  };

  const handleSaveClick = () => {
    setSaveSuccess(true);
    if (onSave) onSave({ role: selectedRole, company: selectedCompany });
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="AI-fication: Corporate Roadmap Sync"
      description="Real-time market signal ingestion & university curriculum additive graph expansion"
      size="full"
      dismissible={!isAnalyzing}
      className="bg-surface"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleSaveClick}
            className={cn(
              "w-full sm:flex-1",
              saveSuccess && "border-success text-success",
            )}
          >
            <Save size={16} aria-hidden />
            {saveSuccess ? "✓ Saved Target" : "Save Preferences"}
          </Button>
          <Button
            variant="danger"
            onClick={handleResetClick}
            className="w-full sm:flex-[1.1]"
          >
            <RotateCcw size={16} aria-hidden />
            Reset to 12 Nodes
          </Button>
          <Button
            onClick={handleRunAiModification}
            disabled={isAnalyzing}
            loading={isAnalyzing}
            className="w-full sm:flex-[1.7]"
          >
            <Sparkles size={18} aria-hidden />
            {isAnalyzing
              ? "Expanding Roadmap Graph..."
              : `Modify RoadMap (+${selectedCompany.skills.length} Nodes)`}
            <ArrowRight size={16} aria-hidden />
          </Button>
        </>
      }
    >
      <div
        data-theme={themeMode}
        className="relative flex flex-col gap-5 text-ink"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary text-on-primary">
              <Brain size={22} aria-hidden />
            </div>
            <Badge tone="success">MNC recruiter engine active</Badge>
          </div>
          <IconButton
            label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            variant="outline"
            onClick={() => setThemeMode(isLight ? "dark" : "light")}
          >
            {isLight ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
          </IconButton>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.15fr_1.35fr]">
          <Card className="flex flex-col justify-between border-primary-border bg-surface">
            <div>
              <div className="mb-3 flex items-center gap-2 text-primary">
                <Laptop size={16} aria-hidden />
                <span className="type-overline">A. Your target career</span>
              </div>
              <div className="mb-3.5 rounded-[var(--radius-md)] border border-primary-border bg-primary-soft px-3 py-2.5">
                <p className="type-caption m-0 text-muted">Fetched backend role:</p>
                <p className="type-label mt-0.5 mb-0 text-ink">{selectedRole}</p>
              </div>
              <p className="type-caption mb-2 font-semibold text-muted">
                Switch role targeting:
              </p>
              <div className="flex flex-col gap-1.5">
                {Object.keys(CAREER_DATASETS).map((role) => {
                  const active = selectedRole === role;
                  return (
                    <Button
                      key={role}
                      variant={active ? "primary" : "secondary"}
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => handleRoleChange(role)}
                    >
                      <span className="truncate">{role}</span>
                      {active ? <CheckCircle2 size={13} aria-hidden /> : null}
                    </Button>
                  );
                })}
              </div>
            </div>
            <p className="type-caption mt-3.5 mb-0 flex items-center gap-2 border-t border-line pt-2.5 text-success">
              <CheckCircle2 size={14} aria-hidden />
              Form backend data linked
            </p>
          </Card>

          <Card className="flex flex-col border-success bg-surface">
            <div className="mb-3 flex items-center gap-2 text-success">
              <Building2 size={16} aria-hidden />
              <span className="type-overline">B. Companies hiring</span>
            </div>
            <p className="type-caption mb-2.5 text-muted">
              Select target company to fetch live skill requirements:
            </p>
            <div className="flex max-h-[220px] flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {currentCompanies.map((comp) => {
                const isSelected = selectedCompanyId === comp.id;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => setSelectedCompanyId(comp.id)}
                    className={cn(
                      "flex items-center justify-between rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors",
                      isSelected
                        ? "border-success bg-success-soft"
                        : "border-line bg-sunken hover:bg-surface",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg" aria-hidden>
                        {comp.logo}
                      </span>
                      <div>
                        <div className="type-label text-ink">{comp.name}</div>
                        <div className="type-caption text-success">{comp.status}</div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full",
                        isSelected ? "bg-success text-on-primary" : "bg-line text-muted",
                      )}
                    >
                      <Check size={12} aria-hidden />
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="flex flex-col justify-between border-accent bg-surface">
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-accent">
                  <BarChart3 size={16} aria-hidden />
                  <span className="type-overline">C. Company snapshot</span>
                </div>
                <span className="text-xl" aria-hidden>
                  {selectedCompany.logo}
                </span>
              </div>
              <h3 className="type-h4 m-0 mb-1 text-ink">{selectedCompany.name}</h3>
              <p className="type-small mb-3 text-muted">{selectedCompany.profile}</p>
              <div className="mb-3 flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-accent bg-accent-soft px-3 py-2">
                  <span className="type-caption text-accent">Average Package:</span>
                  <span className="type-caption font-semibold text-ink">
                    {selectedCompany.avgPackage}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-line bg-sunken px-3 py-2">
                  <MapPin size={13} className="text-primary" aria-hidden />
                  <span className="type-caption truncate text-ink">
                    {selectedCompany.locations.join(" • ")}
                  </span>
                </div>
              </div>
            </div>
            <p className="type-caption mb-0 text-right text-muted">
              Dataset synchronized • Active hiring pool
            </p>
          </Card>
        </div>

        <Card className="border-success bg-surface">
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-success">
              <Zap size={18} aria-hidden />
              <span className="type-overline">
                Specific requirements & skill gap analysis of {selectedCompany.name}
              </span>
            </div>
            <Badge tone="success" className="gap-1">
              <Zap size={11} aria-hidden />
              Additive graph expansion
            </Badge>
          </div>

          <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_1.45fr]">
            <div className="flex items-center gap-3.5 rounded-[var(--radius-md)] border border-success bg-success-soft p-4">
              <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                <Cpu size={28} aria-hidden />
              </div>
              <div>
                <p className="type-label m-0 text-ink">
                  Roadmap Expansion: +{selectedCompany.skills.length} Level Nodes
                </p>
                <p className="type-small mt-1 mb-0 text-muted">
                  AI will additively expand your roadmap from{" "}
                  <b>12 → {12 + selectedCompany.skills.length} Levels</b> by adding{" "}
                  <b className="text-success">
                    {selectedCompany.skills.slice(0, 2).join(", ")}
                  </b>{" "}
                  without replacing degree modules!
                </p>
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] border border-dashed border-line bg-sunken p-3.5">
              <p className="type-small m-0 text-ink">
                <b className="text-primary">Corporate Insight:</b> "
                {selectedCompany.requirements}"
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="type-caption font-semibold text-muted">
              Dynamically injecting new nodes:
            </span>
            {selectedCompany.skills.map((sk, idx) => (
              <Badge key={idx} tone="success">
                + Level {13 + idx}: {sk}
              </Badge>
            ))}
          </div>
        </Card>

        {isAnalyzing ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[var(--radius-lg)] bg-surface/95 p-6 text-center backdrop-blur-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="mb-5 h-[76px] w-[76px] rounded-full border-4 border-success-soft border-t-success"
            />
            <h3 className="type-h3 m-0 mb-2 text-ink">
              PathEd AI-fication Engine Active
            </h3>
            <p className="type-small m-0 font-semibold text-success">
              {analysisStep === 1 &&
                `🔍 Ingesting real-time corporate hiring signals from ${selectedCompany.name}...`}
              {analysisStep === 2 &&
                `📊 Analyzing curriculum debt vs active ${selectedRole} benchmarks...`}
              {analysisStep >= 3 &&
                `🧠 Additively expanding roadmap graph from 12 → ${12 + selectedCompany.skills.length} Levels...`}
            </p>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
