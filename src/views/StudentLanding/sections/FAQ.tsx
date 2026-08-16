"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How does the AI-generated roadmap work?",
    a: "Our AI engine analyzes millions of data points from recent job descriptions across top tech companies. It then cross-references this with your current skill level and degree syllabus to generate a highly personalized, week-by-week roadmap that targets the exact skills you need to land your dream role."
  },
  {
    q: "Can I switch between Career Mode and Academic Mode?",
    a: "Absolutely! The toggle is available right on your dashboard. Academic Mode focuses on optimizing your CGPA and managing university deadlines, while Career Mode focuses on your Career Readiness Index (CRI) and placement preparation. You can balance both seamlessly."
  },
  {
    q: "What is the Career Readiness Index (CRI)?",
    a: "The CRI is a proprietary metric developed by PathEd that quantifies how prepared you are for an industry role. It factors in your completed roadmap nodes, DSA proficiency, project quality, and mock interview performance to give recruiters a standardized measure of your skills."
  },
  {
    q: "Is PathEd free for students?",
    a: "PathEd offers a comprehensive free tier that includes basic roadmaps, the community forum, and essential tracking. For advanced features like AI mock interviews, 1-on-1 teacher connect, and premium cert paths, we offer an affordable Student Pro subscription."
  },
  {
    q: "How do recruiters find me on PathEd?",
    a: "Recruiters use our partner platform to filter students based on their CRI score, verified skills, and project portfolios. If you opt-in to the talent pool and maintain a high CRI, recruiters can send you direct interview invites, bypassing the standard resume screening phase."
  }
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section style={{ padding: "100px 32px", background: "var(--bg-card)", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: "12px", fontWeight: 600, color: "#f7971e", letterSpacing: "3px", marginBottom: "12px" }}>▸ CLARITY</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "var(--text-main)", marginBottom: "16px" }}>
            Recently Asked <span style={{ color: "#f7971e" }}>Questions</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", fontFamily: "'Inter', sans-serif" }}>
            Everything you need to know about how PathEd works.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div 
                key={i} 
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                style={{ 
                  background: isOpen ? "var(--bg-card)" : "var(--bg-alt)", 
                  border: `1px solid ${isOpen ? "#6c63ff" : "var(--border-light)"}`, 
                  borderRadius: "16px", padding: "24px", cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: isOpen ? "0 12px 32px rgba(108,99,255,0.1)" : "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "18px", fontWeight: 700, color: isOpen ? "#6c63ff" : "var(--text-main)" }}>
                    {faq.q}
                  </h3>
                  <div style={{ color: isOpen ? "#6c63ff" : "#bbb", transition: "color 0.3s" }}>
                    {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </div>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: "16px" }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
