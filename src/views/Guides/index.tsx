"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { InteractiveCard, Chip } from "../../components/ui/Shared";
import { BookOpen, Code, Compass, Target, TrendingUp, Briefcase, Zap, ShieldCheck, Award } from "lucide-react";

export default function Guides() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const guides = [
    { title: "Navigating Your Skill Tree", desc: "Learn how to effectively unlock new competencies and advance your career level.", icon: <Compass size={32} /> },
    { title: "Maximizing Your CRI Score", desc: "A deep dive into how the Career Readiness Index is calculated and how to boost it.", icon: <Target size={32} /> },
    { title: "Acing the AI Mentor Interviews", desc: "Tips and tricks for passing our simulated technical interviews.", icon: <BookOpen size={32} /> },
    { title: "Building Portfolio Projects", desc: "How to leverage PathEd challenges to build a recruiter-ready GitHub portfolio.", icon: <Code size={32} /> },
    { title: "Decoding the Market Trends", desc: "Analyze the demand for specific frameworks and optimize your learning path.", icon: <TrendingUp size={32} /> },
    { title: "Corporate Recruiting Pipeline", desc: "Understand exactly what hiring managers see when they view your PathEd profile.", icon: <Briefcase size={32} /> },
    { title: "Mastering the AI Grader", desc: "Learn how the AST-based grading engine evaluates your code submissions for efficiency.", icon: <Zap size={32} /> },
    { title: "Data Security Best Practices", desc: "A guide to maintaining strict privacy controls over your academic and performance data.", icon: <ShieldCheck size={32} /> },
    { title: "Achieving Elite Certifications", desc: "Step-by-step roadmap to earning top-tier badges recognized by industry leaders.", icon: <Award size={32} /> },
  ];

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: "center", maxWidth: 1200, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <motion.div {...fadeInUp}>
          <Chip bg="#e6f4ff" border="var(--border-strong)" color="#1677ff">▸ PATHED GUIDES</Chip>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1, margin: "24px 0" }}>
            Master the Platform.
          </h1>
          <p style={{ fontSize: 20, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto 64px", lineHeight: 1.7 }}>
            Step-by-step guides and playbooks to help you extract maximum value from PathEd and accelerate your engineering career.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, textAlign: "left" }}>
          {guides.map((guide, i) => (
            <InteractiveCard key={i} delay={i * 0.1} style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32 }}>
              <div style={{ color: "#6c63ff", marginBottom: 24 }}>{guide.icon}</div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 12, color: "var(--text-main)" }}>{guide.title}</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>{guide.desc}</p>
              <a href="#" style={{ color: "#1677ff", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                Read Guide <span>→</span>
              </a>
            </InteractiveCard>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
