import React from "react";
import { motion } from "framer-motion";
import { Chip, HoverCard } from "../../../components/ui/Shared";

export default function SuccessStories() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <section style={{ padding: "100px 32px", background: "#fcfdff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ STUDENT SUCCESS</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#1a1a2e", marginTop: 24, marginBottom: 24 }}>
              From Student to Software Engineer
            </h2>
          </motion.div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center" }}>
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", position: "relative" }}>
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80" alt="Student Success" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(26,26,46,0.95), transparent)", padding: "40px 32px 32px" }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Priya Sharma</h3>
                <div style={{ color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 14 }}>Hired at TechCorp • CRI: 92%</div>
              </div>
            </HoverCard>
          </motion.div>

          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 800, color: "#1a1a2e", marginBottom: 24 }}>
              "PathEd didn't just teach me code. It taught me how to think like an engineer."
            </h3>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8, marginBottom: 32 }}>
              "Before PathEd, I was lost in a sea of theoretical coursework. Once I started completing the real-world challenges on my personalized roadmap, my CRI score shot up. Within 3 months, a recruiter saw my profile and reached out directly. No resume screen, just proof of work."
            </p>
            <div style={{ display: "inline-flex", gap: 16 }}>
              <div style={{ background: "#f0f0ff", padding: "12px 24px", borderRadius: 12 }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#6c63ff", fontWeight: 800, marginBottom: 4 }}>BEFORE PATHED</div>
                <div style={{ color: "#1a1a2e", fontWeight: 600 }}>Struggling with DSA</div>
              </div>
              <div style={{ background: "#e8faf5", padding: "12px 24px", borderRadius: 12 }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#00c9a7", fontWeight: 800, marginBottom: 4 }}>AFTER PATHED</div>
                <div style={{ color: "#1a1a2e", fontWeight: 600 }}>Backend SDE</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
