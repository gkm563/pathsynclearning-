"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chip, HoverCard } from "../../../components/ui/Shared";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function SuccessStories() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  const stories = [
    {
      name: "Priya Sharma",
      role: "Backend SDE",
      company: "TechCorp",
      cri: "92%",
      quote: "PathEd didn't just teach me code. It taught me how to think like an engineer.",
      text: "Before PathEd, I was lost in a sea of theoretical coursework. Once I started completing the real-world challenges on my personalized roadmap, my CRI score shot up. Within 3 months, a recruiter saw my profile and reached out directly. No resume screen, just proof of work.",
      before: "Struggling with DSA",
      after: "Backend SDE",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&h=800&q=80&crop=faces",
      imagePosition: "center"
    },
    {
      name: "Rahul Verma",
      role: "Frontend Engineer",
      company: "Innovate AI",
      cri: "88%",
      quote: "I finally have a portfolio that speaks for itself.",
      text: "I used to get rejected at the resume screening stage constantly. PathEd's project-based approach meant I built real, complex applications. When recruiters saw my verified Skill Tree and project repos, the interviews started pouring in.",
      before: "Tutorial Hell",
      after: "Frontend Engineer",
      image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&h=800&q=80&crop=faces",
      imagePosition: "center"
    },
    {
      name: "Aisha Patel",
      role: "Data Scientist",
      company: "FinTech Global",
      cri: "95%",
      quote: "The AI Mentor is like having a senior engineer on call 24/7.",
      text: "Whenever I was stuck on a complex data pipeline challenge, the AI Mentor didn't just give me the answer. It asked me guiding questions, pointing out flaws in my logic. That Socratic method of learning completely changed how I problem-solve.",
      before: "Academic Theory",
      after: "Data Scientist",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&h=800&q=80&crop=faces",
      imagePosition: "center"
    },
    {
      name: "David Chen",
      role: "Full Stack Developer",
      company: "NextGen Startup",
      cri: "91%",
      quote: "PathEd bridged the gap between college and the real world.",
      text: "University taught me how to write scripts, but PathEd taught me how to build systems. Learning about CI/CD, system design, and clean architecture through hands-on challenges made me confident enough to ace my technical interviews.",
      before: "Writing Scripts",
      after: "Full Stack Developer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=800&q=80&crop=faces",
      imagePosition: "center"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextStory = () => setCurrentIndex((prev) => (prev + 1) % stories.length);
  const prevStory = () => setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(nextStory, 8000);
    return () => clearInterval(timer);
  }, []);

  const story = stories[currentIndex];

  return (
    <section style={{ padding: "100px 32px", background: "var(--bg-main)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ STUDENT SUCCESS</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", marginTop: 24, marginBottom: 24 }}>
              From Student to Software Engineer
            </h2>
          </motion.div>
        </div>

        <div style={{ position: "relative", minHeight: 450 }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center" }}
            >
              <div style={{ flex: "1 1 500px" }}>
                <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", position: "relative" }}>
                  <img src={story.image} alt={story.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: story.imagePosition }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(26,26,46,0.95), transparent)", padding: "40px 32px 32px" }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700, color: "var(--text-inverse)", marginBottom: 8 }}>{story.name}</h3>
                    <div style={{ color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 14 }}>Hired at {story.company} • CRI: {story.cri}</div>
                  </div>
                </HoverCard>
              </div>

              <div style={{ flex: "1 1 500px" }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 800, color: "var(--text-main)", marginBottom: 24 }}>
                  "{story.quote}"
                </h3>
                <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 32 }}>
                  "{story.text}"
                </p>
                <div style={{ display: "inline-flex", gap: 16 }}>
                  <div style={{ background: "rgba(108,99,255,0.15)", padding: "12px 24px", borderRadius: 12 }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#6c63ff", fontWeight: 800, marginBottom: 4 }}>BEFORE PATHED</div>
                    <div style={{ color: "var(--text-main)", fontWeight: 600 }}>{story.before}</div>
                  </div>
                  <div style={{ background: "rgba(0,201,167,0.15)", padding: "12px 24px", borderRadius: 12 }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#00c9a7", fontWeight: 800, marginBottom: 4 }}>AFTER PATHED</div>
                    <div style={{ color: "var(--text-main)", fontWeight: 600 }}>{story.after}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Controls */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginTop: 48 }}>
          <button onClick={prevStory} style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid var(--border-light)", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-main)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-alt)"} onMouseLeave={e => e.currentTarget.style.background = "var(--bg-card)"}>
            <ArrowLeft size={20} />
          </button>
          
          <div style={{ display: "flex", gap: 8 }}>
            {stories.map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)} style={{ width: 10, height: 10, borderRadius: "50%", background: i === currentIndex ? "#6c63ff" : "var(--border-light)", border: "none", cursor: "pointer", transition: "all 0.3s", transform: i === currentIndex ? "scale(1.2)" : "scale(1)" }} aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>

          <button onClick={nextStory} style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid var(--border-light)", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-main)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-alt)"} onMouseLeave={e => e.currentTarget.style.background = "var(--bg-card)"}>
            <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </section>
  );
}
