import {
  findCompanyByName,
  findRoleByName,
  resolvedTargetCompany,
  resolvedTargetRole,
  type HiringCompany,
  type RoleId,
} from "@/lib/roadmap/hiring-catalog";

export type RoadmapGenerationMode = "targeted" | "general";

export type GenerationStageQuestions = {
  targeted: boolean;
  roleLabel: string;
  companyLabel: string | null;
  pathLabel: string;
  education: {
    subtitle: string;
    subjects: string[];
    studyPlaceholder: string;
    backgroundPlaceholder: string;
  };
  career: {
    subtitle: string;
    goals: string[];
  };
  skills: {
    title: string;
    subtitle: string;
    prompt: string;
    options: string[];
  };
  projects: {
    title: string;
    subtitle: string;
    prompt: string;
    namePlaceholder: string;
    techPlaceholder: string;
    experience: string[];
  };
  learning: {
    subtitle: string;
    prompt: string;
    options: string[];
    reasonPlaceholder: string;
  };
  time: {
    subtitle: string;
    balances: string[];
  };
  preferences: {
    subtitle: string;
    prompt: string;
    options: string[];
  };
  timeline: {
    subtitle: string;
    timelines: string[];
    priorityPrompt: string;
    priorities: string[];
  };
};

const CORE_SUBJECTS = [
  "Mathematics",
  "Programming",
  "Data Structures",
  "Operating Systems",
  "Networks",
  "Databases",
];

type RolePack = {
  subjects: string[];
  skills: string[];
  learn: string[];
  goals: string[];
  experience: string[];
  preferences: string[];
  priorities: string[];
  projectPrompt: string;
  techPlaceholder: string;
  learnReason: string;
};

