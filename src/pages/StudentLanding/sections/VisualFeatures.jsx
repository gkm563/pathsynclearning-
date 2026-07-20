import React from "react";
import { motion } from "framer-motion";
import { HoverCard } from "../../../components/ui/Shared";
import { Target, Layers, Compass, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Choose Your Goal",
    desc: "Pick your dream role—SDE, DevOps, ML Engineer, or Product. Our AI maps it to the exact skills top companies hire for.",
    img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
    color: "#6c63ff"
  },
  {
    icon: Compass,
    title: "Build Your Roadmap",
    desc: "AI-generated skill paths built on real hiring data from Google, Microsoft, and 500+ top companies.",
    img: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
    color: "#00c9a7"
  },
  {
    icon: Layers,
    title: "Learn & Practice",
    desc: "Targeted resources, hands-on labs, DSA challenges, and real-world project tracks with peer review.",
    img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    color: "#f7971e"
  },
  {
    icon: TrendingUp,
    title: "Track & Reflect",
    desc: "Monitor your Career Readiness Index live, archive your Memory Lane, and unlock nodes as you level up.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    color: "#e040fb"
  }
];

export default function VisualFeatures() {
  return (
    <section style={{ padding: "100px 32px", background: "var(--bg-card)", position: "relative" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "80px", maxWidth: "640px", margin: "0 auto 80px" }}>
          <div style={{ display: "inline-block", fontFamily: "'Fira Code', monospace", fontSize: "13px", fontWeight: 600, color: "#00c9a7", letterSpacing: "2px", marginBottom: "16px", padding: "8px 18px", background: "#e8faf5", borderRadius: "20px" }}>
            CORE WORKFLOW
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: "var(--text-main)", marginBottom: "20px" }}>
            The blueprint for your <br/>
            <span style={{ color: "#6c63ff" }}>career launchpad.</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: 1.6 }}>
            Every step is designed to optimize your readiness. No more guessing what to learn next. Just pure, targeted progression.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
          {features.map((item, i) => (
            <HoverCard 
              key={i}
              style={{
                background: "var(--bg-alt)", borderRadius: "24px", padding: "12px",
                border: "1px solid var(--border-light)", boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
                cursor: "pointer", display: "flex", flexDirection: "column"
              }}
            >
              <div style={{ width: "100%", height: "200px", borderRadius: "16px", overflow: "hidden", marginBottom: "24px", position: "relative" }}>
                <img src={item.img} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} 
                     onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                     onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"} />
                <div style={{ position: "absolute", top: "16px", left: "16px", width: "48px", height: "48px", borderRadius: "12px", background: "var(--overlay-bg)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}>
                  <item.icon size={24} color={item.color} />
                </div>
              </div>
              
              <div style={{ padding: "0 16px 20px" }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: "10px", color: item.color, fontWeight: 700, letterSpacing: "1px", marginBottom: "8px" }}>STEP 0{i+1}</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "20px", fontWeight: 800, color: "var(--text-main)", marginBottom: "12px" }}>{item.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </HoverCard>
          ))}
        </div>

      </div>
    </section>
  );
}
