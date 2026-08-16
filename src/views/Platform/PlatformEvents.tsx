"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  Sparkles, Search, Calendar, Video, BookOpen, User, CheckCircle2, 
  ArrowRight, ShieldCheck, HelpCircle, Star, Clock, Plus, ChevronRight, X, 
  UserCheck, ShieldAlert, ArrowLeft, ArrowUpRight, Check, Heart, ExternalLink,
  Award, Filter, LayoutGrid, CheckCircle, Flame, Gift, Compass, Lock
} from "lucide-react";

/* ─── COLOR TOKENS ─── */
const COLS = {
  primary: "#6c63ff",
  success: "#00c9a7",
  warning: "#f59e0b",
  danger: "#ec4899",
  info: "#38bdf8",
  purple: "#8b5cf6"
};

/* ─── OPPORTUNITIES DATASET (36 HIGH-FIDELITY CARDS across 6 CATEGORIES) ─── */
export const OPPORTUNITIES_DATABASE = [
  // ==================== HACKATHONS & COMPETITIONS ====================
  {
    id: "o1",
    category: "hackathons",
    title: "Google AI Global Hackathon 2026",
    organizer: "Google Developer Group",
    mode: "Online",
    deadline: "2026-08-15",
    prizePool: "$150,000",
    difficulty: "Advanced",
    eligibility: "Students & Professionals",
    tech: "Vertex AI, Gemini API, Flutter",
    seatsLeft: 84,
    parthed_og: true,
    desc: "Build next-generation agentic workflows using Vertex AI and the Gemini model suite. Win cash prizes and direct recruitment tracks at Google Labs.",
    externalLink: "https://developers.google.com/ai",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o2",
    category: "hackathons",
    title: "Microsoft Imagine Cup 2026",
    organizer: "Microsoft Corp",
    mode: "Online + Finals Redmond",
    deadline: "2026-09-01",
    prizePool: "$100,000 + Azure Credits",
    difficulty: "Advanced",
    eligibility: "Undergrad/Grad Students",
    tech: "Azure, OpenAI, C#/.NET",
    seatsLeft: 120,
    parthed_og: false,
    desc: "The premier global student technology competition. Pitch and deploy an AI-driven startup concept using Microsoft Cloud architectures.",
    externalLink: "https://imaginecup.microsoft.com",
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o3",
    category: "hackathons",
    title: "Kaggle Deep Learning Sprint",
    organizer: "PathEd x Kaggle Group",
    mode: "Online",
    deadline: "2026-08-20",
    prizePool: "$25,000 + GPU Instances",
    difficulty: "Intermediate",
    eligibility: "All Kaggle Registered Users",
    tech: "Keras, PyTorch, Jax",
    seatsLeft: 42,
    parthed_og: true,
    desc: "Train models to optimize edge processing latency on miniature drone microcontrollers. Compute sponsorships provided directly by PathEd OG.",
    externalLink: "https://kaggle.com",
    coverImage: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o4",
    category: "hackathons",
    title: "NASA Space Apps Challenge",
    organizer: "NASA Earth Sciences",
    mode: "Hybrid",
    deadline: "2026-10-05",
    prizePool: "Global Recognition & VIP Travel",
    difficulty: "All Levels",
    eligibility: "Open to Public",
    tech: "GIS Data, Python, WebGL",
    seatsLeft: 230,
    parthed_og: false,
    desc: "Use NASA's open-source climate and planetary data to construct interactive models showing global thermal updates and oceanic flows.",
    externalLink: "https://spaceapps.nasa.org",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o5",
    category: "hackathons",
    title: "Smart India Hackathon 2026",
    organizer: "Ministry of Education",
    mode: "Offline (National Centers)",
    deadline: "2026-08-30",
    prizePool: "₹1,00,000 per Problem Statement",
    difficulty: "Intermediate",
    eligibility: "College Students Only",
    tech: "React, Node.js, Blockchain, IoT",
    seatsLeft: 18,
    parthed_og: false,
    desc: "India's largest national initiative addressing real-world civic challenges in waste management, clean energy, and agricultural supplies.",
    externalLink: "https://sih.gov.in",
    coverImage: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o6",
    category: "hackathons",
    title: "Vite Global Buildathon 2026",
    organizer: "Vite Core Team",
    mode: "Online",
    deadline: "2026-11-12",
    prizePool: "$30,000",
    difficulty: "Intermediate",
    eligibility: "Web Developers",
    tech: "Vite, Rolldown, TypeScript",
    seatsLeft: 95,
    parthed_og: false,
    desc: "Optimize web bundling speed and package loading using Vite's next-generation Rust-powered compilation pipeline tools.",
    externalLink: "https://vite.build",
    coverImage: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=400"
  },

  // ==================== INTERNSHIPS & PLACEMENT OPENINGS ====================
  {
    id: "o7",
    category: "internships",
    title: "Meta Backend Engineering Cohort",
    organizer: "Meta Career Services x PathEd",
    mode: "Hybrid (London/Remote)",
    deadline: "2026-08-10",
    prizePool: "₹1.5 Lakhs/Month Stipend",
    difficulty: "Advanced",
    eligibility: "Final Year SDE Students",
    tech: "Rust, Hack, Distributed Systems",
    seatsLeft: 15,
    parthed_og: true,
    desc: "Natively integrated training cohort with Meta Infrastructure. Selected students work directly on caching layers for Instagram.",
    externalLink: "https://careers.meta.com",
    coverImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o8",
    category: "internships",
    title: "Google STEP Internship 2026",
    organizer: "Google University Relations",
    mode: "Onsite (Bangalore/Hyderabad)",
    deadline: "2026-08-25",
    prizePool: "Competitive Stipend + Mentors",
    difficulty: "Intermediate",
    eligibility: "2nd Year B.Tech Students",
    tech: "C++, Java, Software Testing",
    seatsLeft: 40,
    parthed_og: false,
    desc: "STEP is a developmental summer internship for students who have a passion for computer science and engineering roles.",
    externalLink: "https://careers.google.com",
    coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o9",
    category: "internships",
    title: "NVIDIA CUDA Optimization Program",
    organizer: "NVIDIA Research India",
    mode: "Online",
    deadline: "2026-09-05",
    prizePool: "CUDA Certified + NVIDIA GPU Grant",
    difficulty: "Advanced",
    eligibility: "Pre-Final/Final Year B.Tech",
    tech: "C, CUDA, High-Performance GPU",
    seatsLeft: 22,
    parthed_og: true,
    desc: "Learn GPU programming directly from NVIDIA researchers. Optimize execution grids for large AI matrix multiplications.",
    externalLink: "https://nvidia.com/careers",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o10",
    category: "internships",
    title: "Amazon SDE Summer Intern",
    organizer: "Amazon Student Programs",
    mode: "Onsite (Chennai/Gurugram)",
    deadline: "2026-09-20",
    prizePool: "₹85k/Month + PPO Tracks",
    difficulty: "Intermediate",
    eligibility: "3rd Year CS Students",
    tech: "Java, AWS DynamoDB, SpringBoot",
    seatsLeft: 60,
    parthed_og: false,
    desc: "Build APIs, microservices, and client-facing interfaces deployed across Amazon retail pipelines. Mentorship by senior SDE-IIs.",
    externalLink: "https://amazon.jobs",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o11",
    category: "internships",
    title: "Stripe Payment Systems Lab",
    organizer: "Stripe APAC Recruitment",
    mode: "Remote",
    deadline: "2026-08-18",
    prizePool: "$4,500 Monthly Stipend",
    difficulty: "Advanced",
    eligibility: "All Tech Undergrads",
    tech: "Ruby, Go, PostgreSQL, Redis",
    seatsLeft: 8,
    parthed_og: false,
    desc: "Help design fraud prevention systems and payment routing layers targeting merchant payouts across Southeast Asia countries.",
    externalLink: "https://stripe.com/jobs",
    coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o12",
    category: "internships",
    title: "CrowdStrike Cybersec Fellowship",
    organizer: "CrowdStrike University",
    mode: "Hybrid (Pune/Remote)",
    deadline: "2026-09-15",
    prizePool: "Fellowship Stipend + PPO Opportunity",
    difficulty: "Advanced",
    eligibility: "Graduating Batch 2026",
    tech: "C, Go, Linux Kernel Architecture",
    seatsLeft: 12,
    parthed_og: false,
    desc: "Deep dive into kernel exploitation, agent instrumentation, threat telemetry parsing, and endpoint protection algorithms.",
    externalLink: "https://crowdstrike.jobs",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400"
  },

  // ==================== SCHOLARSHIPS & RESEARCH PROGRAMS ====================
  {
    id: "o13",
    category: "scholarships",
    title: "Stanford Quantum Computing Lab Research",
    organizer: "Stanford Q-Lab x PathEd",
    mode: "Hybrid",
    deadline: "2026-10-10",
    prizePool: "Fully Funded Research Fellowship",
    difficulty: "Advanced",
    eligibility: "B.Tech/M.Tech Students",
    tech: "Qiskit, Python, Quantum Mechanics",
    seatsLeft: 5,
    parthed_og: true,
    desc: "Exclusive fellowship program researching qubit stability. Fully funded travel to Stanford for summer residency sessions.",
    externalLink: "https://quantum.stanford.edu",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o14",
    category: "scholarships",
    title: "Google PhD Fellowship 2026",
    organizer: "Google Research",
    mode: "Remote / Campus Visits",
    deadline: "2026-09-30",
    prizePool: "$50,000 + Google Research Mentor",
    difficulty: "Advanced",
    eligibility: "PhD Research Candidates",
    tech: "AI Research, Data Mining, Robotics",
    seatsLeft: 15,
    parthed_og: false,
    desc: "Financial support for graduate students pursuing influential research in computer science and related fields worldwide.",
    externalLink: "https://research.google/fellows",
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o15",
    category: "scholarships",
    title: "PathEd OG AI Research Fellow",
    organizer: "PathEd Labs Group",
    mode: "Remote",
    deadline: "2026-08-22",
    prizePool: "₹50,000 Monthly Research Grant",
    difficulty: "Advanced",
    eligibility: "All Active PathEd Users",
    tech: "PyTorch, Transformers, LLM Training",
    seatsLeft: 10,
    parthed_og: true,
    desc: "PathEd hosted AI research fellowship. Research transformer optimization schemes and publish papers under PathEd Labs sponsorship.",
    externalLink: "https://pathed.org/research",
    coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o16",
    category: "scholarships",
    title: "Microsoft Research Grant",
    organizer: "MSR India",
    mode: "Remote / Bangalore Residency",
    deadline: "2026-11-01",
    prizePool: "Research Grant + Internship Track",
    difficulty: "Advanced",
    eligibility: "CS Academics & Students",
    tech: "Theoretical CS, Security, ML",
    seatsLeft: 20,
    parthed_og: false,
    desc: "Microsoft Research India grant targeting projects related to social good, system scalability, and zero-knowledge proofs.",
    externalLink: "https://microsoft.com/research",
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o17",
    category: "scholarships",
    title: "Adobe Women in Tech Scholarship",
    organizer: "Adobe India",
    mode: "Direct Scholarship",
    deadline: "2026-09-12",
    prizePool: "Full Tuition Coverage + Adobe Intern",
    difficulty: "Intermediate",
    eligibility: "Female CS Undergrad Students",
    tech: "Software Development, Cloud Tech",
    seatsLeft: 30,
    parthed_og: false,
    desc: "Adobe's annual fellowship recognizing women leaders in computing. Receives full academic funding and SDE intern offer.",
    externalLink: "https://adobe.com/careers",
    coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o18",
    category: "scholarships",
    title: "Venice Summer AI School",
    organizer: "Venice Research Consortium",
    mode: "Offline (Venice, Italy)",
    deadline: "2026-07-28",
    prizePool: "Tuition Waiver & Lodging Support",
    difficulty: "Advanced",
    eligibility: "Graduate Students & Researchers",
    tech: "Causal Inference, Neural Networks",
    seatsLeft: 5,
    parthed_og: false,
    desc: "An intensive 2-week school examining causal machine learning and neural architectures in historic Venice.",
    externalLink: "https://veniceai.eu",
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400"
  },

  // ==================== BOOTCAMPS & COHORTS ====================
  {
    id: "o19",
    category: "bootcamps",
    title: "PathEd Full Stack Launchpad",
    organizer: "PathEd Elite Academics",
    mode: "Online (Daily Cohorts)",
    deadline: "2026-08-01",
    prizePool: "Project Certification + Hiring Guarantee",
    difficulty: "Intermediate",
    eligibility: "All PathEd Registered Users",
    tech: "Next.js, Tailwind, Postgres, Docker",
    seatsLeft: 150,
    parthed_og: true,
    desc: "Build 3 production-ready enterprise SaaS products. Fully synchronized mentoring and placement reviews included.",
    externalLink: "https://pathed.org/bootcamp",
    coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o20",
    category: "bootcamps",
    title: "Y Combinator Startup School",
    organizer: "Y Combinator",
    mode: "Online",
    deadline: "2026-09-15",
    prizePool: "Direct Pitch Access to YC Partners",
    difficulty: "All Levels",
    eligibility: "Aspiring Founders",
    tech: "MVP Construction, Startup Tech Stack",
    seatsLeft: 500,
    parthed_og: false,
    desc: "A free 6-week online course on how to start a startup, featuring talks from YC founders, developers, and investors.",
    externalLink: "https://startupschool.org",
    coverImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o21",
    category: "bootcamps",
    title: "PathEd Systems Architect Bootcamp",
    organizer: "PathEd Infrastructure Group",
    mode: "Online",
    deadline: "2026-08-28",
    prizePool: "Systems Mastery Badge + Server Credits",
    difficulty: "Advanced",
    eligibility: "CRI Score > 80%",
    tech: "Distributed Databases, Kubernetes, Kafka",
    seatsLeft: 60,
    parthed_og: true,
    desc: "Deep-dive cohort exploring multi-region database replication, stream processing bottlenecks, and high availability systems.",
    externalLink: "https://pathed.org/system",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o22",
    category: "bootcamps",
    title: "A16z Crypto Startup School",
    organizer: "a16z crypto LLC",
    mode: "Offline Residency (LA)",
    deadline: "2026-10-15",
    prizePool: "$500,000 Seed Investment Guarantee",
    difficulty: "Advanced",
    eligibility: "Web3/Blockchain Developers",
    tech: "Solidity, Rust, Zero Knowledge Proofs",
    seatsLeft: 25,
    parthed_og: false,
    desc: "Accelerated program designed for web3 developers building decentralized products. Mentoring by world-class web3 engineers.",
    externalLink: "https://a16z.com",
    coverImage: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o23",
    category: "bootcamps",
    title: "Supabase Serverless Bootcamp",
    organizer: "Supabase Team",
    mode: "Online",
    deadline: "2026-09-08",
    prizePool: "Premium Swag Box + Supabase Pro",
    difficulty: "Intermediate",
    eligibility: "Web Developers",
    tech: "PostgreSQL, Supabase, Row Level Security",
    seatsLeft: 300,
    parthed_og: false,
    desc: "Master serverless database structures, real-time channels, file storage buckets, and postgres function hooks in 2 weeks.",
    externalLink: "https://supabase.com/school",
    coverImage: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o24",
    category: "bootcamps",
    title: "Redis Distributed Caching School",
    organizer: "Redis Labs",
    mode: "Online",
    deadline: "2026-08-19",
    prizePool: "Certified Redis Developer Exam Pass",
    difficulty: "Intermediate",
    eligibility: "Back-end Developers",
    tech: "Redis, Node.js, Spring Boot",
    seatsLeft: 180,
    parthed_og: false,
    desc: "Understand cache eviction schemes, pub/sub models, geohashes, and Redis modules (Search, JSON, TimeSeries) for latency improvements.",
    externalLink: "https://redis.com",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400"
  },

  // ==================== WORKSHOPS & TECHNICAL SEMINARS ====================
  {
    id: "o25",
    category: "workshops",
    title: "High Performance Kafka Workshops",
    organizer: "PathEd Labs x Confluent",
    mode: "Online",
    deadline: "2026-08-08",
    prizePool: "Confluent Certificate Voucher",
    difficulty: "Advanced",
    eligibility: "Back-end Developers",
    tech: "Apache Kafka, Zookeeper, Java",
    seatsLeft: 30,
    parthed_og: true,
    desc: "Fine-tune partition counts, message queue configurations, lag offsets, and consumer groups for high-throughput pipelines.",
    externalLink: "https://confluent.io",
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o26",
    category: "workshops",
    title: "AWS Distributed Microservices Seminar",
    organizer: "Amazon Web Services",
    mode: "Online",
    deadline: "2026-08-30",
    prizePool: "$100 AWS Sandbox Credits",
    difficulty: "Intermediate",
    eligibility: "Cloud Beginners & Intermediates",
    tech: "AWS Lambda, ECS, API Gateway",
    seatsLeft: 500,
    parthed_og: false,
    desc: "Learn to deploy scalable APIs, orchestrate containers, and log request parameters using CloudWatch metrics.",
    externalLink: "https://aws.amazon.com",
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o27",
    category: "workshops",
    title: "PathEd Low Level System Design",
    organizer: "PathEd OG Instructors",
    mode: "Online (Interactive Live)",
    deadline: "2026-08-25",
    prizePool: "LLD Professional Credentials",
    difficulty: "Intermediate",
    eligibility: "Pre-Final/Final Year CS",
    tech: "Java, OOP, Design Patterns",
    seatsLeft: 45,
    parthed_og: true,
    desc: "Learn LLD by building real-world software components (Parking Lot, Movie Ticket Booking, Chess Engine) in real-time code classes.",
    externalLink: "https://pathed.org/lld",
    coverImage: "https://images.unsplash.com/photo-1531535934200-8734a5a2c65b?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o28",
    category: "workshops",
    title: "Docker Containerization Lab",
    organizer: "Docker Inc",
    mode: "Online Self-Paced",
    deadline: "2026-09-18",
    prizePool: "Docker Certified Associate voucher",
    difficulty: "Intermediate",
    eligibility: "Open to All",
    tech: "Docker, Docker Compose, Linux CMD",
    seatsLeft: 400,
    parthed_og: false,
    desc: "Containerize multi-container web apps, build docker configurations, and manage docker networks for microservices architectures.",
    externalLink: "https://docker.com",
    coverImage: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o29",
    category: "workshops",
    title: "React Server Components Mastery",
    organizer: "Vercel Dev Relations",
    mode: "Online",
    deadline: "2026-09-29",
    prizePool: "Next.js certification discount",
    difficulty: "Intermediate",
    eligibility: "Frontend Developers",
    tech: "Next.js App Router, React 19",
    seatsLeft: 220,
    parthed_og: false,
    desc: "Master RSCs, server actions, optimistic UI updates, hydration, and streaming UI with Suspense boundaries.",
    externalLink: "https://vercel.com",
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o30",
    category: "workshops",
    title: "OpenAPI Swagger Design Seminar",
    organizer: "SmartBear Software",
    mode: "Online",
    deadline: "2026-08-11",
    prizePool: "SmartBear API Cert Exam",
    difficulty: "All Levels",
    eligibility: "API Developers",
    tech: "OpenAPI 3.1, Swagger, Postman",
    seatsLeft: 120,
    parthed_og: false,
    desc: "Write detailed API descriptions, generate client SDKs, and build mock servers directly from swagger configuration files.",
    externalLink: "https://swagger.io",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400"
  },

  // ==================== TECH CONFERENCES & SUMMITS ====================
  {
    id: "o31",
    category: "conferences",
    title: "PathEd Global AI Summit 2026",
    organizer: "PathEd Labs Global",
    mode: "Offline (New Delhi)",
    deadline: "2026-08-20",
    prizePool: "₹5 Lakhs Startup Pitch Grant",
    difficulty: "All Levels",
    eligibility: "All PathEd Premium Users",
    tech: "Generative AI, Large Language Models",
    seatsLeft: 15,
    parthed_og: true,
    desc: "PathEd's annual technical summit. Connect with AI engineers, tech founders, VC funding networks, and research labs.",
    externalLink: "https://pathed.org/summit",
    coverImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o32",
    category: "conferences",
    title: "Google I/O 2026 Extended",
    organizer: "GDG Bangalore",
    mode: "Offline (Bangalore)",
    deadline: "2026-08-27",
    prizePool: "GDG Swag + Networking dinner",
    difficulty: "All Levels",
    eligibility: "Open via Lottery System",
    tech: "Gemini Nano, Android 17, WebGPU",
    seatsLeft: 150,
    parthed_og: false,
    desc: "Local community-led developer conference covering Google's latest releases in AI, mobile, web, and cloud computing frameworks.",
    externalLink: "https://io.google",
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o33",
    category: "conferences",
    title: "PathEd Developer Synergy Summit",
    organizer: "PathEd Synergy Group",
    mode: "Hybrid (Pune / Online)",
    deadline: "2026-09-08",
    prizePool: "Synergy Hackathon Invitation",
    difficulty: "All Levels",
    eligibility: "Open to All Registered Users",
    tech: "System Architectures, NextGen Web",
    seatsLeft: 80,
    parthed_og: true,
    desc: "Annual synergy gathering for software teams. Share developer workflows, Git automation configurations, and build architectures.",
    externalLink: "https://pathed.org/synergy",
    coverImage: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o34",
    category: "conferences",
    title: "Microsoft Build 2026 Extended",
    organizer: "Microsoft India",
    mode: "Offline (Hyderabad)",
    deadline: "2026-09-12",
    prizePool: "Azure Exam Vouchers",
    difficulty: "All Levels",
    eligibility: "Lottery Selection",
    tech: "Azure OpenAI, Copilot Studio, Rust",
    seatsLeft: 180,
    parthed_og: false,
    desc: "Connect with Microsoft product builders. Explore low-code development, serverless scaling, and code automation setups.",
    externalLink: "https://build.microsoft.com",
    coverImage: "https://images.unsplash.com/photo-1591115411646-657acc163242?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o35",
    category: "conferences",
    title: "Apple WWDC 2026 Swift Meetup",
    organizer: "Swift Developers India",
    mode: "Offline (Bangalore)",
    deadline: "2026-08-16",
    prizePool: "Apple Developer Academy Invite",
    difficulty: "All Levels",
    eligibility: "Apple Developers",
    tech: "SwiftUI, Swift 6, CoreML",
    seatsLeft: 90,
    parthed_og: false,
    desc: "WWDC wrap-up and networking meetup. Deep dive into CoreML, Swift Concurrency, and spatial app optimizations.",
    externalLink: "https://developer.apple.com",
    coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "o36",
    category: "conferences",
    title: "KubeCon + CloudNativeCon",
    organizer: "Cloud Native Computing Foundation",
    mode: "Offline (New Delhi)",
    deadline: "2026-10-20",
    prizePool: "CNCF Student Travel Scholarships",
    difficulty: "Advanced",
    eligibility: "Undergrad & Grad Candidates",
    tech: "Kubernetes, Prometheus, Helm, Envoy",
    seatsLeft: 250,
    parthed_og: false,
    desc: "The cloud-native event gatherers. Connect with leading developers in Kubernetes infrastructure, observability tools, and service meshes.",
    externalLink: "https://events.linuxfoundation.org",
    coverImage: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=400"
  }
];