const ROLE_PACK: Record<RoleId | "other", RolePack> = {
  sde: {
    subjects: [...CORE_SUBJECTS, "Algorithms", "Computer Architecture"],
    skills: [
      "DSA",
      "Python",
      "Java",
      "C++",
      "Git",
      "SQL",
      "OS",
      "DBMS",
      "System Design",
      "Linux",
      "OOP",
    ],
    learn: ["DSA patterns", "System design", "Language fluency", "Core CS", "Mock interviews"],
    goals: [
      "Get an internship",
      "Get a full-time SDE offer",
      "Prepare for placements",
      "Crack coding interviews",
      "Build a strong CS foundation",
    ],
    experience: [
      "None",
      "College coding assignments",
      "Personal projects",
      "Open source",
      "Internship",
      "Professional",
    ],
    preferences: [
      "Coding challenges",
      "Video tutorials",
      "Documentation",
      "Building projects",
      "Mock interviews",
    ],
    priorities: [
      "Improve coding",
      "Prepare for interviews",
      "Get internship",
      "Get job",
      "Build portfolio",
    ],
    projectPrompt: "Have you built coding or systems projects?",
    techPlaceholder: "Languages and tools (e.g. Java, Git, PostgreSQL)",
    learnReason: "E.g. I need DSA plus one shipped project before intern season.",
  },
  frontend: {
    subjects: ["Web Development", "Programming", "Mathematics", "UI/UX", "Networks"],
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Accessibility",
      "Browser APIs",
      "Git",
      "Figma",
      "Testing",
    ],
    learn: ["React patterns", "Performance", "CSS systems", "TypeScript", "Frontend interviews"],
    goals: [
      "Get a frontend internship",
      "Get a frontend job",
      "Ship production UI",
      "Build a design-system portfolio",
    ],
    experience: ["None", "College projects", "Personal projects", "Freelance", "Internship", "Professional"],
    preferences: ["Building projects", "Documentation", "Video tutorials", "Interactive exercises", "Code reviews"],
    priorities: ["Build portfolio", "Build skills", "Get internship", "Prepare for interviews"],
    projectPrompt: "Have you shipped UI or web apps?",
    techPlaceholder: "e.g. React, TypeScript, Tailwind",
    learnReason: "E.g. I want a production-quality React portfolio for internships.",
  },
  backend: {
    subjects: [...CORE_SUBJECTS, "Distributed Systems"],
    skills: [
      "APIs",
      "SQL",
      "REST",
      "Python",
      "Java",
      "Node.js",
      "PostgreSQL",
      "Auth",
      "Linux",
      "Git",
      "Caching",
    ],
    learn: ["API design", "Databases", "Auth & security", "System design", "Observability"],
    goals: [
      "Get a backend internship",
      "Get a backend job",
      "Design reliable APIs",
      "Prepare for system-design rounds",
    ],
    experience: ["None", "College projects", "Personal APIs", "Open source", "Internship", "Professional"],
    preferences: ["Documentation", "Building projects", "Coding challenges", "Courses", "System-design primers"],
    priorities: ["Build skills", "Prepare for interviews", "Get internship", "Build portfolio"],
    projectPrompt: "Have you built APIs, services, or data stores?",
    techPlaceholder: "e.g. Node.js, PostgreSQL, Redis",
    learnReason: "E.g. I want to own backend services and pass API/system-design interviews.",
  },
  fullstack: {
    subjects: [...CORE_SUBJECTS, "Web Development"],
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "SQL",
      "Git",
      "REST",
      "HTML",
      "CSS",
      "Docker",
    ],
    learn: ["End-to-end product delivery", "React", "APIs", "Databases", "Deployment"],
    goals: [
      "Get a fullstack internship",
      "Get a fullstack job",
      "Ship a complete product",
      "Freelance / indie apps",
    ],
    experience: ["None", "College projects", "Personal projects", "Freelance", "Internship", "Professional"],
    preferences: ["Building projects", "Video tutorials", "Documentation", "Coding challenges"],
    priorities: ["Build projects", "Build portfolio", "Get internship", "Get job"],
    projectPrompt: "Have you built end-to-end apps (UI + API)?",
    techPlaceholder: "e.g. Next.js, Node, PostgreSQL",
    learnReason: "E.g. I want one polished full-stack app on my resume.",
  },
  mobile: {
    subjects: ["Programming", "Operating Systems", "UI/UX", "Networks", "Mathematics"],
    skills: [
      "Kotlin",
      "Swift",
      "Java",
      "React Native",
      "Flutter",
      "Mobile UI",
      "REST",
      "Git",
      "Store release",
    ],
    learn: ["Native Android or iOS", "App architecture", "Performance", "Store-ready delivery"],
    goals: ["Get a mobile internship", "Get a mobile job", "Publish an app", "Build a mobile portfolio"],
    experience: ["None", "College apps", "Personal apps", "Published on store", "Internship", "Professional"],
    preferences: ["Building projects", "Official docs", "Video tutorials", "Sample apps"],
    priorities: ["Build portfolio", "Build skills", "Get internship", "Prepare for interviews"],
    projectPrompt: "Have you built mobile apps?",
    techPlaceholder: "e.g. Kotlin, Jetpack, Firebase",
    learnReason: "E.g. I want a store-ready app and mobile interview prep.",
  },
  ml: {
    subjects: ["Mathematics", "Statistics", "Programming", "AI/ML", "Linear Algebra", "Probability"],
    skills: [
      "Python",
      "NumPy",
      "Pandas",
      "PyTorch",
      "Scikit-learn",
      "SQL",
      "Probability",
      "Linear algebra",
      "Git",
      "Jupyter",
    ],
    learn: ["Applied ML", "PyTorch", "ML math", "ML system design", "Kaggle-style practice"],
    goals: [
      "Get an ML internship",
      "Get an ML / applied scientist role",
      "Ship an ML project",
      "Prepare for ML interviews",
    ],
    experience: ["None", "Course projects", "Kaggle / notebooks", "Research", "Internship", "Professional"],
    preferences: ["Notebooks / labs", "Papers + blogs", "Video lectures", "Building projects", "Courses"],
    priorities: ["Build skills", "Build portfolio", "Prepare for interviews", "Get internship"],
    projectPrompt: "Have you built ML models or notebooks?",
    techPlaceholder: "e.g. PyTorch, pandas, scikit-learn",
    learnReason: "E.g. I need math plus one production-shaped ML project.",
  },
  "data-scientist": {
    subjects: ["Statistics", "Mathematics", "Programming", "AI/ML", "Databases"],
    skills: [
      "Python",
      "SQL",
      "Statistics",
      "Pandas",
      "Experimentation",
      "Visualization",
      "Scikit-learn",
      "Git",
    ],
    learn: ["Experiment design", "Statistical modeling", "SQL", "Storytelling with data"],
    goals: [
      "Get a data-science internship",
      "Get a data-scientist role",
      "Run real experiments",
      "Build an insights portfolio",
    ],
    experience: ["None", "Course projects", "Case studies", "Internship", "Professional"],
    preferences: ["Case studies", "Notebooks / labs", "Documentation", "Courses", "Building projects"],
    priorities: ["Build portfolio", "Build skills", "Get internship", "Prepare for interviews"],
    projectPrompt: "Have you done analysis, experiments, or modeling projects?",
    techPlaceholder: "e.g. Python, SQL, Tableau",
    learnReason: "E.g. I want experiment design plus a public case-study portfolio.",
  },
  "data-analyst": {
    subjects: ["Statistics", "Mathematics", "Databases", "Programming"],
    skills: ["SQL", "Excel", "Python", "Dashboards", "Metrics", "Tableau", "Power BI", "Statistics"],
    learn: ["Advanced SQL", "Dashboarding", "Business metrics", "Stakeholder communication"],
    goals: [
      "Get an analyst internship",
      "Get a data-analyst role",
      "Build dashboard portfolio",
      "Move from Excel to SQL",
    ],
    experience: ["None", "Course assignments", "Dashboards", "Internship", "Professional"],
    preferences: ["Hands-on SQL", "Documentation", "Video tutorials", "Case studies"],
    priorities: ["Build skills", "Build portfolio", "Get internship", "Get job"],
    projectPrompt: "Have you built dashboards or SQL analyses?",
    techPlaceholder: "e.g. SQL, Excel, Tableau",
    learnReason: "E.g. I want SQL fluency and two stakeholder-ready dashboards.",
  },
  security: {
    subjects: [
      "Networks",
      "Operating Systems",
      "Programming",
      "Cryptography",
      "Linux",
      "Mathematics",
      "Web security",
    ],
    skills: [
      "Linux",
      "Networking",
      "TCP/IP",
      "OWASP",
      "Cryptography basics",
      "Python",
      "Bash",
      "Wireshark",
      "Nmap",
      "Web security",
      "Git",
    ],
    learn: [
      "Network fundamentals",
      "Web app security",
      "Linux hardening",
      "Threat modeling",
      "SOC / detection",
      "Pentest labs",
    ],
    goals: [
      "Get a security internship",
      "Get a cybersecurity role",
      "Pass a security cert (Security+, eJPT, etc.)",
      "Build a pentest / SOC portfolio",
      "Move from CS into security",
    ],
    experience: [
      "None",
      "Classroom labs",
      "CTFs / TryHackMe / HTB",
      "Home lab",
      "Open source / writeups",
      "Internship",
      "Professional",
    ],
    preferences: [
      "Hands-on labs",
      "Writeups",
      "Video walkthroughs",
      "Documentation",
      "CTF practice",
      "Mentorship",
    ],
    priorities: [
      "Build skills",
      "Build a security lab / writeups",
      "Get internship",
      "Prepare for interviews",
      "Earn a cert",
    ],
    projectPrompt: "Have you done CTFs, labs, or security projects?",
    techPlaceholder: "e.g. Linux, Burp, Wireshark, Python",
    learnReason: "E.g. I want a defensive or offensive path with lab proof, not generic web dev.",
  },
  devops: {
    subjects: ["Operating Systems", "Networks", "Programming", "Linux", "Cloud"],
    skills: [
      "Linux",
      "Git",
      "Docker",
      "CI/CD",
      "AWS",
      "Kubernetes",
      "Terraform",
      "Bash",
      "Networking",
      "Python",
    ],
    learn: ["Containers", "CI/CD", "Cloud core", "IaC", "Observability"],
    goals: [
      "Get a DevOps / cloud internship",
      "Get a cloud engineer role",
      "Deploy production pipelines",
      "Learn Kubernetes",
    ],
    experience: ["None", "College projects", "Home lab / cloud free tier", "Internship", "Professional"],
    preferences: ["Labs", "Official cloud docs", "Video tutorials", "Building projects"],
    priorities: ["Build skills", "Build portfolio", "Get internship", "Prepare for interviews"],
    projectPrompt: "Have you deployed apps, pipelines, or cloud labs?",
    techPlaceholder: "e.g. Docker, GitHub Actions, AWS",
    learnReason: "E.g. I want CI/CD plus one cloud architecture I can demo.",
  },
  sre: {
    subjects: ["Operating Systems", "Networks", "Programming", "Distributed Systems", "Linux"],
    skills: [
      "Linux",
      "SLOs",
      "Observability",
      "On-call basics",
      "Python",
      "Go",
      "Kubernetes",
      "Networking",
      "Git",
    ],
    learn: ["SLIs/SLOs", "Incident response", "Observability", "Reliability patterns"],
    goals: [
      "Get an SRE internship",
      "Get an SRE role",
      "Run reliable services",
      "Learn production operations",
    ],
    experience: ["None", "College projects", "On-call / ops club", "Internship", "Professional"],
    preferences: ["Incident case studies", "Documentation", "Labs", "Building projects"],
    priorities: ["Build skills", "Prepare for interviews", "Get internship", "Reliability projects"],
    projectPrompt: "Have you run services, monitoring, or incident labs?",
    techPlaceholder: "e.g. Prometheus, Kubernetes, Linux",
    learnReason: "E.g. I want SLO literacy and a reliability project, not only DSA.",
  },
  ux: {
    subjects: ["UI/UX", "Psychology", "Web Development", "Visual design"],
    skills: [
      "Figma",
      "User research",
      "Wireframing",
      "Prototyping",
      "Visual design",
      "Usability testing",
      "Design systems",
    ],
    learn: ["Research methods", "Interaction design", "Portfolio critique", "Visual systems"],
    goals: [
      "Get a UX internship",
      "Get a product-design role",
      "Build a case-study portfolio",
      "Learn research + UI",
    ],
    experience: ["None", "Course projects", "Freelance", "Internship", "Professional"],
    preferences: ["Case studies", "Mentorship", "Building projects", "Reading", "Community critique"],
    priorities: ["Build portfolio", "Build skills", "Get internship", "Prepare for interviews"],
    projectPrompt: "Have you shipped design case studies or prototypes?",
    techPlaceholder: "e.g. Figma, FigJam, Maze",
    learnReason: "E.g. I need 2–3 case studies that show research through UI.",
  },
  pm: {
    subjects: ["Product thinking", "Statistics", "Communication", "Economics"],
    skills: [
      "Product sense",
      "PRDs",
      "Metrics",
      "SQL basics",
      "Stakeholder comms",
      "Prioritization",
      "User research",
    ],
    learn: ["Product sense", "Execution", "Analytics", "Interview frameworks"],
    goals: [
      "Get an APM / PM internship",
      "Get an associate PM role",
      "Learn product sense",
      "Transition from engineering",
    ],
    experience: ["None", "College clubs / products", "Intern PM-adjacent", "Internship", "Professional"],
    preferences: ["Case practice", "Reading", "Mentorship", "Product teardowns"],
    priorities: ["Build skills", "Prepare for interviews", "Get internship", "Build case portfolio"],
    projectPrompt: "Have you owned a product, feature, or spec?",
    techPlaceholder: "e.g. Notion, SQL, Mixpanel",
    learnReason: "E.g. I want product-sense drills and one execution case study.",
  },
  sdet: {
    subjects: [...CORE_SUBJECTS, "Testing"],
    skills: [
      "Test strategy",
      "Automation",
      "Selenium / Playwright",
      "API testing",
      "Java",
      "Python",
      "CI",
      "Git",
      "SQL",
    ],
    learn: ["Automation frameworks", "API testing", "CI quality gates", "Test design"],
    goals: [
      "Get an SDET internship",
      "Get a QA / SDET role",
      "Build an automation framework",
      "Move from manual testing",
    ],
    experience: ["None", "Manual testing", "College projects", "Automation scripts", "Internship", "Professional"],
    preferences: ["Hands-on automation", "Documentation", "Coding challenges", "Courses"],
    priorities: ["Build skills", "Build portfolio", "Get internship", "Prepare for interviews"],
    projectPrompt: "Have you written tests or automation?",
    techPlaceholder: "e.g. Playwright, REST Assured, pytest",
    learnReason: "E.g. I want an automation framework I can demo in interviews.",
  },
  other: {
    subjects: CORE_SUBJECTS,
    skills: ["Programming", "Git", "Linux", "SQL", "Problem solving"],
    learn: ["Core skills for this path", "Portfolio proof", "Interview prep"],
    goals: [
      "Get an internship",
      "Get a job",
      "Build projects",
      "Learn a new skill",
      "Explore a career",
    ],
    experience: ["None", "Personal projects", "College projects", "Internship", "Professional"],
    preferences: [
      "Video tutorials",
      "Documentation",
      "Building projects",
      "Coding challenges",
      "Courses",
    ],
    priorities: ["Build skills", "Get internship", "Get job", "Build portfolio", "Prepare for interviews"],
    projectPrompt: "Have you built any projects for this path?",
    techPlaceholder: "Tools and technologies you used",
    learnReason: "What should this roadmap prove you can do?",
  },
};

