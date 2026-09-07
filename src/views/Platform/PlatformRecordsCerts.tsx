"use client";

import { useState, type ComponentType } from "react";
import {
  Award,
  Binary,
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  GraduationCap,
  Layers,
  Link2,
  Medal,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Flame,
  Database,
  GitBranch,
  Code2,
  Swords,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  IconButton,
  PageHeader,
  StatCard,
  TabPanel,
  Tabs,
  useToast,
} from "@/components/ui";

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  idCode: string;
  status: string;
  skills: string[];
  bgGradient: string;
  borderCol: string;
  icon: string;
};

type SkillBadge = {
  name: string;
  icon: string;
  desc: string;
  color: string;
};

type AcademicRecord = {
  term: string;
  score: string;
  detail: string;
  hash: string;
};

type RecordsTab = "certificates" | "badges" | "academic";

const CERTIFICATES: Certificate[] = [
  {
    id: "c1",
    title: "Elite Software Engineer Foundation (Level 2)",
    issuer: "PathEd Assessment Board",
    issueDate: "July 20, 2026",
    idCode: "PE-CRT-2026-X839A",
    status: "Verified & Active",
    skills: ["DSA (72%)", "OOP Fundamentals (90%)", "Web Dev (88%)"],
    bgGradient: "linear-gradient(135deg, rgba(27, 69, 64, 0.08), rgba(31, 107, 72, 0.06))",
    borderCol: "#1b454050",
    icon: "🎓",
  },
  {
    id: "c2",
    title: "Advanced Data Structures & Algorithms Mastery",
    issuer: "PathEd DSA Committee",
    issueDate: "June 15, 2026",
    idCode: "PE-CRT-2026-D104B",
    status: "Verified & Active",
    skills: ["Trees & Graphs", "Dynamic Programming", "Time Complexity Optimization"],
    bgGradient: "linear-gradient(135deg, rgba(31, 107, 72, 0.08), rgba(56, 189, 248, 0.06))",
    borderCol: "#1f6b4850",
    icon: "🌳",
  },
  {
    id: "c3",
    title: "Full-Stack Application Deployment (Capstone)",
    issuer: "PathEd Project Board",
    issueDate: "May 28, 2026",
    idCode: "PE-CRT-2026-F982C",
    status: "Verified & Active",
    skills: ["React Frontend", "REST API Development", "Redis Caching"],
    bgGradient: "linear-gradient(135deg, rgba(224, 64, 251, 0.08), rgba(27, 69, 64, 0.06))",
    borderCol: "#e040fb50",
    icon: "⚛️",
  },
];

const BADGES: SkillBadge[] = [
  { name: "Recursion Wizard", icon: "🪄", desc: "Solve 15 recursion-based challenges without errors", color: "#1b4540" },
  { name: "React Architect", icon: "⚛️", desc: "Build a responsive web application with 90%+ modularity", color: "#1f6b48" },
  { name: "SQL Optimizer", icon: "🗄️", desc: "Reduce indexing query latency by 45% in DBMS", color: "#e040fb" },
  { name: "7-Day Streak Warrior", icon: "🔥", desc: "Maintain a 7-day coding and evaluation streak", color: "#f7971e" },
  { name: "Hackathon Finalist", icon: "⚔️", desc: "Finish in the top 5% of the Google AI Hackathon", color: "#ef4444" },
  { name: "Clean Coder", icon: "✨", desc: "Achieve an average of 95% on verified mentor reviews", color: "#38bdf8" },
  { name: "Graph Navigator", icon: "🕸️", desc: "Master all graph search and shortest path algorithms", color: "#1b4540" },
  { name: "Memory Guardian", icon: "🛡️", desc: "Successfully prevent all memory leaks in C++ reviews", color: "#ec4899" },
];

const ACADEMIC_RECORDS: AcademicRecord[] = [
  { term: "B.Tech Semester 3", score: "9.4 CGPA", detail: "CS Core: DSA (A+), DBMS (A), Discrete Math (A+)", hash: "0x8fa351db902" },
  { term: "B.Tech Semester 2", score: "9.0 CGPA", detail: "OOP & Java (A+), Digital Logic (A), Probability (A)", hash: "0x7d1ab82c120" },
  { term: "B.Tech Semester 1", score: "9.2 CGPA", detail: "Computer Fundamentals (A+), Calculus (A), Physics (A+)", hash: "0x4e29e92a891" },
];

