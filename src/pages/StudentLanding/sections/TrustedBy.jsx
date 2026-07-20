import React from "react";
import { motion } from "framer-motion";
import { Chip } from "../../../components/ui/Shared";

export default function TrustedBy() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  // Generate some placeholder company boxes
  const companies = [
    { name: "TechCorp", color: "#6c63ff" },
    { name: "Innovate AI", color: "#00c9a7" },
    { name: "DataFlow", color: "#f7971e" },
    { name: "CloudSync", color: "#e040fb" },
    { name: "CyberDefend", color: "#6c63ff" },
    { name: "NextGen", color: "#00c9a7" },
  ];

  return (
    <section style={{ padding: "80px 32px", background: "#f8f9fa", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <motion.div {...fadeInUp}>
          <Chip bg="#e8faf5" border="#b2eed9" color="#00a67e">▸ HIRING NETWORK</Chip>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 800, color: "var(--text-main)", marginTop: 24, marginBottom: 48 }}>
            Top Companies Hire PathEd Graduates
          </h2>
        </motion.div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
          {companies.map((company, i) => (
            <motion.div 
              key={i} 
              {...fadeInUp} 
              transition={{ delay: i * 0.1 }}
              style={{ 
                background: "var(--bg-card)", 
                border: "1px solid var(--border-light)", 
                borderRadius: 16, 
                padding: "24px 40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 160,
                boxShadow: "0 10px 30px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: company.color }}>
                {company.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
