export type StoreProductSeed = {
  id: string;
  title: string;
  category: string;
  price: number;
  icon: string;
  image: string;
  desc: string;
  meta: string;
  col: string;
  included: string[];
};

export const STORE_CATALOG: StoreProductSeed[] = [
  // 1. Roadmaps
  {
    id: "rm_aktu",
    title: "AKTU B.Tech Semester Roadmap",
    category: "Career & Academic Roadmaps",
    price: 1500,
    icon: "🎓",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
    desc: "Complete semester-wise course layouts, syllabus breakdowns, and exam prep trackers tailored for AKTU.",
    meta: "Academic Roadmap",
    col: "#1b4540",
    included: ["Semester-wise curriculum mapping", "Curated NPTEL/YouTube lectures links", "Standard question papers & notes templates", "AI credit checkpoints tracking"]
  },
  {
    id: "rm_iitb",
    title: "IIT Bombay Self-Learning Path",
    category: "Career & Academic Roadmaps",
    price: 1800,
    icon: "🏛️",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600",
    desc: "Curated lectures, rigorous assignments, and projects matching standard IIT Bombay CSE syllabus.",
    meta: "Academic Roadmap",
    col: "#1f6b48",
    included: ["IIT Bombay CS equivalent syllabus", "Advanced problem sets & laboratory tests", "Open-source research projects references", "Self-evaluation scoring templates"]
  },
  {
    id: "rm_fullstack",
    title: "Full Stack SDE Career Track",
    category: "Career & Academic Roadmaps",
    price: 1500,
    icon: "💻",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600",
    desc: "End-to-end guide: frontend frameworks, backend microservices, DB scaling, systems and cloud deployment.",
    meta: "Career Roadmap",
    col: "#ec4899",
    included: ["HTML/CSS/React frontend guides", "Node.js & Go backend architecture models", "Redis, PostgreSQL database scaling tutorials", "Vercel, AWS deployment roadmaps"]
  },
  {
    id: "rm_ai",
    title: "AI & ML Engineer Career Track",
    category: "Career & Academic Roadmaps",
    price: 2000,
    icon: "🧠",
    image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&q=80&w=600",
    desc: "Mathematics, model building, neural networks, PyTorch, LLM fine-tuning, and model hosting.",
    meta: "Career Roadmap",
    col: "#a855f7",
    included: ["Linear algebra & calculus notebooks", "PyTorch deep learning model blueprints", "HuggingFace, LangChain API guides", "Production MLOps deployment pipelines"]
  },
  {
    id: "rm_google",
    title: "Google SDE Placement Path",
    category: "Career & Academic Roadmaps",
    price: 2000,
    icon: "🎯",
    image: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=600",
    desc: "Targeted calendar mapping DSA topics, high-concurrency designs, and Google mock interview checkpoints.",
    meta: "Placement Roadmap",
    col: "#eab308",
    included: ["Advanced graphs & DP pattern list", "Google L4 system design case studies", "Googler resume optimization templates", "Mock test checkpoints schedules"]
  },

  // 2. Project Blueprints
  {
    id: "pb_attendance",
    title: "AI Smart Attendance System",
    category: "Project Blueprints",
    price: 1200,
    icon: "📊",
    image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=600",
    desc: "Blueprints containing complete system documentation, UI prototypes, ER diagrams, template source code, and PPT.",
    meta: "Project Blueprint",
    col: "#06b6d4",
    included: ["Face-recognition model templates", "Express.js backend, MongoDB schema layouts", "Figma prototype link & ER diagrams", "Printable project synopsis & PPT templates"]
  },
  {
    id: "pb_blockchain",
    title: "Web3 Blockchain Storefront",
    category: "Project Blueprints",
    price: 1300,
    icon: "⛓️",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=600",
    desc: "Smart contracts, React frontend templates, testing scripts, and system flow architectures.",
    meta: "Project Blueprint",
    col: "#10b981",
    included: ["Solidity smart contracts templates", "Hardhat test scripts & setups", "React.js Web3 connector hooks code", "Presentation slide decks templates"]
  },

  // 3. Study Planner Packs
  {
    id: "sp_dsa30",
    title: "30-Day Intensive DSA Sprint",
    category: "Study Planner Packs",
    price: 800,
    icon: "⏱️",
    image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=600",
    desc: "Day-by-day practice tracker targeting top 100 interview questions on arrays, trees, graphs, and DP.",
    meta: "Planner Pack",
    col: "#f97316",
    included: ["Daily coding patterns schedule", "LeetCode checklist tracker", "Space/time complexity reference sheet", "C++ & Java implementation code templates"]
  },
  {
    id: "sp_react60",
    title: "60-Day React Mastery Plan",
    category: "Study Planner Packs",
    price: 900,
    icon: "⚛️",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600",
    desc: "Syllabus checkpoints, micro-tasks, portfolio projects timeline, and state management coverage guide.",
    meta: "Planner Pack",
    col: "#0284c7",
    included: ["Daily react concepts roadmap", "Hooks & custom hook projects list", "Redux Toolkit & Zustand configurations", "Deployment checklists & templates"]
  },

  // 4. Resume Templates
  {
    id: "rt_ai_ats",
    title: "ATS-Optimized AI Engineer Resume",
    category: "Resume Templates",
    price: 400,
    icon: "📄",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=600",
    desc: "High-scoring layout optimized for ML terms, parameters, datasets, and GitHub project metrics.",
    meta: "ATS Resume",
    col: "#64748b",
    included: ["ATS friendly single-page formats", "Custom ML keyword lists", "CRI profile badge embed guides", "LaTeX & DOCX source files"]
  },
  {
    id: "rt_fs_ats",
    title: "ATS-Optimized Full Stack SDE",
    category: "Resume Templates",
    price: 400,
    icon: "💼",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
    desc: "Clean layout prioritizing deployment stats, tech stacks, and team scaling results.",
    meta: "ATS Resume",
    col: "#475569",
    included: ["ATS friendly SDE formats", "Tech-stack syntax structures", "Impact statement descriptors", "LaTeX & DOCX source files"]
  },

  // 5. Interview Prep Packs
  {
    id: "ip_google",
    title: "Google Interview Prep Kit",
    category: "Interview Packs",
    price: 1000,
    icon: "🔍",
    image: "https://images.unsplash.com/photo-1521737711867-e3b904737c88?auto=format&fit=crop&q=80&w=600",
    desc: "Pre-filled DSA patterns, leadership questions, resume tips, and real mock interview experience sheets.",
    meta: "Interview Pack",
    col: "#eab308",
    included: ["Google-specific DSA problem banks", "Googley Leadership principles guide", "Resume templates & metrics samples", "Past interviewer evaluation sheets"]
  },
  {
    id: "ip_msft",
    title: "Microsoft Interview Prep Kit",
    category: "Interview Packs",
    price: 1000,
    icon: "🖥️",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
    desc: "Emphasis on object-oriented designs, SQL query sets, and system architecture fundamentals.",
    meta: "Interview Pack",
    col: "#2563eb",
    included: ["OOD patterns & class designs", "SQL query preparation files", "Microsoft hiring manager AMA templates", "System design mock structures"]
  },

  // 6. Hackathon Kits
  {
    id: "hk_winner",
    title: "Hackathon Champion Pitch Deck",
    category: "Hackathon Kits",
    price: 900,
    icon: "🏆",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600",
    desc: "Pitch templates, interactive prototype UI kits, system layout shapes, and slides checklist.",
    meta: "Hackathon Kit",
    col: "#d946ef",
    included: ["Slide deck layouts & outlines", "Interactive prototype Figma components", "Judging scorecard templates", "Live pitch scripts & templates"]
  },

  // 7. Advanced Features (Original prefilled items)
  {
    id: "adv_mentor",
    title: "Industry Mentorship Pass",
    category: "Advanced Features",
    price: 1500,
    icon: "🤝",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600",
    desc: "Unlock 1-on-1 monthly sessions with senior engineers from Tier-1 tech firms.",
    meta: "Premium Unlocks",
    col: "#1b4540",
    included: ["One monthly 1-on-1 video call pass", "Direct resume review check", "Unlimited slack chat channels access", "Priority mock interview scheduler"]
  },
  {
    id: "adv_hacksquad",
    title: "Hack Squad Leader Badge",
    category: "Advanced Features",
    price: 2000,
    icon: "⚔️",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600",
    desc: "Form and lead your own hackathon team with priority recruitment matching.",
    meta: "Premium Unlocks",
    col: "#ef4444",
    included: ["Team organizer badge icon on profile", "Direct invite systems code", "Priority matching to top recruiters", "Hackathon server moderator badges"]
  },
  {
    id: "adv_alumni",
    title: "Alumni Network VIP Access",
    category: "Advanced Features",
    price: 2500,
    icon: "🌐",
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=600",
    desc: "Direct referral channel to 500+ placed alumni across global MNCs.",
    meta: "Premium Unlocks",
    col: "#1f6b48",
    included: ["Referral directory search access", "Automated referral requests messenger", "Alumni newsletter refer patterns", "Private alumni meet channels"]
  },
  {
    id: "adv_streak",
    title: "Streak Shield x 3",
    category: "Advanced Features",
    price: 500,
    icon: "🛡️",
    image: "https://images.unsplash.com/photo-1538220856186-0be0c075778a?auto=format&fit=crop&q=80&w=600",
    desc: "Protect your daily XP streak from resetting when you miss a daily challenge.",
    meta: "Premium Unlocks",
    col: "#f59e0b",
    included: ["3x automatic streak shields", "Auto activation on missed day", "Notifications alert configuration", "Visual shield icon on dashboard"]
  },

  // 8. AI Marketplace Modules (Plugins)
  {
    id: "mod_gate",
    title: "GATE 2027 Prep Module Plugin",
    category: "AI Marketplace Modules",
    price: 2500,
    icon: "🎒",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=600",
    desc: "Auto-calibrates dashboard: daily GATE questions, syllabus checkpoints, and mock test schedules.",
    meta: "AI Plugin Module",
    col: "#1b4540",
    included: ["Daily GATE computer science tasks", "Syllabus checkpoints tracker", "Test series calendar integration", "CRI scoring GATE weights calibration"]
  },
  {
    id: "mod_google_sde",
    title: "Google SDE Module Plugin",
    category: "AI Marketplace Modules",
    price: 2500,
    icon: "🤖",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
    desc: "Swaps dashboard themes, challenges, and mock interview setups to target Google expectations.",
    meta: "AI Plugin Module",
    col: "#10b981",
    included: ["Google SDE mock interview profiles", "Advanced logic challenges injection", "Google specific tags filter", "Dashboard design layouts theme swap"]
  },
  {
    id: "mod_iitb",
    title: "IIT Bombay Learning Module Plugin",
    category: "AI Marketplace Modules",
    price: 2500,
    icon: "🎓",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600",
    desc: "Syncs IIT Bombay assignments, peer projects, grading systems, and CS semester tasks.",
    meta: "AI Plugin Module",
    col: "#ef4444",
    included: ["IITB equivalent laboratory tasks", "Peer projects recommendation guides", "Relative grading scale indicators", "Academic timeline calendars"]
  },
  {
    id: "mod_research",
    title: "AI Research Module Plugin",
    category: "AI Marketplace Modules",
    price: 2500,
    icon: "🔬",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600",
    desc: "Unlocks IEEE layout modules, literature review trackers, and paper publication timelines.",
    meta: "AI Plugin Module",
    col: "#ec4899",
    included: ["IEEE markdown layout templates", "Literature review tracking cards", "Publication calendars recommendation", "Research community directory logs"]
  }
];

