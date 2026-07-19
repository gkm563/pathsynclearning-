import React from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip } from "../../components/ui/Shared";

export default function Community() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <div style={{ background: "#fcfdff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      {/* 1. Hero Section */}
      <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: "center", maxWidth: 1200, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <motion.div {...fadeInUp}>
          <Chip bg="#e8faf5" border="#b2eed9" color="#00a67e">▸ PEER-TO-PEER ECOSYSTEM</Chip>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.1, margin: "24px 0" }}>
            You are not learning <span style={{ color: "#00c9a7" }}>alone.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#666", maxWidth: 800, margin: "0 auto 48px", lineHeight: 1.7 }}>
            PathEd is built on the belief that engineering is a collaborative discipline. Our community is designed to foster professional growth, technical debates, and peer-driven success.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} 
          style={{ width: "100%", height: 500, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,201,167,0.15)", border: "1px solid #e8faf5", position: "relative" }}>
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80" alt="Students coding together" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(26,26,46,0.9), transparent)" }} />
        </motion.div>
      </section>

      {/* 2. HackAttack Engine */}
      <section style={{ padding: "100px 32px", background: "#fff", borderTop: "1px solid #f0f2ff", borderBottom: "1px solid #f0f2ff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ COMPETITIVE LEARNING</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.15, margin: "24px 0" }}>
              The HackAttack<br />Engine.
            </h2>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8, marginBottom: 24 }}>
              Put your skills to the test in real-time. Join weekly global hackathons and daily algorithmic challenges directly mapped to your CRI.
            </p>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8 }}>
              Compete on professional, constrained leaderboards where quality of code matters just as much as speed of execution.
            </p>
          </motion.div>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px", position: "relative" }}>
            <div style={{ background: "linear-gradient(135deg, #f0f0ff, #fdf0ff)", padding: 40, borderRadius: 24, border: "2px solid #e8b3ff" }}>
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80" alt="Hackathon" style={{ width: "100%", borderRadius: 16, boxShadow: "0 10px 40px rgba(156,39,176,0.15)" }} />
            </div>
          </motion.div>
          
        </div>
      </section>

      {/* 3. Global Peer Review */}
      <section style={{ padding: "120px 32px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#f0f0ff" border="#d8d4ff" color="#6c63ff">▸ COLLABORATION</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.15, margin: "24px 0" }}>
              Global Peer Review.
            </h2>
            <p style={{ fontSize: 18, color: "#666", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              Your code doesn't exist in a vacuum. PathEd automatically routes your project submissions to peers for blind code reviews, fostering a culture of constructive criticism and collective improvement.
            </p>
          </motion.div>

          <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.div {...fadeInUp} style={{ width: "100%", maxWidth: 800, height: 400, borderRadius: 24, overflow: "hidden", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
              <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80" alt="Code Review" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(108,99,255,0.2)" }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Teacher Connect */}
      <section style={{ padding: "100px 32px", background: "#1a1a2e", color: "#fff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap-reverse" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <div style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
              <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" alt="Teacher guidance" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </motion.div>

          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="rgba(247,151,30,0.2)" border="rgba(247,151,30,0.4)" color="#f7971e">▸ MENTORSHIP</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "24px 0" }}>
              Teacher Connect.
            </h2>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8, marginBottom: 24 }}>
              When you hit a plateau, you aren't stuck. Teachers are provided with aggregated views of your progress and readiness trends.
            </p>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8 }}>
              This allows for early identification of struggles, enabling faculty to provide informed, data-driven guidance exactly when you need it most.
            </p>
          </motion.div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