const DEFAULT_TIMELINES = [
  "1 month",
  "3 months",
  "6 months",
  "9 months",
  "1 year",
  "No fixed deadline",
];

const DEFAULT_HOURS_BALANCES = ["Mostly learning", "Balanced", "Mostly projects"];

function unique(items: string[], cap = 22): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const item = raw.trim();
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= cap) break;
  }
  return out;
}

function packFor(roleName: string | null) {
  const role = findRoleByName(roleName);
  return ROLE_PACK[role?.id ?? "other"];
}

function companyHints(company: HiringCompany | null) {
  if (!company) {
    return {
      skills: [] as string[],
      learn: [] as string[],
      preferences: [] as string[],
      priorities: [] as string[],
      experience: [] as string[],
      goals: [] as string[],
      balances: DEFAULT_HOURS_BALANCES,
    };
  }
  const loop = company.interviewLoop.join(" ").toLowerCase();
  const notes = `${company.hiringNotes} ${loop}`;
  const preferences: string[] = [];
  const priorities: string[] = [];
  const learn: string[] = [];
  const experience: string[] = [];
  const goals: string[] = [
    `Internship at ${company.name}`,
    `Full-time at ${company.name}`,
    "Convert intern to full-time",
  ];

  if (/oa|hackerrank|codility|dsa|coding/.test(notes)) {
    preferences.push("Timed OA practice", "Coding challenges", "Mock interviews");
    priorities.push("Crack the online assessment", "Improve DSA");
    learn.push("OA / DSA patterns");
    experience.push("Contest / OA practice");
  }
  if (/system design|distributed/.test(notes)) {
    preferences.push("System-design primers");
    priorities.push("System design depth");
    learn.push("System design for this loop");
  }
  if (/machine coding/.test(notes)) {
    priorities.push("Machine-coding rounds");
    learn.push("Machine coding / LLD");
    preferences.push("Build-under-time practice");
  }
  if (/leadership|lp|bar raiser|googleyness|values|as appropriate|behavioral/.test(notes)) {
    preferences.push("Behavioral story practice");
    priorities.push("Behavioral / values stories");
    learn.push("Behavioral stories for this company");
  }
  if (/sql/.test(notes)) {
    learn.push("SQL interviews");
    priorities.push("SQL fluency");
  }

  return {
    skills: company.stacks,
    learn,
    preferences,
    priorities,
    experience,
    goals,
    balances: ["Mostly interview prep", "Balanced", "Mostly domain / projects"],
  };
}

