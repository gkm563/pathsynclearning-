"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip } from "../../components/ui/Shared";

export default function Documentation() {
  const fadeInUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      <div style={{ display: "flex", paddingTop: 100, minHeight: "100vh" }}>
        {/* Sidebar */}
        <aside style={{ width: 280, borderRight: "1px solid #eaecff", padding: "40px 32px", display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 100, height: "calc(100vh - 100px)", overflowY: "auto" }}>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, color: "var(--text-light)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Getting Started</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <li><a href="#introduction" style={{ color: "#1677ff", fontWeight: 600, textDecoration: "none" }}>Introduction</a></li>
              <li><a href="#quick-start" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Quick Start</a></li>
              <li><a href="#core-concepts" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Core Concepts</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, color: "var(--text-light)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Platform Features</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <li><a href="#skill-trees" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Skill Trees</a></li>
              <li><a href="#cri-algorithm" style={{ color: "var(--text-muted)", textDecoration: "none" }}>CRI Algorithm</a></li>
              <li><a href="#ai-mentorship" style={{ color: "var(--text-muted)", textDecoration: "none" }}>AI Mentorship</a></li>
            </ul>
          </div>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: "60px 80px", maxWidth: 900, scrollBehavior: "smooth" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#e6f4ff" border="var(--border-strong)" color="#1677ff">DOCUMENTATION</Chip>

            {/* SECTION: INTRODUCTION */}
            <section id="introduction" style={{ paddingTop: 24, marginBottom: 64 }}>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, color: "var(--text-main)", marginBottom: 24 }}>
                Introduction to PathEd
              </h1>
              <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 32 }}>
                Welcome to the official PathEd documentation. Here you'll find everything you need to understand the platform's architecture, how the Career Readiness Index (CRI) is calculated, and how our skill trees map directly to industry demands.
              </p>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 700, color: "var(--text-main)", marginTop: 48, marginBottom: 24 }}>
                What is PathEd?
              </h2>
              <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
                PathEd is a highly technical EdTech ecosystem designed specifically for engineering students. We observed a massive disconnect between what universities teach and what companies actually need. PathEd bridges this gap by providing dynamically updated, industry-vetted roadmaps.
              </p>
              <div style={{ background: "#f0f0ff", borderLeft: "4px solid #6c63ff", padding: 24, borderRadius: "0 12px 12px 0", marginTop: 32 }}>
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>The Core Philosophy</h4>
                <p style={{ color: "#444", lineHeight: 1.6, margin: 0 }}>
                  We believe in proof-of-work over traditional grading. Every module you complete on PathEd involves building real-world projects that directly contribute to your CRI score.
                </p>
              </div>
            </section>

            {/* SECTION: QUICK START */}
            <section id="quick-start" style={{ paddingTop: 80, marginTop: -80, marginBottom: 64 }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: "var(--text-main)", marginBottom: 24 }}>Quick Start</h2>
              <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
                Getting started with PathEd takes less than 5 minutes. To begin your journey to a high CRI score:
              </p>
              <ol style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 16, fontSize: 18, color: "#444", lineHeight: 1.6 }}>
                <li><strong>Create your Account:</strong> Register with your University email to unlock student perks.</li>
                <li><strong>Take the Diagnostic:</strong> Our AI will ask you a series of coding and conceptual questions to gauge your baseline.</li>
                <li><strong>Select your Target Role:</strong> Choose from roles like Frontend Engineer, Backend Engineer, Data Scientist, etc.</li>
                <li><strong>Follow the Generated Roadmap:</strong> Begin solving the first set of challenges tailored precisely to your skill gaps.</li>
              </ol>
            </section>

            {/* SECTION: CORE CONCEPTS */}
            <section id="core-concepts" style={{ paddingTop: 80, marginTop: -80, marginBottom: 64 }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: "var(--text-main)", marginBottom: 24 }}>Core Concepts</h2>
              <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
                To succeed on PathEd, you need to understand the three pillars of our platform:
              </p>
              <ul style={{ listStyleType: "none", padding: 0, display: "flex", flexDirection: "column", gap: 24 }}>
                <li style={{ padding: 24, border: "1px solid var(--border-light)", borderRadius: 16, background: "var(--bg-card)" }}>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: "#6c63ff", marginBottom: 8 }}>Proof of Work</h4>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>We do not do multiple-choice quizzes. Everything is project-based. You write code, our automated CI/CD pipeline tests it against hidden test cases.</p>
                </li>
                <li style={{ padding: 24, border: "1px solid var(--border-light)", borderRadius: 16, background: "var(--bg-card)" }}>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: "#00c9a7", marginBottom: 8 }}>Skill Decay</h4>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>Technology moves fast. If you don't use a skill, your rating in that specific node will slowly decay over time, mimicking real-world knowledge retention.</p>
                </li>
                <li style={{ padding: 24, border: "1px solid var(--border-light)", borderRadius: 16, background: "var(--bg-card)" }}>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: "#f7971e", marginBottom: 8 }}>Recruiter Transparency</h4>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>Recruiters on our platform can see your exact code submissions (with your permission), allowing them to evaluate your actual coding style.</p>
                </li>
              </ul>
            </section>

            {/* SECTION: SKILL TREES */}
            <section id="skill-trees" style={{ paddingTop: 80, marginTop: -80, marginBottom: 64 }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: "var(--text-main)", marginBottom: 24 }}>Skill Trees</h2>
              <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
                Our Skill Trees are directed acyclic graphs (DAGs) representing dependencies between technologies. You cannot attempt a "React" challenge until you have proven competency in "Vanilla JavaScript DOM Manipulation". This enforces strong foundational learning.
              </p>
            </section>

            {/* SECTION: CRI ALGORITHM */}
            <section id="cri-algorithm" style={{ paddingTop: 80, marginTop: -80, marginBottom: 64 }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: "var(--text-main)", marginBottom: 24 }}>The CRI Algorithm</h2>
              <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
                The Career Readiness Index (CRI) is a proprietary scoring system (0-100) that evaluates a student's employability. It is not just an average of test scores. It factors in:
              </p>
              <ul style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 12, fontSize: 16, color: "#444", lineHeight: 1.6 }}>
                <li><strong>Code Quality:</strong> Time complexity, space complexity, and code linting scores.</li>
                <li><strong>Consistency:</strong> Daily activity streaks and long-term engagement.</li>
                <li><strong>Complexity:</strong> The difficulty weighting of the challenges successfully completed.</li>
                <li><strong>Speed:</strong> Time taken to solve a problem vs. the cohort average.</li>
              </ul>
            </section>

            {/* SECTION: AI MENTORSHIP */}
            <section id="ai-mentorship" style={{ paddingTop: 80, marginTop: -80, marginBottom: 64 }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: "var(--text-main)", marginBottom: 24 }}>AI Mentorship</h2>
              <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
                If you get stuck on a challenge, PathEd does not just give you the answer. Our integrated AI Mentor uses Socratic questioning to guide you toward the solution. The AI analyzes your abstract syntax tree (AST) in real-time to identify the exact logical flaw in your approach.
              </p>
            </section>

          </motion.div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
