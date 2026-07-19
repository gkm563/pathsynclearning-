import React from "react";
import { motion } from "framer-motion";
import { InteractiveCard } from "../../../components/ui/Shared";
import { Users, Building, Trophy, Code } from "lucide-react";

export default function StatCounter() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  const stats = [
    { label: "Active Learners", value: "40,000+", icon: <Users size={28} color="#6c63ff" /> },
    { label: "Placement Rate", value: "95%", icon: <Trophy size={28} color="#00c9a7" /> },
    { label: "Hiring Partners", value: "500+", icon: <Building size={28} color="#f7971e" /> },
    { label: "Code Submissions", value: "2M+", icon: <Code size={28} color="#e040fb" /> }
  ];

  return (
    <section style={{ padding: "80px 32px", background: "#1a1a2e", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
          {stats.map((stat, i) => (
            <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1, duration: 0.6 }}>
              <InteractiveCard style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 32, textAlign: "center" }}>
                <div style={{ background: "rgba(255,255,255,0.05)", width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  {stat.icon}
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "#9ca3af", fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>
                  {stat.label}
                </div>
              </InteractiveCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
