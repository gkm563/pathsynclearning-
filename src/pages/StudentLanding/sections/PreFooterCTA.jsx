import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";

export default function PreFooterCTA() {
  return (
    <section style={{ padding: "80px 32px 120px", position: "relative", zIndex: 2, background: "var(--bg-card)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            background: "linear-gradient(135deg, #6c63ff 0%, #00c9a7 50%, #f7971e 100%)",
            borderRadius: "32px", padding: "80px 48px", textAlign: "center",
            position: "relative", overflow: "hidden",
            boxShadow: "0 24px 64px rgba(108,99,255,0.25)"
          }}
        >
          {/* Decorative background overlay */}
          <div style={{ position: "absolute", inset: 0, background: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')", opacity: 0.5, pointerEvents: "none" }}></div>
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ 
              display: "inline-flex", alignItems: "center", gap: "8px", 
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", 
              borderRadius: "20px", padding: "6px 16px", marginBottom: "24px",
              fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--bg-card)", letterSpacing: "2px"
            }}>
              <Rocket size={14} /> BEGIN YOUR JOURNEY
            </div>
            
            <h2 style={{ 
              fontFamily: "'Outfit', sans-serif", fontSize: "clamp(44px, 6vw, 72px)", 
              fontWeight: 800, color: "var(--bg-card)", lineHeight: 1.1, marginBottom: "24px"
            }}>
              Your roadmap starts<br />right now.
            </h2>
            
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "18px", maxWidth: "500px", margin: "0 auto 40px", lineHeight: 1.6 }}>
              Join 40,000+ students building careers they're proud of. Real skills. Real progress. Real offers.
            </p>
            
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" style={{
                background: "var(--bg-card)", color: "#6c63ff", 
                fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "16px", 
                padding: "18px 48px", borderRadius: "14px", 
                boxShadow: "0 12px 30px rgba(0,0,0,0.15)", transition: "transform 0.3s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                Create Free Account →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
