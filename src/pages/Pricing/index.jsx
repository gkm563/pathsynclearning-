import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { InteractiveCard, Chip } from "../../components/ui/Shared";
import { Check, User, Star } from "lucide-react";

export default function Pricing() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      <Header />
      
      <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: "center", maxWidth: 1200, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <motion.div {...fadeInUp}>
          <Chip bg="rgba(108,99,255,0.15)" border="rgba(108,99,255,0.3)" color="#b2aeff">▸ INVEST IN YOUR FUTURE</Chip>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1, margin: "24px 0" }}>
            Transparent Pricing.<br /><span style={{ color: "#00c9a7" }}>Maximum ROI.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#9ca3af", maxWidth: 800, margin: "0 auto 64px", lineHeight: 1.7 }}>
            Stop paying for generic degrees and start investing in guaranteed career readiness. Access industry-validated roadmaps, CRI tracking, and direct recruiter pipelines.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 32, maxWidth: 900, margin: "0 auto", textAlign: "left" }}>
          
          {/* Pro Plan */}
          <InteractiveCard delay={0.1} style={{ 
            background: "linear-gradient(145deg, #1a1a2e, #131322)", 
            border: "1px solid rgba(255,255,255,0.05)", 
            borderRadius: 24, padding: 48, position: "relative", overflow: "hidden" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(108,99,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b2aeff" }}>
                <User size={24} />
              </div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700 }}>Student Pro Plan</h3>
            </div>
            
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 24 }}>
              <span style={{ fontSize: 48, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>₹99</span>
              <span style={{ color: "#9ca3af", fontSize: 16 }}>/ month</span>
            </div>
            
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 20px", borderRadius: 8, marginBottom: 32, display: "inline-block" }}>
              <span style={{ color: "#00c9a7", fontWeight: 700, fontFamily: "'Fira Code', monospace" }}>400 Users</span> <span style={{ color: "#9ca3af", fontSize: 14 }}>Active</span>
            </div>
            
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                "Career roadmap generation",
                "Skill challenges access",
                "CRI (Career Readiness Index) tracking",
                "Standard Peer Community Access",
                "Weekly Progress Reports"
              ].map((feature, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, color: "#d1d5db", fontSize: 16 }}>
                  <Check size={20} color="#6c63ff" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: "100%", padding: "16px", borderRadius: 12, background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.3)", color: "#b2aeff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
            >
              Start Free Trial
            </motion.button>
          </InteractiveCard>

          {/* Premium Plan */}
          <InteractiveCard delay={0.2} style={{ 
            background: "linear-gradient(145deg, #1a1a2e, #2a2a4e)", 
            border: "1.5px solid #6c63ff", 
            borderRadius: 24, padding: 48, position: "relative", overflow: "hidden",
            boxShadow: "0 20px 40px rgba(108,99,255,0.2)"
          }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", background: "#6c63ff", color: "#fff", padding: "6px 20px", fontSize: 12, fontWeight: 800, letterSpacing: 1, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, textTransform: "uppercase" }}>
              Most Popular
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, marginTop: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,201,167,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00c9a7" }}>
                <Star size={24} />
              </div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700 }}>Student Premium Plan</h3>
            </div>
            
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 24 }}>
              <span style={{ fontSize: 48, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>₹150</span>
              <span style={{ color: "#9ca3af", fontSize: 16 }}>/ month</span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 20px", borderRadius: 8, marginBottom: 32, display: "inline-block" }}>
              <span style={{ color: "#00c9a7", fontWeight: 700, fontFamily: "'Fira Code', monospace" }}>200 Users</span> <span style={{ color: "#9ca3af", fontSize: 14 }}>Active</span>
            </div>
            
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                "Everything in Pro",
                "1-on-1 AI mentor support",
                "Advanced analytics & insights",
                "Direct recruiter visibility",
                "Priority Project Reviews",
                "Mock Interview Simulator"
              ].map((feature, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, color: "#fff", fontSize: 16, fontWeight: i === 0 ? 700 : 400 }}>
                  <Check size={20} color="#00c9a7" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: "100%", padding: "16px", borderRadius: 12, background: "linear-gradient(90deg, #6c63ff, #00c9a7)", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
            >
              Upgrade to Premium
            </motion.button>
          </InteractiveCard>

        </div>
      </section>

      {/* Benefits Detailed Breakdown */}
      <section style={{ padding: "100px 32px", background: "#131322" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800 }}>Why these plans exist.</h2>
            <p style={{ color: "#9ca3af", fontSize: 18, marginTop: 16 }}>Every feature is designed to rapidly decrease the time between learning and earning.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {[
              { title: "Career Readiness Index (CRI) Tracking", desc: "We replace arbitrary grades with a live CRI score. This score dynamically updates as you complete challenges and acts as a verifiable proof-of-work for recruiters." },
              { title: "Direct Recruiter Visibility", desc: "Premium students who maintain a high CRI are automatically aggregated into dashboards monitored by our corporate hiring partners. Skip the resume pile." },
              { title: "AI Mentor & Analytics", desc: "Get unstuck instantly. The AI mentor understands your specific codebase context and guides you without giving you the raw answer, ensuring deep learning." }
            ].map((benefit, i) => (
              <InteractiveCard key={i} style={{ background: "rgba(255,255,255,0.02)", padding: 40, borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#b2aeff", marginBottom: 16 }}>{benefit.title}</h4>
                <p style={{ color: "#d1d5db", fontSize: 16, lineHeight: 1.8 }}>{benefit.desc}</p>
              </InteractiveCard>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
