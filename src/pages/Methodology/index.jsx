import React from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip } from "../../components/ui/Shared";

export default function Methodology() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <div style={{ background: "#fcfdff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      {/* 1. Hero Section */}
      <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: "center", maxWidth: 1200, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <motion.div {...fadeInUp}>
          <Chip bg="#e8faf5" border="#b2eed9" color="#00a67e">▸ PEDAGOGY OF PROGRESS</Chip>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.1, margin: "24px 0" }}>
            Ensuring learning is deep <br />and <span style={{ color: "#00c9a7" }}>demonstrable.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#666", maxWidth: 800, margin: "0 auto 48px", lineHeight: 1.7 }}>
            The strategic integrity of the PathEd system rests on uncompromising pedagogical rules. We embed rigor into our core logic to produce industry-ready graduates, not merely fast learners.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} 
          style={{ width: "100%", height: 500, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,201,167,0.15)", border: "1px solid #e8faf5", position: "relative" }}>
          <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80" alt="Serious study" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(26,26,46,0.9), transparent)" }} />
        </motion.div>
      </section>

      {/* 2. Mastery Based Unlocking */}
      <section style={{ padding: "100px 32px", background: "#fff", borderTop: "1px solid #f0f2ff", borderBottom: "1px solid #f0f2ff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ THE 90% RULE</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.15, margin: "24px 0" }}>
              Mastery-Based<br />Unlocking.
            </h2>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8, marginBottom: 24 }}>
              A student cannot advance to the next node in the graph until they have achieved a mastery level of at least <strong>90%</strong> on the current assessment.
            </p>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8 }}>
              This uncompromising policy prevents superficial advancement and ensures you build upon a solid, reliable foundation of understanding. We don't believe in scraping by.
            </p>
          </motion.div>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px", position: "relative" }}>
            <div style={{ background: "linear-gradient(135deg, #fdf0ff, #f0f0ff)", padding: 60, borderRadius: 24, border: "2px solid #e8b3ff", textAlign: "center" }}>
              <div style={{ display: "inline-block", background: "#fff", padding: "30px 50px", borderRadius: 24, boxShadow: "0 10px 40px rgba(156,39,176,0.15)" }}>
                <div style={{ fontSize: 84, fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: "#9c27b0", lineHeight: 1 }}>90<span style={{ fontSize: 48 }}>%</span></div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 16, color: "#1a1a2e", fontWeight: 600, marginTop: 16, letterSpacing: 2 }}>MINIMUM REQUIRED SCORE</div>
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
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.15, margin: "24px 0" }}>
              Multi-Signal Progress Validation.
            </h2>
            <p style={{ fontSize: 18, color: "#666", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              In contrast to simplistic, single-score evaluation models, PathEd assesses progress using multiple signals to create a balanced, ethical, and realistic model of your progress.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 30, textAlign: "left" }}>
            {[
              { t: "Assessment Performance", d: "Your raw scores and accuracy on deeply technical challenges.", i: "📊" },
              { t: "Number of Attempts", d: "Tracking persistence and the journey from failure to mastery.", i: "🔄" },
              { t: "Time Spent", d: "Understanding the depth of your focus and engagement.", i: "⏱️" },
              { t: "Improvement Trends", d: "Recognizing that learning is a process of continuous growth.", i: "📈" }
            ].map((card, i) => (
              <motion.div key={i} {...fadeInUp} style={{ background: "#fff", padding: 40, borderRadius: 24, border: "1.5px solid #eaecff", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}>{card.i}</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 12 }}>{card.t}</h3>
                <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6 }}>{card.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Serious Gamification */}
      <section style={{ padding: "100px 32px", background: "#1a1a2e", color: "#fff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap-reverse" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <div style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80" alt="Serious students" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
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

      <Footer />
    </div>
  );
}
