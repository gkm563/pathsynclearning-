import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function PlatformOverview() {
  const cards = [
    {
      img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
      title: "Real-World Projects",
      desc: "Stop building to-do apps. PathEd's HackAttack engine connects you with industry-grade projects that recruiters actually care about. Build in public, get reviewed by peers, and showcase verified work.",
      tag: "EXPERIENCE"
    },
    {
      img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      title: "Peer-to-Peer Community",
      desc: "You are not learning alone. Join a vibrant community of 40,000+ ambitious students. Find co-founders, get unstuck in minutes, and participate in exclusive weekend hackathons.",
      tag: "NETWORK"
    },
    {
      img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
      title: "AI-Driven Interview Prep",
      desc: "Don't get caught off-guard. Our AI simulates real interview rounds—from DSA to HR—tailored specifically to the companies you are targeting. Get instant feedback on your STAR answers.",
      tag: "PLACEMENTS"
    }
  ];

  return (
    <section style={{ padding: "80px 32px", background: "#f8f9ff", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#1a1a2e", marginBottom: "16px" }}>
            More than just <span style={{ color: "#6c63ff" }}>roadmaps.</span>
          </h2>
          <p style={{ color: "#666", fontSize: "19px", maxWidth: "700px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
            PathEd is a complete ecosystem designed to transform students into high-value industry professionals.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {cards.map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              style={{
                display: "flex", flexDirection: i % 2 === 0 ? "row" : "row-reverse", 
                alignItems: "center", gap: "40px", background: "#fff", 
                borderRadius: "24px", padding: "24px", border: "1px solid #eaecff",
                boxShadow: "0 10px 40px rgba(108,99,255,0.05)", flexWrap: "wrap"
              }}
            >
              <div style={{ flex: "1 1 400px", borderRadius: "16px", overflow: "hidden", height: "300px" }}>
                <img src={card.img} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: "1 1 400px", padding: "20px" }}>
                <div style={{ display: "inline-block", fontFamily: "'Fira Code', monospace", fontSize: "10px", color: "#6c63ff", background: "#f0f0ff", padding: "6px 12px", borderRadius: "12px", letterSpacing: "1px", marginBottom: "16px", fontWeight: 600 }}>
                  {card.tag}
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "28px", fontWeight: 800, color: "#1a1a2e", marginBottom: "16px" }}>
                  {card.title}
                </h3>
                <p style={{ color: "#666", fontSize: "17px", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", marginBottom: "24px" }}>
                  {card.desc}
                </p>
                <button style={{ color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "17px", display: "flex", alignItems: "center", gap: "8px" }}>
                  Explore feature <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