const CERT_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  c1: GraduationCap,
  c2: Binary,
  c3: Layers,
};

const BADGE_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  "Recursion Wizard": GitBranch,
  "React Architect": Layers,
  "SQL Optimizer": Database,
  "7-Day Streak Warrior": Flame,
  "Hackathon Finalist": Swords,
  "Clean Coder": Code2,
  "Graph Navigator": GitBranch,
  "Memory Guardian": Shield,
};

const PROFILE_URL = "https://pathed.ai/p/rahul-kushwaha";

export default function PlatformRecordsCerts() {
  const toast = useToast();
  const [tab, setTab] = useState<RecordsTab>("certificates");
  const [activePreview, setActivePreview] = useState<Certificate | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE_URL);
      setCopiedLink(true);
      toast.success("Profile link copied.");
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Couldn't copy the profile link.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Credentials"
        title="Records & certificates"
        description="Verifiable academic records, skill badges, and credentials you can share with recruiters."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => void handleCopyLink()}
            >
              {copiedLink ? <ShieldCheck size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
              {copiedLink ? "Copied" : "Copy profile link"}
            </Button>
            <Button
              className="min-h-11"
              onClick={() =>
                toast.info("Launching your public candidate card in a new browser view…")
              }
            >
              <ExternalLink size={16} aria-hidden />
              Preview public profile
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Verified credentials"
          value={`${CERTIFICATES.length} certs`}
          icon={<ShieldCheck size={18} />}
        />
        <StatCard
          label="Badges earned"
          value={`${BADGES.length} badges`}
          icon={<Medal size={18} />}
        />
        <Card className="flex min-w-0 flex-col justify-center gap-2 sm:p-5">
          <p className="type-caption m-0 flex items-center gap-1.5 font-semibold tracking-[0.06em] text-muted uppercase">
            <Link2 size={14} aria-hidden />
            Public ledger
          </p>
          <p className="type-small m-0 truncate text-ink">pathed.ai/p/rahul-kushwaha</p>
        </Card>
      </div>

      <Tabs<RecordsTab>
        items={[
          { id: "certificates", label: "Certificates", badge: CERTIFICATES.length },
          { id: "badges", label: "Badges", badge: BADGES.length },
          { id: "academic", label: "Academic records", badge: ACADEMIC_RECORDS.length },
        ]}
        value={tab}
        onChange={setTab}
        ariaLabel="Records sections"
        className="mb-6"
      />

      <TabPanel active={tab === "certificates"}>
        {CERTIFICATES.length === 0 ? (
          <EmptyState
            icon={<Award size={20} aria-hidden />}
            title="No certificates yet"
            description="Completed assessments will appear here as verifiable credentials."
          />
        ) : (
          <ul className="grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-2 xl:grid-cols-3">
            {CERTIFICATES.map((cert) => {
              const Icon = CERT_ICONS[cert.id] ?? Award;
              return (
                <li key={cert.id} className="min-w-0">
                  <Card className="flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                        <Icon size={18} aria-hidden />
                      </span>
                      <Badge tone="success">{cert.status}</Badge>
                    </div>
                    <div className="min-w-0">
                      <h3 className="type-h4 m-0 text-ink">{cert.title}</h3>
                      <p className="type-caption mt-1 mb-0 text-muted">
                        Issued {cert.issueDate} · {cert.idCode}
                      </p>
                    </div>
                    <ul className="flex list-none flex-wrap gap-1.5 p-0">
                      {cert.skills.map((sk) => (
                        <li key={sk}>
                          <Badge tone="neutral">{sk}</Badge>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex gap-2 border-t border-line pt-4">
                      <Button
                        variant="secondary"
                        className="min-h-11 flex-1"
                        onClick={() => setActivePreview(cert)}
                      >
                        View certificate
                      </Button>
                      <IconButton
                        label="Share to LinkedIn"
                        variant="secondary"
                        onClick={() =>
                          toast.info(
                            `Adding ${cert.title} to your LinkedIn licenses section…`,
                          )
                        }
                      >
                        <Share2 size={16} aria-hidden />
                      </IconButton>
                      <IconButton
                        label="Download PDF"
                        variant="secondary"
                        onClick={() =>
                          toast.success({
                            title: "Generating PDF",
                            description: cert.idCode,
                          })
                        }
                      >
                        <Download size={16} aria-hidden />
                      </IconButton>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </TabPanel>

      <TabPanel active={tab === "badges"}>
        {BADGES.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={20} aria-hidden />}
            title="No badges yet"
            description="Complete challenges and reviews to earn skill badges."
          />
        ) : (
          <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
            {BADGES.map((badge) => {
              const Icon = BADGE_ICONS[badge.name] ?? Medal;
              return (
                <li key={badge.name}>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info({
                        title: badge.name,
                        description: badge.desc,
                      })
                    }
                    className="flex h-full min-h-11 w-full flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-line bg-surface px-3 py-5 text-center transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[var(--shadow-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sunken text-muted">
                      <Icon size={18} aria-hidden />
                    </span>
                    <span className="type-small font-semibold text-ink">
                      {badge.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </TabPanel>

      <TabPanel active={tab === "academic"}>
        {ACADEMIC_RECORDS.length === 0 ? (
          <EmptyState
            icon={<FileCheck size={20} aria-hidden />}
            title="No academic records"
            description="Synced term results will appear in this ledger."
          />
        ) : (
          <ul className="flex list-none flex-col gap-3 p-0">
            {ACADEMIC_RECORDS.map((record) => (
              <li key={record.hash}>
                <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="type-h4 m-0 text-ink">{record.term}</h3>
                      <Badge tone="success">Ledger synced</Badge>
                    </div>
                    <p className="type-small mt-1 mb-0 text-muted">{record.detail}</p>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="type-h3 m-0 text-ink">{record.score}</p>
                    <p className="type-caption mt-1 mb-0 text-faint">
                      Block {record.hash}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </TabPanel>

      <Dialog
        open={Boolean(activePreview)}
        onClose={() => setActivePreview(null)}
        title="Certificate preview"
        size="lg"
        footer={
          activePreview ? (
            <>
              <Button variant="secondary" onClick={() => setActivePreview(null)}>
                Close preview
              </Button>
              <Button
                onClick={() =>
                  toast.info(
                    `Adding credential ${activePreview.idCode} to your LinkedIn…`,
                  )
                }
              >
                <Share2 size={16} aria-hidden />
                Add to LinkedIn
              </Button>
            </>
          ) : null
        }
      >
        {activePreview ? (
          <div className="rounded-[var(--radius-md)] border border-line bg-sunken px-4 py-8 text-center sm:px-8">
            <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <GraduationCap size={22} aria-hidden />
            </span>
            <p className="type-caption m-0 text-primary">
              PathEd verification credential
            </p>
            <p className="type-small mt-3 mb-0 text-muted">This certifies that</p>
            <h2 className="type-h2 mt-2 mb-0 text-ink">Rahul Kushwaha</h2>
            <p className="type-small mx-auto mt-2 mb-0 max-w-md text-muted">
              has successfully verified their engineering competency and completed
              all required curriculum checkpoints for
            </p>
            <h3 className="type-h3 mt-4 mb-0 text-ink">{activePreview.title}</h3>
            <ul className="mt-4 mb-6 flex list-none flex-wrap justify-center gap-1.5 p-0">
              {activePreview.skills.map((skill) => (
                <li key={skill}>
                  <Badge tone="neutral">{skill}</Badge>
                </li>
              ))}
            </ul>
            <div className="mx-auto flex max-w-lg flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:justify-between">
              <div className="text-left">
                <p className="type-caption m-0 text-faint">Issued by</p>
                <p className="type-small m-0 font-semibold text-ink">
                  {activePreview.issuer}
                </p>
                <p className="type-caption m-0 text-muted">{activePreview.issueDate}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="type-caption m-0 text-faint">Verification hash</p>
                <p className="type-small m-0 font-semibold text-ink">
                  {activePreview.idCode}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
