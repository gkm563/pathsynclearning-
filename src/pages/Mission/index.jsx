import React from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip } from "../../components/ui/Shared";

export default function Mission() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <div style={{ background: "#fcfdff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      {/* 1. Hero Section */}
      <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: "center", maxWidth: 1200, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <motion.div {...fadeInUp}>
          <Chip bg="#fff9e6" border="#ffe08a" color="#c68a00">▸ OUR MISSION</Chip>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.1, margin: "24px 0" }}>
            Bridging the gap between<br /><span style={{ color: "#f7971e" }}>academia and industry.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#666", maxWidth: 800, margin: "0 auto 48px", lineHeight: 1.7 }}>
            We exist to solve the structural disconnect in modern engineering education. We are translating academic investment into demonstrable economic value.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} 
          style={{ width: "100%", height: 500, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(247,151,30,0.15)", border: "1px solid #fff3cd", position: "relative" }}>
          <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80" alt="Students bridging gap" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(26,26,46,0.9), transparent)" }} />
        </motion.div>
      </section>

      {/* 2. The Core Problem */}
      <section style={{ padding: "100px 32px", background: "#fff", borderTop: "1px solid #f0f2ff", borderBottom: "1px solid #f0f2ff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap-reverse" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {[
                { title: "Syllabi Misalignment", desc: "Organized by discipline, not by industry roles." },
                { title: "Lack of Clarity", desc: "No clear framework for identifying what to learn." },
                { title: "Delayed Planning", desc: "Postponing preparation until the final year." },
                { title: "Wasted Effort", desc: "Changing goals penalizes exploration." }
              ].map((prob, i) => (
                <div key={i} style={{ background: "#fcfdff", padding: 30, borderRadius: 16, border: "1.5px solid #eaecff" }}>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: 12 }}>{prob.title}</h3>
                  <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6 }}>{prob.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ THE STRUCTURAL FAILURE</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.15, margin: "24px 0" }}>
              The traditional model<br />is broken.
            </h2>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8, marginBottom: 24 }}>
              The core strategic challenge facing undergraduate engineering education is a failure of design. Predefined subjects and rigid semesters create systemic friction.
            </p>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8 }}>
              Students are forced to navigate their degree without a clear understanding of how individual courses contribute to professional employability.
            </p>
          </motion.div>

        </div>
      </section>

      {/* 3. The Vision */}
      <section style={{ padding: "120px 32px", background: "#1a1a2e", color: "#fff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="rgba(108,99,255,0.2)" border="rgba(108,99,255,0.4)" color="#b2aeff">▸ OUR VISION</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "24px 0" }}>
              Replacing proxy metrics with<br />true readiness signals.
            </h2>
            <p style={{ fontSize: 18, color: "#bbb", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              PathEd directly confronts systemic failures with integrated architectural solutions. We provide the clarity, structure, and accountability necessary to transform an academic degree into a measurable and purposeful career journey.
            </p>
          </motion.div>

          <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.div {...fadeInUp} style={{ width: "100%", maxWidth: 800, height: 400, borderRadius: 24, overflow: "hidden", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Visionary teamwork" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(108,99,255,0.2)" }} />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
