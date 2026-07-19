import React from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip, SkillBar } from "../../components/ui/Shared";

export default function Platform() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <div style={{ background: "#fcfdff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      {/* 1. Hero Section */}
      <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: "center", maxWidth: 1200, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <motion.div {...fadeInUp}>
          <Chip bg="#f0f0ff" border="#d8d4ff" color="#6c63ff">▸ PLATFORM OVERVIEW</Chip>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.1, margin: "24px 0" }}>
            Your B.Tech Degree,<br /><span style={{ color: "#6c63ff" }}>Reimagined.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#666", maxWidth: 800, margin: "0 auto 48px", lineHeight: 1.7 }}>
            PathEd transforms your degree from a static list of subjects into a dynamic, measurable, and purposeful journey toward your dream engineering career. We eliminate the guesswork from your education.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} 
          style={{ width: "100%", height: 500, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(108,99,255,0.15)", border: "1px solid #eaecff", position: "relative" }}>
          <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80" alt="Student Coding" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(26,26,46,0.9), transparent)" }} />
        </motion.div>
      </section>

      {/* 2. Personalized Roadmap */}
      <section style={{ padding: "100px 32px", background: "#fff", borderTop: "1px solid #f0f2ff", borderBottom: "1px solid #f0f2ff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#fff9e6" border="#ffe08a" color="#c68a00">▸ THE DEGREE AS A SKILL GRAPH</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.15, margin: "24px 0" }}>
              A Personalized<br />Learning Roadmap.
            </h2>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8, marginBottom: 24 }}>
              Instead of a static list of courses, PathEd visualizes your entire degree as a skill graph. Every skill is a destination connected by logical pathways showing you exactly what to learn next to reach your ultimate goal.
            </p>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8 }}>
              See clearly how <strong>programming fundamentals</strong> lead to <strong>object-oriented concepts</strong>, which then connect to <strong>data structures</strong>—building your expertise layer by layer, exactly as industry professionals do.
            </p>
          </motion.div>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px", position: "relative" }}>
            <div style={{ background: "linear-gradient(135deg, #f0f0ff, #e8faf5)", padding: 40, borderRadius: 24, border: "2px solid #d8d4ff" }}>
              <div style={{ background: "#fff", padding: 30, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 600, color: "#6c63ff", marginBottom: 20 }}>TARGET: SOFTWARE DEV ENGINEER</div>
                <SkillBar label="Programming Fundamentals" pct={100} c="#00c9a7" delay={100} />
                <SkillBar label="Object-Oriented Concepts" pct={90} c="#00c9a7" delay={300} />
                <SkillBar label="Data Structures (Live)" pct={65} c="#f7971e" delay={500} />
                <SkillBar label="System Design" pct={0} c="#eaecff" delay={0} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Career Readiness Index (CRI) */}
      <section style={{ padding: "120px 32px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#e8faf5" border="#b2eed9" color="#00a67e">▸ METRICS THAT MATTER</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.15, margin: "24px 0" }}>
              The Career Readiness Index.
            </h2>
            <p style={{ fontSize: 18, color: "#666", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              Unlike traditional grades which only show how you performed on a single exam, the CRI is a sophisticated 0-100 score that synthesizes skill coverage, mastery levels, and learning consistency into a real-time signal of your true job readiness.
            </p>
          </motion.div>

          <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.div {...fadeInUp} style={{ width: 400, height: 300, borderRadius: 24, overflow: "hidden", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Data Analytics" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,46,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 72, fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: "#00c9a7" }}>84%</div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 16, color: "#fff", letterSpacing: 2 }}>CRI SCORE</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Learning Memory Lane */}
      <section style={{ padding: "100px 32px", background: "#1a1a2e", color: "#fff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap-reverse" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <div style={{ position: "relative", paddingLeft: 40, borderLeft: "2px dashed rgba(108,99,255,0.3)" }}>
              {[
                { y: "Sem 1", t: "Mastered Python Basics", d: "Retained indelible evidence of syntax mastery." },
                { y: "Sem 2", t: "Completed DSA Modules", d: "90%+ mastery unlocked on tree structures." },
                { y: "Sem 3", t: "Full-Stack Project", d: "Synthesized previous skills into a working app." }
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 40, position: "relative" }}>
                  <div style={{ position: "absolute", left: -49, top: 0, width: 16, height: 16, borderRadius: "50%", background: "#6c63ff" }} />
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#00c9a7", marginBottom: 8 }}>{item.y}</div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{item.t}</h3>
                  <p style={{ fontSize: 16, color: "#aaa", lineHeight: 1.6 }}>{item.d}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="rgba(108,99,255,0.2)" border="rgba(108,99,255,0.4)" color="#b2aeff">▸ LONG-TERM RETENTION</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "24px 0" }}>
              Learning Memory Lane.
            </h2>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8, marginBottom: 24 }}>
              A critical limitation of traditional education is the absence of long-term memory. Skills mastered in one semester are often disconnected and forgotten.
            </p>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8 }}>
              PathEd creates a persistent, chronological record of your academic life. Prior learning is never discarded; the system retains indelible evidence of what you know and how well you know it.
            </p>
          </motion.div>

        </div>
      </section>

      {/* 5. Career Fusion Logic */}
      <section style={{ padding: "120px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ ADAPTATION WITHOUT WASTE</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.15, margin: "24px 0" }}>
              Career Fusion Logic.
            </h2>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8, marginBottom: 24 }}>
              Your career goals will evolve. Changing your mind shouldn't mean starting over from scratch.
            </p>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8 }}>
              When you shift your target career (e.g., from Software Development to Data Analytics), our Career Fusion Logic intelligently maps all previously mastered skills to your new path. You only learn what's missing, transforming a disruptive reset into a manageable transition.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <div style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" alt="Team Collaboration" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </motion.div>

        </div>
      </section>

      {/* 6. Skill Decay */}
      <section style={{ padding: "100px 32px", background: "linear-gradient(135deg, #fff9ee, #fff)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#fff3cd" border="#ffe08a" color="#c68a00">▸ KNOWLEDGE MAINTENANCE</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.15, margin: "24px 0" }}>
              Skill Decay & Refresh Indicator.
            </h2>
            <p style={{ fontSize: 18, color: "#666", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              Skills you don't use get rusty. Our platform tracks the recency of your assessments and gently flags important skills that need a refresh, ensuring you are always interview-ready.
            </p>
          </motion.div>
          
          <motion.div {...fadeInUp} style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {["React JS", "System Design", "SQL Joins"].map((skill, i) => (
              <div key={skill} style={{ background: "#fff", padding: "30px 40px", borderRadius: 16, border: `2px solid ${i === 1 ? "#ffe0a0" : "#eaecff"}`, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 12 }}>{skill}</div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, color: i === 1 ? "#c68a00" : "#00c9a7", fontWeight: 600 }}>
                  {i === 1 ? "⚠️ NEEDS REFRESH" : "✓ FRESH"}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
