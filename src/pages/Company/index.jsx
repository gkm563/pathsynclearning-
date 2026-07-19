import React from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip } from "../../components/ui/Shared";

export default function Company() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  const team = [
    { name: "Rahul Kushwaha", role: "CEO & Chief Designer", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80" },
    { name: "Devesh Singh", role: "Head of R&D", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80" },
    { name: "Ayush", role: "Chief Engineer & Developer", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80" },
    { name: "Prabhat", role: "Chief Technical Head", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80" }
  ];

  return (
    <div style={{ background: "#fcfdff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      {/* 1. Hero Section */}
      <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: "center", maxWidth: 1200, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <motion.div {...fadeInUp}>
          <Chip bg="#f0f0ff" border="#d8d4ff" color="#6c63ff">▸ AN INDIAN ED-TECH STARTUP</Chip>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.1, margin: "24px 0" }}>
            Born in Prayagraj.<br /><span style={{ color: "#6c63ff" }}>Built for the World.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#666", maxWidth: 800, margin: "0 auto 48px", lineHeight: 1.7 }}>
            PathEd is a deeply technical, hyper-focused startup engineered in the heart of India with a vision to redefine global engineering education.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} 
          style={{ width: "100%", height: 500, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(108,99,255,0.15)", border: "1px solid #eaecff", position: "relative" }}>
          <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80" alt="Tech Workspace" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(26,26,46,0.9), transparent)" }} />
        </motion.div>
      </section>

      {/* 2. The Core Team */}
      <section style={{ padding: "100px 32px", background: "#1a1a2e", color: "#fff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <motion.div {...fadeInUp}>
              <Chip bg="rgba(108,99,255,0.2)" border="rgba(108,99,255,0.4)" color="#b2aeff">▸ LEADERSHIP</Chip>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "24px 0" }}>
                The architects behind<br />the platform.
              </h2>
            </motion.div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 30, justifyContent: "center" }}>
            {team.map((member, i) => (
              <motion.div key={member.name} {...fadeInUp} transition={{ delay: i * 0.1, duration: 0.6 }} 
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 30, width: 280, textAlign: "center", transition: "all 0.3s ease" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-10px)"}
                onMouseLeave={e => e.currentTarget.style.transform = ""}>
                <div style={{ width: 140, height: 140, borderRadius: "50%", overflow: "hidden", margin: "0 auto 24px", border: "4px solid rgba(108,99,255,0.5)" }}>
                  <img src={member.img} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(20%) contrast(1.1)" }} />
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{member.name}</h3>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#b2aeff", letterSpacing: 1 }}>{member.role.toUpperCase()}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Ethos */}
      <section style={{ padding: "120px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#e8faf5" border="#b2eed9" color="#00a67e">▸ ENGINEERING EXCELLENCE</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.15, margin: "24px 0" }}>
              Built by engineers,<br />for engineers.
            </h2>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8, marginBottom: 24 }}>
              We aren't just building another ed-tech tool. We are fundamentally re-architecting the educational journey to map directly to real-world career demands.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <div style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,201,167,0.15)" }}>
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" alt="Engineers collaborating" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </motion.div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
