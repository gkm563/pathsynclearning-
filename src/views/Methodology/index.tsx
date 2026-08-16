"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip, HoverCard, RecruiterValidationSection, InteractiveCard, QuoteSection } from "../../components/ui/Shared";

export default function Methodology() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      {/* 1. Hero Section */}
      <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: "center", maxWidth: 1200, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <motion.div {...fadeInUp}>
          <Chip bg="#e8faf5" border="#b2eed9" color="#00a67e">▸ PEDAGOGY OF PROGRESS</Chip>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1, margin: "24px 0" }}>
            Ensuring learning is deep <br />and <span style={{ color: "#00c9a7" }}>demonstrable.</span>
          </h1>
          <p style={{ fontSize: 20, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto 48px", lineHeight: 1.7 }}>
            The strategic integrity of the PathEd system rests on uncompromising pedagogical rules. We embed rigor into our core logic to produce industry-ready graduates, not merely fast learners.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <HoverCard style={{ width: "100%", height: 500, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,201,167,0.15)", border: "1px solid #e8faf5", position: "relative" }}>
            <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80" alt="Serious study" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(26,26,46,0.9), transparent)" }} />
          </HoverCard>
        </motion.div>
      </section>

      {/* 2. Mastery Based Unlocking */}
      <section style={{ padding: "100px 32px", background: "var(--bg-card)", borderTop: "1px solid #f0f2ff", borderBottom: "1px solid #f0f2ff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ THE 90% RULE</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              Mastery-Based<br />Unlocking.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
              A student cannot advance to the next node in the graph until they have achieved a mastery level of at least <strong>90%</strong> on the current assessment.
            </p>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8 }}>
              This uncompromising policy prevents superficial advancement and ensures you build upon a solid, reliable foundation of understanding. We don't believe in scraping by.
            </p>
          </motion.div>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px", position: "relative" }}>
            <div style={{ background: "linear-gradient(135deg, #fdf0ff, #f0f0ff)", padding: 60, borderRadius: 24, border: "2px solid #e8b3ff", textAlign: "center" }}>
              <div style={{ display: "inline-block", background: "var(--bg-card)", padding: "30px 50px", borderRadius: 24, boxShadow: "0 10px 40px rgba(156,39,176,0.15)" }}>
                <div style={{ fontSize: 84, fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: "#9c27b0", lineHeight: 1 }}>90<span style={{ fontSize: 48 }}>%</span></div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 16, color: "var(--text-main)", fontWeight: 600, marginTop: 16, letterSpacing: 2 }}>MINIMUM REQUIRED SCORE</div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </section>

      {/* 3. Multi-Signal Validation */}
      <section style={{ padding: "120px 32px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#f0f0ff" border="#d8d4ff" color="#6c63ff">▸ HOLISTIC EVALUATION</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              Multi-Signal Progress Validation.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              In contrast to simplistic, single-score evaluation models, PathEd assesses progress using multiple signals to create a balanced, ethical, and realistic model of your progress.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 30, textAlign: "left" }}>
            {[
              { t: "Assessment Performance", d: "Your raw scores and accuracy on deeply technical challenges.", i: "📊", c: "#1677ff" },
              { t: "Number of Attempts", d: "Tracking persistence and the journey from failure to mastery.", i: "🔄", c: "#00c9a7" },
              { t: "Time Spent", d: "Understanding the depth of your focus and engagement.", i: "⏱️", c: "#9c27b0" },
              { t: "Improvement Trends", d: "Recognizing that learning is a process of continuous growth.", i: "📈", c: "#6c63ff" }
            ].map((card, i) => (
              <InteractiveCard key={i} delay={i * 0.1} hoverColor={card.c} style={{ background: "var(--bg-card)", padding: 40, borderRadius: 24, border: "1.5px solid var(--border-light)", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}>{card.i}</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 12 }}>{card.t}</h3>
                <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.6 }}>{card.d}</p>
              </InteractiveCard>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Serious Gamification */}
      <section style={{ padding: "100px 32px", background: "var(--bg-inverse)", color: "var(--text-inverse)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap-reverse" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80" alt="Serious students" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </HoverCard>
          </motion.div>

          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="rgba(247,151,30,0.2)" border="rgba(247,151,30,0.4)" color="#f7971e">▸ PURPOSE OVER ENTERTAINMENT</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "24px 0" }}>
              "Serious" Gamification.
            </h2>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8, marginBottom: 24 }}>
              PathEd's approach to gamification is intentionally restrained. Motivation is derived from meaningful progression, skill unlocks, and visible improvements in the CRI.
            </p>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8 }}>
              This contrasts sharply with platforms that rely on superficial rewards like badges or points. We treat higher education as a serious professional endeavor.
            </p>
          </motion.div>

        </div>
      </section>
      {/* 5. Node-Level Learning */}
      <section style={{ padding: "120px 32px", background: "var(--bg-main)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#e8faf5" border="#b2eed9" color="#00a67e">▸ ACTIVE DEMONSTRATION</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              Node-Level<br />Learning.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
              Our validation policy is uncompromising: progress is tied exclusively to assessment outcomes. Simply consuming content—downloading notes or watching a video—does not mark a node as complete.
            </p>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8 }}>
              This distinction is crucial. We shift the focus from passive reception to the active demonstration of knowledge, fostering genuine accountability at every step of your journey.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} style={{ flex: "1 1 600px", position: "relative" }}>
            <HoverCard style={{ height: 450, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,201,167,0.15)", border: "1.5px solid #e8faf5" }}>
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Active Learning" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </HoverCard>
          </motion.div>
          
        </div>
      </section>

      {/* 6. Accessible & Focused */}
      <section style={{ padding: "100px 32px", background: "var(--bg-card)", borderTop: "1px solid #f0f2ff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ ETHICAL DESIGN</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              Focused by Exclusion.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              The strategic value of PathEd is defined as much by what it includes as by what it deliberately excludes. We've created an environment optimized for deep, focused work, free from the distractions that plague modern educational technologies.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {[
              "No social feeds or forums",
              "No distracting notifications",
              "No advertisements or upsells",
              "High contrast readability modes",
              "Full keyboard navigation support"
            ].map((feature, i) => (
              <InteractiveCard key={i} delay={i * 0.1} style={{ background: "var(--bg-main)", padding: "24px", borderRadius: 16, border: "1.5px solid var(--border-light)", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ color: "#00c9a7", fontSize: 24 }}>✓</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600, color: "var(--text-main)", textAlign: "left" }}>{feature}</div>
              </InteractiveCard>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Animated Coding Environment */}
      <section style={{ padding: "100px 32px", background: "var(--bg-inverse)", color: "var(--text-inverse)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap-reverse" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <HoverCard style={{ background: "#0d0d1a", borderRadius: 16, border: "1px solid #333", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              {/* Terminal Header */}
              <div style={{ background: "#222", padding: "12px 20px", display: "flex", gap: 8, alignItems: "center", borderBottom: "1px solid #333" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
                <div style={{ marginLeft: 16, fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#888" }}>main.py - PathEd Internal Compiler</div>
              </div>
              
              {/* Code Editor Body */}
              <div style={{ padding: 24, fontFamily: "'Fira Code', monospace", fontSize: 14, lineHeight: 1.6, minHeight: 250 }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <span style={{ color: "#c678dd" }}>def</span> <span style={{ color: "#61afef" }}>validate_skill</span>(student_score):
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={{ paddingLeft: 24 }}>
                  <span style={{ color: "#c678dd" }}>if</span> student_score {">="} <span style={{ color: "#d19a66" }}>90</span>:
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} style={{ paddingLeft: 48 }}>
                  <span style={{ color: "#c678dd" }}>return</span> <span style={{ color: "#98c379" }}>"Skill Unlocked"</span>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }} style={{ paddingLeft: 24 }}>
                  <span style={{ color: "#c678dd" }}>else</span>:
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.3 }} style={{ paddingLeft: 48 }}>
                  <span style={{ color: "#c678dd" }}>return</span> <span style={{ color: "#98c379" }}>"Review Required"</span>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.0 }} style={{ marginTop: 16 }}>
                  <span style={{ color: "#5c6370", fontStyle: "italic" }}># Compiling and executing...</span>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 4.8 }} style={{ marginTop: 24, padding: 16, background: "rgba(39,201,63,0.1)", borderLeft: "4px solid #27c93f", color: "#27c93f" }}>
                  {">"} Output: Skill Unlocked. Proceed to next node.
                </motion.div>
              </div>
            </HoverCard>
          </motion.div>

          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="rgba(108,99,255,0.2)" border="rgba(108,99,255,0.4)" color="#b2aeff">▸ INTERACTIVE CODING</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "24px 0" }}>
              In-browser <span style={{ color: "#6c63ff" }}>compilation.</span>
            </h2>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8, marginBottom: 24 }}>
              Demonstrating mastery shouldn't require complex local environment setups. PathEd features an integrated, real-time coding environment.
            </p>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8 }}>
              Write, compile, and execute code directly within your browser. Get instant feedback on algorithmic challenges and project submissions.
            </p>
          </motion.div>

        </div>
      </section>

      <QuoteSection 
        quote="We don't need easier degrees. We need degrees that actually matter to the people hiring."
        author="Rahul Kushwaha"
        role="CEO & Chief Designer"
      />

      <RecruiterValidationSection 
        tag="▸ VALIDATED ARCHITECTURE"
        title={<>Methodology Backed<br />by Industry.</>}
        desc1="Our entire pedagogical framework was co-designed with hiring managers. The rigorous evaluation you undergo ensures that your skills aren't just academically sound—they are exactly what the industry demands."
        desc2="Because recruiters trust our methodology, your validated CRI score acts as a direct passport to technical interviews."
        img="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80"
      />
      <Footer />
    </div>
  );
}