export default function PlatformEvents() {
  const router = useRouter();

  // Active Developer Mode Toggle State
  const [devPlan, setDevPlan] = useState("free");

  // Filter / Applied Toggle state
  const [showAppliedOnly, setShowAppliedOnly] = useState(false);

  // Search Query State
  const [searchQuery, setSearchQuery] = useState("");

  // Detailed Modal State
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  // PathEd OG Application Form State
  const [applyingOpportunity, setApplyingOpportunity] = useState<any>(null);
  const [applyFullName, setApplyFullName] = useState("Rahul Kushwaha");
  const [applyEmail, setApplyEmail] = useState("rahul.kushwaha.sde@gmail.com");
  const [applyGithub, setApplyGithub] = useState("");
  const [applyPitch, setApplyPitch] = useState("");

  // Applied opportunity IDs (DB-backed)
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { apiGet } = await import("@/lib/api");
        const data = await apiGet<{ eventIds: string[] }>("/api/me/applications");
        if (!cancelled) setAppliedIds(data.eventIds || []);
      } catch {
        const saved = localStorage.getItem("pathed_applied_events");
        if (!cancelled) setAppliedIds(saved ? JSON.parse(saved) : []);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("pathed_applied_events", JSON.stringify(appliedIds));
  }, [appliedIds]);

  useEffect(() => {
    localStorage.setItem("dev_mode_plan", devPlan);
    // Dispatch storage event to alert sidebar/header immediately
    window.dispatchEvent(new Event("storage"));
  }, [devPlan]);

  // Handle standard application submission for PathEd OG
  const handleOGApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyGithub.trim()) {
      alert("Please provide your GitHub URL to sync contribution scores.");
      return;
    }

    if (!appliedIds.includes(applyingOpportunity.id)) {
      const next = [...appliedIds, applyingOpportunity.id];
      setAppliedIds(next);
      try {
        const { apiSend } = await import("@/lib/api");
        await apiSend("/api/me/applications", "POST", {
          eventId: applyingOpportunity.id,
          kind: "event",
        });
      } catch {
        // keep local
      }
    }

    alert(`🎉 Application successfully submitted to "${applyingOpportunity.title}"!\n\nYour spot has been queued as a "Secured Spot" in your opportunity dashboard.`);
    setApplyingOpportunity(null);
    setApplyGithub("");
    setApplyPitch("");
  };

  const handleApplyClick = (item) => {
    if (item.parthed_og) {
      setApplyingOpportunity(item);
    } else {
      alert(`Redirecting to target partner application portal:\n${item.externalLink}`);
      // Simulate external redirection
      window.open(item.externalLink, "_blank");
      // Still mark it as applied in our client state to track it!
      if (!appliedIds.includes(item.id)) {
        setAppliedIds(prev => [...prev, item.id]);
      }
    }
  };

  // Filter criteria
  const isFeatureUnlocked = devPlan === "premium";

  const getFilteredOpportunities = (catId) => {
    return OPPORTUNITIES_DATABASE.filter(item => {
      if (item.category !== catId) return false;
      if (showAppliedOnly && !appliedIds.includes(item.id)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.organizer.toLowerCase().includes(q) ||
          item.tech.toLowerCase().includes(q)
        );
      }
      return true;
    });
  };

  const categories = [
    { id: "hackathons", label: "Hackathons & Competitions", icon: "🏆", desc: "Showcase skills in time-limited programming challenges." },
    { id: "internships", label: "Internships & Placements", icon: "💼", desc: "Secure placement slots at Tier-1 technology firms." },
    { id: "scholarships", label: "Scholarships & Research", icon: "🎓", desc: "Gain tuition funding and research fellowship placements." },
    { id: "bootcamps", label: "Bootcamps & Cohorts", icon: "🔥", desc: "Accelerated developmental cohorts and technology schools." },
    { id: "workshops", label: "Workshops & Seminars", icon: "🧠", desc: "Interactive technical training sessions and API designs." },
    { id: "conferences", label: "Tech Conferences & Summits", icon: "🎪", desc: "Synergy gatherings and tech startup pitching venues." }
  ];

  return (
    <DashboardLayout activeTab="opportunities">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 10px 40px" }}>
        
        {/* =========================================================================
           DEVELOPER TESTING MODE BANNER
           ========================================================================= */}
        <div style={{ 
          background: devPlan === "premium" 
            ? "linear-gradient(135deg, rgba(0, 201, 167, 0.08) 0%, rgba(108, 99, 255, 0.08) 100%)" 
            : "rgba(245, 158, 11, 0.08)",
          border: devPlan === "premium" ? "1.5px solid #00c9a7" : "1.5px solid #f59e0b",
          borderRadius: 24, padding: "16px 28px", display: "flex", flexWrap: "wrap",
          justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 28,
          boxShadow: "0 10px 30px rgba(0,0,0,0.03)"
        }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900, color: devPlan === "premium" ? "#00c9a7" : "#f59e0b" }}>
              DEVELOPER TESTING MODE
            </div>
            <h4 style={{ margin: "2px 0 0", fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 800, color: "var(--text-main)" }}>
              {devPlan === "premium" ? "✨ Premium Plan Activated: All summits and exclusive tracks unlocked." : "⚡ Free Plan Active: Locked exclusive summits are previewed."}
            </h4>
          </div>
          <div style={{ display: "flex", background: "var(--bg-alt)", border: "1px solid var(--border-light)", padding: 4, borderRadius: 12, gap: 4 }}>
            <button
              onClick={() => setDevPlan("free")}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 800, transition: "all 0.2s",
                background: devPlan === "free" ? "#f59e0b" : "transparent",
                color: devPlan === "free" ? "#ffffff" : "var(--text-muted)"
              }}
            >
              Free Plan
            </button>
            <button
              onClick={() => setDevPlan("premium")}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 800, transition: "all 0.2s",
                background: devPlan === "premium" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                color: devPlan === "premium" ? "#ffffff" : "var(--text-muted)",
                boxShadow: devPlan === "premium" ? "0 4px 12px rgba(108,99,255,0.25)" : "none"
              }}
            >
              Premium Plan
            </button>
          </div>
        </div>

        {/* =========================================================================
           PAGE HEADER HERO SECTION
           ========================================================================= */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 34, fontWeight: 900, color: "var(--text-main)", margin: 0, letterSpacing: "-0.5px" }}>
              Events & Summits
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 16, color: "var(--text-muted)", fontWeight: 500 }}>
              A centralized hub for every hackathon, workshop, internship, and institutional summit.
            </p>
          </div>

          {/* Search Box + Quest Toggle Row */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", width: "100%", maxWidth: 640 }}>
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
              <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search opportunities by title, technology or organizer..."
                style={{
                  width: "100%", padding: "11px 16px 11px 40px", borderRadius: 14,
                  background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                  color: "var(--text-main)", outline: "none", fontSize: 15,
                  fontFamily: "'Outfit', sans-serif", transition: "all 0.2s"
                }}
              />
            </div>

            {/* Applied Switch Toggle */}
            <button
              onClick={() => setShowAppliedOnly(!showAppliedOnly)}
              style={{
                padding: "10px 20px", borderRadius: 14, 
                border: showAppliedOnly ? "1.5px solid #00c9a7" : "1.5px solid var(--border-light)",
                background: showAppliedOnly ? "rgba(0,201,167,0.06)" : "var(--bg-card)",
                color: showAppliedOnly ? "#00c9a7" : "var(--text-main)",
                fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 900,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
              }}
            >
              <CheckCircle size={15} color={showAppliedOnly ? "#00c9a7" : "var(--text-muted)"} />
              <span>Applied Quests ({appliedIds.length})</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
           MAIN DISPLAY: Standard Netflix rows or Applied-only color blocks
           ========================================================================= */}
        {showAppliedOnly ? (
          /* =========================================================================
             APPLIED MODE VIEW (Color-coded regions)
             ========================================================================= */
          <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 10 }}>
            
            {/* GREEN REGION: Applied Hackathons & Competitions */}
            <div style={{
              background: "rgba(0,201,167,0.02)", border: "1.5px solid rgba(0,201,167,0.2)",
              borderRadius: 24, padding: 26, boxShadow: "0 10px 40px rgba(0,201,167,0.02)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 24 }}>🏆</span>
                <div>
                  <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)" }}>
                    Secured Hackathons & Competitions
                  </h3>
                  <span style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Verified event entries locked on PathEd profiles</span>
                </div>
              </div>

              {getFilteredOpportunities("hackathons").length === 0 ? (
                <div style={{ padding: "30px 20px", textAlign: "center", background: "var(--bg-card)", border: "1.5px dashed var(--border-light)", borderRadius: 18 }}>
                  <span style={{ fontSize: 28 }}>🛡️</span>
                  <p style={{ margin: "8px 0 0", fontSize: 15, color: "var(--text-muted)", fontStyle: "italic" }}>No active hackathon quests secured yet.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                  {getFilteredOpportunities("hackathons").map(opp => (
                    <AppliedOpportunityCard key={opp.id} opp={opp} handleApplyClick={handleApplyClick} setSelectedOpportunity={setSelectedOpportunity} />
                  ))}
                </div>
              )}
            </div>

            {/* BLUE REGION: Applied Internships & Career Tracks */}
            <div style={{
              background: "rgba(108,99,255,0.02)", border: "1.5px solid rgba(108,99,255,0.2)",
              borderRadius: 24, padding: 26, boxShadow: "0 10px 40px rgba(108,99,255,0.02)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 24 }}>💼</span>
                <div>
                  <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)" }}>
                    Secured Career Internships & Industry Tracks
                  </h3>
                  <span style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Active hiring cohorts synced with recruiter pipelines</span>
                </div>
              </div>

              {getFilteredOpportunities("internships").length === 0 ? (
                <div style={{ padding: "30px 20px", textAlign: "center", background: "var(--bg-card)", border: "1.5px dashed var(--border-light)", borderRadius: 18 }}>
                  <span style={{ fontSize: 28 }}>🧬</span>
                  <p style={{ margin: "8px 0 0", fontSize: 15, color: "var(--text-muted)", fontStyle: "italic" }}>No active placement quests secured yet.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                  {getFilteredOpportunities("internships").map(opp => (
                    <AppliedOpportunityCard key={opp.id} opp={opp} handleApplyClick={handleApplyClick} setSelectedOpportunity={setSelectedOpportunity} />
                  ))}
                </div>
              )}
            </div>

            {/* OTHER SECTIONS STACKED BELOW */}
            <div style={{
              background: "rgba(139,92,246,0.01)", border: "1.5px solid var(--border-light)",
              borderRadius: 24, padding: 26
            }}>
              <h3 style={{ margin: "0 0 18px 0", fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)" }}>
                Other Secured Cohorts & Workshops
              </h3>

              {(() => {
                const others = [
                  ...getFilteredOpportunities("scholarships"),
                  ...getFilteredOpportunities("bootcamps"),
                  ...getFilteredOpportunities("workshops"),
                  ...getFilteredOpportunities("conferences")
                ];

                if (others.length === 0) {
                  return (
                    <div style={{ padding: "30px 20px", textAlign: "center", background: "var(--bg-card)", border: "1.5px dashed var(--border-light)", borderRadius: 18 }}>
                      <span style={{ fontSize: 28 }}>🔮</span>
                      <p style={{ margin: "8px 0 0", fontSize: 15, color: "var(--text-muted)", fontStyle: "italic" }}>No other webinars or bootcamp tracks enrolled.</p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                    {others.map(opp => (
                      <AppliedOpportunityCard key={opp.id} opp={opp} handleApplyClick={handleApplyClick} setSelectedOpportunity={setSelectedOpportunity} />
                    ))}
                  </div>
                );
              })()}
            </div>

          </div>
        ) : (
          /* =========================================================================
             STANDARD DISCOVERY MODE: NETFLIX HORIZONTAL CATEGORY ROWS
             ========================================================================= */
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {categories.map(cat => {
              const items = getFilteredOpportunities(cat.id);

              return (
                <div key={cat.id} style={{ display: "flex", flexDirection: "column" }}>
                  
                  {/* Category Title & Desc */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12, paddingRight: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{cat.icon}</span>
                      <div>
                        <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 900, color: "var(--text-main)" }}>
                          {cat.label}
                        </h3>
                        <p style={{ margin: "2px 0 0", fontSize: 14.5, color: "var(--text-muted)" }}>{cat.desc}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 13.5, fontFamily: "'Fira Code', monospace", fontWeight: 800, color: "var(--text-muted)" }}>
                      {items.length} OPTIONS AVAILABLE
                    </span>
                  </div>

                  {/* Horizontal Scroll wrapper */}
                  <div style={{
                    display: "flex", overflowX: "auto", gap: 18,
                    padding: "10px 4px 20px", scrollbarWidth: "thin", scrollBehavior: "smooth"
                  }} className="netflix-row-scroll">
                    
                    {items.length === 0 ? (
                      <div style={{ minWidth: 320, padding: 30, textAlign: "center", background: "var(--bg-card)", border: "1.5px dashed var(--border-light)", borderRadius: 20 }}>
                        <span style={{ fontSize: 24 }}>🧭</span>
                        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-muted)" }}>No matching opportunities found in this group.</p>
                      </div>
                    ) : (
                      items.map(opp => {
                        // Check if premium locked
                        const isLocked = !isFeatureUnlocked && opp.difficulty === "Advanced";

                        return (
                          <div 
                            key={opp.id} 
                            style={{
                              minWidth: 330, width: 330, borderRadius: 20, background: "var(--bg-card)",
                              border: isLocked 
                                ? "1.5px solid var(--border-light)" 
                                : opp.parthed_og 
                                  ? "1.5px solid transparent" // Handled by inline glowing borders
                                  : "1.5px solid var(--border-light)",
                              boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                              overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between",
                              transition: "all 0.3s ease", position: "relative",
                              // Glow border effect for PathEd OG
                              backgroundImage: (!isLocked && opp.parthed_og) 
                                ? "linear-gradient(var(--bg-card), var(--bg-card)), linear-gradient(135deg, #6c63ff, #00c9a7)" 
                                : "none",
                              backgroundOrigin: "border-box",
                              backgroundClip: "content-box, border-box"
                            }}
                            className="opportunity-card-hover"
                          >
                            {/* Cover Image */}
                            <div style={{ width: "100%", height: 135, overflow: "hidden", position: "relative", background: "var(--bg-alt)" }}>
                              <img 
                                src={opp.coverImage} 
                                alt={opp.title} 
                                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                              />
                              {isLocked && (
                                <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.9)", color: "#fff", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 900 }}>
                                    <Lock size={12} /> PREMIUM LOCKED
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Card Top Information */}
                            <div style={{ padding: 20 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <span style={{ padding: "4px 10px", borderRadius: 10, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 12.5, fontWeight: 800, color: "var(--text-muted)" }}>
                                  {opp.organizer}
                                </span>
                                
                                {opp.parthed_og ? (
                                  <span style={{
                                    padding: "4px 8px", borderRadius: 8, background: "rgba(108,99,255,0.12)",
                                    border: "1px solid rgba(108,99,255,0.3)", color: "#6c63ff",
                                    fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                                    display: "flex", alignItems: "center", gap: 3
                                  }}>
                                    <Sparkles size={10} /> PathEd OG
                                  </span>
                                ) : (
                                  <span style={{ fontSize: 13.5, color: "var(--text-muted)", fontWeight: 500 }}>
                                    {opp.mode}
                                  </span>
                                )}
                              </div>

                              <h4 style={{ margin: "0 0 8px 0", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)", lineHeight: 1.4 }}>
                                {opp.title}
                              </h4>
                              
                              <p style={{ margin: "0 0 14px 0", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, height: 60, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                                {opp.desc}
                              </p>

                              {/* Opportunity highlights table */}
                              <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid var(--border-light)", paddingTop: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                  <span style={{ color: "var(--text-muted)" }}>Prizes/Compensation:</span>
                                  <strong style={{ color: "var(--text-main)", fontWeight: 700 }}>{opp.prizePool}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                  <span style={{ color: "var(--text-muted)" }}>Deadline:</span>
                                  <strong style={{ color: "#ec4899", fontWeight: 700 }}>{opp.deadline}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                  <span style={{ color: "var(--text-muted)" }}>Prerequisites:</span>
                                  <code style={{ fontSize: 12, color: "#6c63ff", fontWeight: 800 }}>{opp.tech.split(",")[0]}</code>
                                </div>
                              </div>
                            </div>

                            {/* Card Action Buttons footer */}
                            <div style={{ padding: "0 20px 20px", display: "flex", gap: 8 }}>
                              <button
                                onClick={() => setSelectedOpportunity(opp)}
                                style={{
                                  flex: 1, padding: "9px", borderRadius: 10, border: "1.5px solid var(--border-light)",
                                  background: "var(--bg-alt)", color: "var(--text-main)", 
                                  fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800, cursor: "pointer"
                                }}
                              >
                                Details
                              </button>

                              {isLocked ? (
                                <button
                                  onClick={() => {
                                    alert("This advanced institutional summit/internship is locked. Upgrade to PathEd Premium to unlock premium opportunities.");
                                    router.push("/store");
                                  }}
                                  style={{
                                    flex: 1.5, padding: "9px", borderRadius: 10, border: "none",
                                    background: "#f59e0b", color: "#fff", 
                                    fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                                  }}
                                >
                                  <Lock size={12} />
                                  <span>Unlock</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleApplyClick(opp)}
                                  style={{
                                    flex: 1.5, padding: "9px", borderRadius: 10,
                                    background: appliedIds.includes(opp.id)
                                      ? "var(--bg-alt)"
                                      : opp.parthed_og 
                                        ? "linear-gradient(135deg, #6c63ff, #00c9a7)" 
                                        : "var(--text-main)",
                                    color: appliedIds.includes(opp.id) 
                                      ? "#00c9a7" 
                                      : "#ffffff",
                                    border: appliedIds.includes(opp.id) ? "1.5px solid #00c9a7" : "none",
                                    fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                                  }}
                                >
                                  {appliedIds.includes(opp.id) ? (
                                    <>
                                      <CheckCircle2 size={13} color="#00c9a7" />
                                      <span>Quest Enrolled</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Apply Spot</span>
                                      <ArrowUpRight size={13} />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================================
           GLOBAL MODAL: DETAILED SUMMIT INFORMATION POPUP
           ========================================================================= */}
        <AnimatePresence>
          {selectedOpportunity && (
            <div 
              onClick={e => { if (e.target === e.currentTarget) setSelectedOpportunity(null); }}
              style={{
                position: "fixed", inset: 0, zIndex: 1200,
                background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 24 }}
                style={{
                  background: "var(--bg-card)", borderRadius: 24, maxWidth: 600, width: "100%",
                  border: "1.5px solid var(--border-light)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                  overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
                }}
              >
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
                    Opportunity Profile & Prerequisites
                  </h4>
                  <button onClick={() => setSelectedOpportunity(null)} style={{ position: "absolute", right: 20, top: 20, width: 32, height: 32, borderRadius: 10, border: "none", background: "var(--bg-alt)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)", fontSize: 20 }}>
                    ×
                  </button>
                </div>

                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "#6c63ff", fontWeight: 800 }}>ORGANIZED BY {selectedOpportunity.organizer.toUpperCase()}</span>
                      {selectedOpportunity.parthed_og && (
                        <span style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(108,99,255,0.1)", color: "#6c63ff", fontSize: 10, fontWeight: 900 }}>PathEd OG Exclusives</span>
                      )}
                    </div>
                    <h3 style={{ margin: "4px 0 0", fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)" }}>
                      {selectedOpportunity.title}
                    </h3>
                  </div>

                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {selectedOpportunity.desc}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, background: "var(--bg-alt)", padding: 18, borderRadius: 16, border: "1px solid var(--border-light)" }}>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>EVENT MODE</span>
                      <strong style={{ fontSize: 13.5, color: "var(--text-main)", fontWeight: 700 }}>{selectedOpportunity.mode}</strong>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>PRIZE POOL/BENEFITS</span>
                      <strong style={{ fontSize: 13.5, color: "#00c9a7", fontWeight: 800 }}>{selectedOpportunity.prizePool}</strong>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>REGISTRATION DEADLINE</span>
                      <strong style={{ fontSize: 13.5, color: "#ec4899", fontWeight: 800 }}>{selectedOpportunity.deadline}</strong>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>DIFFICULTY SCALE</span>
                      <strong style={{ fontSize: 13.5, color: "var(--text-main)", fontWeight: 700 }}>{selectedOpportunity.difficulty}</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 11.5, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>REQUIRED KNOWLEDGE & TECH STACK</span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {selectedOpportunity.tech.split(",").map((t, i) => (
                        <span key={i} style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)", fontSize: 12, fontWeight: 700, color: "#6c63ff" }}>
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button
                      onClick={() => setSelectedOpportunity(null)}
                      style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                    >
                      Close Window
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOpportunity(null);
                        handleApplyClick(selectedOpportunity);
                      }}
                      style={{ flex: 1.5, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer" }}
                    >
                      {appliedIds.includes(selectedOpportunity.id) ? "Enrolled Spot" : "Apply for Spot"}
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* =========================================================================
           GLOBAL MODAL: PATHED OG EXCLUSIVE REGISTRATION FORM
           ========================================================================= */}
        <AnimatePresence>
          {applyingOpportunity && (
            <div 
              onClick={e => { if (e.target === e.currentTarget) setApplyingOpportunity(null); }}
              style={{
                position: "fixed", inset: 0, zIndex: 1300,
                background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 24 }}
                style={{
                  background: "var(--bg-card)", borderRadius: 24, maxWidth: 540, width: "100%",
                  border: "1.5px solid rgba(108,99,255,0.3)", boxShadow: "0 30px 80px rgba(108,99,255,0.15)",
                  overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
                }}
              >
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
                    🎪 PathEd OG Application Form
                  </h4>
                  <button onClick={() => setApplyingOpportunity(null)} style={{ position: "absolute", right: 20, top: 20, width: 32, height: 32, borderRadius: 10, border: "none", background: "var(--bg-alt)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)", fontSize: 20 }}>
                    ×
                  </button>
                </div>

                <form onSubmit={handleOGApplySubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  
                  <div style={{ display: "flex", gap: 10, padding: 12, borderRadius: 12, background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.2)" }}>
                    <Sparkles size={18} color="#6c63ff" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 12.5, color: "#6c63ff", fontWeight: 700, lineHeight: 1.4 }}>
                      Apply natively to <strong>{applyingOpportunity.title}</strong>. This application will be reviewed directly by the organizers.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>STUDENT FULL NAME</label>
                    <input
                      type="text"
                      required
                      value={applyFullName}
                      onChange={e => setApplyFullName(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      value={applyEmail}
                      onChange={e => setApplyEmail(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>GITHUB PROFILE LINK</label>
                    <input
                      type="url"
                      required
                      value={applyGithub}
                      onChange={e => setApplyGithub(e.target.value)}
                      placeholder="https://github.com/your-username"
                      style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>STATEMENT OF PURPOSE / EXPERIENCES</label>
                    <textarea
                      required
                      value={applyPitch}
                      onChange={e => setApplyPitch(e.target.value)}
                      placeholder="Why should you be selected for this exclusive PathEd opportunity? Highlight your skills..."
                      style={{
                        width: "100%", height: 90, borderRadius: 10, background: "var(--bg-alt)",
                        border: "1.5px solid var(--border-light)", color: "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 13.5, padding: 12, outline: "none", resize: "none"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button 
                      type="button"
                      onClick={() => setApplyingOpportunity(null)}
                      style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      style={{ flex: 1.5, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer" }}
                    >
                      Submit Quest Application
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}

/* =========================================================================
   SUB-COMPONENT: AppliedOpportunityCard (displays inside green/blue/purple applied regions)
   ========================================================================= */
function AppliedOpportunityCard({ opp, handleApplyClick, setSelectedOpportunity }) {
  return (
    <div style={{
      borderRadius: 16, background: "var(--bg-card)",
      border: opp.parthed_og ? "1.5px solid rgba(108,99,255,0.25)" : "1.5px solid var(--border-light)",
      display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
      boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
    }}>
      {/* Cover Image */}
      <div style={{ width: "100%", height: 110, overflow: "hidden", background: "var(--bg-alt)" }}>
        <img 
          src={opp.coverImage} 
          alt={opp.title} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12.5, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>{opp.organizer}</span>
          
          <span style={{
            padding: "3px 8px", borderRadius: 6, 
            background: opp.category === "hackathons" ? "rgba(0,201,167,0.08)" : "rgba(108,99,255,0.08)",
            color: opp.category === "hackathons" ? "#00c9a7" : "#6c63ff",
            fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 900
          }}>
            Quest Enrolled
          </span>
        </div>

        <div>
          <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 900, color: "var(--text-main)", lineHeight: 1.4 }}>
            {opp.title}
          </h4>
          <span style={{ display: "block", fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>Prerequisite: <code style={{ fontSize: 12 }}>{opp.tech.split(",")[0]}</code></span>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <button
            onClick={() => setSelectedOpportunity(opp)}
            style={{
              flex: 1, padding: "7px", borderRadius: 8, border: "1.5px solid var(--border-light)",
              background: "var(--bg-alt)", color: "var(--text-main)", 
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer"
            }}
          >
            Details
          </button>
          <button
            onClick={() => handleApplyClick(opp)}
            style={{
              flex: 1.2, padding: "7px", borderRadius: 8, border: "1.5px solid #00c9a7",
              background: "rgba(0,201,167,0.04)", color: "#00c9a7", 
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 3
            }}
          >
            <CheckCircle2 size={12} color="#00c9a7" />
            <span>Active Spot</span>
          </button>
        </div>
      </div>
    </div>
  );
}