export const CANONICAL_STAGE_SKILLS = unique(
  Object.values(ROLE_PACK).flatMap((p) => p.skills),
  200,
);

export function isCanonicalStageSkill(skill: string): boolean {
  const key = skill.trim().toLowerCase();
  return CANONICAL_STAGE_SKILLS.some((s) => s.toLowerCase() === key);
}

export function generationStageQuestions(
  mode: RoadmapGenerationMode | null,
  roleName: string | null,
  companyName: string | null,
): GenerationStageQuestions {
  const targeted = mode === "targeted" && Boolean(companyName);
  const role = findRoleByName(roleName);
  const company = targeted ? findCompanyByName(companyName) : null;
  const pack = packFor(roleName);
  const extra = companyHints(company);
  const roleLabel = role?.name || roleName || "this path";
  const companyLabel = company?.name || companyName || null;
  const pathLabel = targeted && companyLabel ? `${companyLabel} · ${roleLabel}` : roleLabel;

  const skills = unique(
    targeted ? [...extra.skills, ...pack.skills] : pack.skills,
  );
  const subjects = unique(
    targeted ? [...pack.subjects, "Algorithms", "Operating Systems"] : pack.subjects,
    14,
  );

  return {
    targeted,
    roleLabel,
    companyLabel,
    pathLabel,
    education: {
      subtitle: targeted
        ? `We’ll skip school-level topics you already finished, then keep what ${companyLabel} still screens.`
        : `Skip school-level nodes you already finished for a ${roleLabel} path, and slow down what you struggle with.`,
      subjects,
      studyPlaceholder: "e.g. B.Tech in Computer Science",
      backgroundPlaceholder: targeted
        ? "e.g. CS undergrad with OS and networks"
        : "e.g. High school science with math",
    },
    career: {
      subtitle: targeted
        ? `Role is ${roleLabel} at ${companyLabel}. Tell us the outcome this hiring path should optimize for.`
        : `Role is ${roleLabel}. Tell us what you want this roadmap to achieve.`,
      goals: unique(
        targeted
          ? [...extra.goals, ...pack.goals, "Prepare for placements", "Other"]
          : [...pack.goals, "Explore a career", "Build a startup", "Other"],
        12,
      ),
    },
    skills: {
      title: targeted ? "Hiring-loop skills" : "Current skills",
      subtitle: targeted
        ? `Rate what you already know from ${companyLabel}’s stack and ${roleLabel} screens so we skip earned nodes.`
        : `Rate skills that actually matter for ${roleLabel} so we skip advanced nodes you have already earned.`,
      prompt: targeted
        ? `What ${companyLabel} / ${roleLabel} skills do you already know?`
        : `What ${roleLabel} skills do you already know?`,
      options: skills,
    },
    projects: {
      title: targeted ? "Proof for this hiring loop" : "Projects and experience",
      subtitle: targeted
        ? `Existing work in ${company?.stacks.slice(0, 3).join(", ") || roleLabel} lets us skip beginner nodes on the ${companyLabel} path.`
        : `Existing ${roleLabel} work lets us skip beginner project nodes.`,
      prompt: pack.projectPrompt,
      namePlaceholder: targeted ? "Project or intern work" : "Project name",
      techPlaceholder: pack.techPlaceholder,
      experience: unique(
        targeted ? [...extra.experience, ...pack.experience] : pack.experience,
        10,
      ),
    },
    learning: {
      subtitle: targeted
        ? `Extra depth beyond the ${companyLabel} interview loop.`
        : `Only asked on the role path — pick what else a ${roleLabel} roadmap should cover.`,
      prompt: targeted
        ? `What else should we add besides the ${companyLabel} loop?`
        : "What do you want to learn on this path?",
      options: unique(targeted ? [...extra.learn, ...pack.learn] : pack.learn, 14),
      reasonPlaceholder: pack.learnReason,
    },
    time: {
      subtitle: targeted
        ? `Hours per week change how dense the ${companyLabel} interview graph is.`
        : "Hours per week change how dense the graph is.",
      balances: extra.balances,
    },
    preferences: {
      subtitle: targeted
        ? `We’ll bias resources toward how ${companyLabel} candidates actually prepare.`
        : "We bias resources toward videos, docs, labs, or practice based on this.",
      prompt: "How do you learn best on this path?",
      options: unique(
        targeted ? [...extra.preferences, ...pack.preferences] : pack.preferences,
        12,
      ),
    },
    timeline: {
      subtitle: targeted
        ? `This sets estimated weeks and which ${companyLabel} rounds are marked critical.`
        : "This sets estimated weeks and which nodes are marked critical.",
      timelines: DEFAULT_TIMELINES,
      priorityPrompt: targeted
        ? `What should this ${companyLabel} path optimize first?`
        : "What is your biggest priority right now?",
      priorities: unique(
        targeted ? [...extra.priorities, ...pack.priorities] : pack.priorities,
        10,
      ),
    },
  };
}

export function generationStageQuestionsFromForm(
  data: Record<string, unknown>,
  mode: RoadmapGenerationMode | null,
): GenerationStageQuestions {
  return generationStageQuestions(
    mode,
    resolvedTargetRole(data.roleOfInterest, data.customRole),
    resolvedTargetCompany(data.targetCompany, data.customCompany),
  );
}
