import React from "react";
import { motion } from "framer-motion";
import { Chip } from "../../../components/ui/Shared";
import { Target, Code, TrendingUp, Briefcase } from "lucide-react";

export default function HowItWorks() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  const steps = [
    { num: "01", icon: <Target size={32} color="#6c63ff" />, title: "Set Your Target", desc: "Select your dream role, and we generate a personalized skill graph.", color: "#6c63ff", bg: "rgba(108,99,255,0.1)" },
    { num: "02", icon: <Code size={32} color="#00c9a7" />, title: "Complete Challenges", desc: "Prove your knowledge by passing industry-simulated coding tasks.", color: "#00c9a7", bg: "rgba(0,201,167,0.1)" },
    { num: "03", icon: <TrendingUp size={32} color="#f7971e" />, title: "Grow Your CRI", desc: "Every success increases your Career Readiness Index score.", color: "#f7971e", bg: "rgba(247,151,30,0.1)" },
    { num: "04", icon: <Briefcase size={32} color="#e040fb" />, title: "Get Hired", desc: "Recruiters filter for high-CRI students and skip the resume screen.", color: "#e040fb", bg: "rgba(224,64,251,0.1)" }
  ];

  return (
    <section style={{ padding: "100px 32px", background: "var(--bg-card)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#f0f0ff" border="#d8d4ff" color="#6c63ff">▸ THE PROCESS</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", marginTop: 24, marginBottom: 24 }}>
              How PathEd Works
            </h2>
            <p style={{ fontSize: 20, color: "var(--text-muted)", maxWidth: 700, margin: "0 auto", lineHeight: 1.7 }}>
              We've engineered a seamless pipeline from raw potential to hired professional.
            </p>
          </motion.div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32, position: "relative" }}>
          {/* Vertical connecting line */}
          <div style={{ position: "absolute", left: "50px", top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom, #6c63ff, #00c9a7, #f7971e, #e040fb)", zIndex: 0, display: "none" }} className="desktop-line" />
          
          <style>{`
            @media (min-width: 768px) {
              .desktop-line { display: block !important; left: 50% !important; transform: translateX(-50%); }
              .step-row:nth-child(even) { flex-direction: row-reverse; }
              .step-row:nth-child(even) .step-content { text-align: right; }
            }
          `}</style>

          {steps.map((step, i) => (
            <motion.div key={i} className="step-row" {...fadeInUp} transition={{ delay: i * 0.15 }} style={{ display: "flex", alignItems: "center", gap: 40, position: "relative", zIndex: 1, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ flex: "1 1 300px", maxWidth: 400, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 120, height: 120, borderRadius: "50%", background: step.bg, border: `2px solid ${step.color}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 30px ${step.bg}` }}>
                  {step.icon}
                </div>
              </div>
              
              <div className="step-content" style={{ flex: "1 1 300px", maxWidth: 400, textAlign: "center", padding: 24 }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, color: step.color, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>STEP {step.num}</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>{step.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: 18, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
