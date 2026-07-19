import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip } from "../../components/ui/Shared";

export default function Documentation() {
  const fadeInUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "#fcfdff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      <div style={{ display: "flex", paddingTop: 100, minHeight: "100vh" }}>
        {/* Sidebar */}
        <aside style={{ width: 280, borderRight: "1px solid #eaecff", padding: "40px 32px", display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 100, height: "calc(100vh - 100px)", overflowY: "auto" }}>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Getting Started</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <li><a href="#" style={{ color: "#1677ff", fontWeight: 600, textDecoration: "none" }}>Introduction</a></li>
              <li><a href="#" style={{ color: "#666", textDecoration: "none" }}>Quick Start</a></li>
              <li><a href="#" style={{ color: "#666", textDecoration: "none" }}>Core Concepts</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Platform Features</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <li><a href="#" style={{ color: "#666", textDecoration: "none" }}>Skill Trees</a></li>
              <li><a href="#" style={{ color: "#666", textDecoration: "none" }}>CRI Algorithm</a></li>
              <li><a href="#" style={{ color: "#666", textDecoration: "none" }}>AI Mentorship</a></li>
            </ul>
          </div>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: "60px 80px", maxWidth: 900 }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#e6f4ff" border="#bae0ff" color="#1677ff">DOCUMENTATION</Chip>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, color: "#1a1a2e", marginTop: 24, marginBottom: 24 }}>
              Introduction to PathEd
            </h1>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8, marginBottom: 32 }}>
              Welcome to the official PathEd documentation. Here you'll find everything you need to understand the platform's architecture, how the Career Readiness Index (CRI) is calculated, and how our skill trees map directly to industry demands.
            </p>

            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 700, color: "#1a1a2e", marginTop: 48, marginBottom: 24 }}>
              What is PathEd?
            </h2>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8, marginBottom: 24 }}>
              PathEd is a highly technical EdTech ecosystem designed specifically for engineering students. We observed a massive disconnect between what universities teach and what companies actually need. PathEd bridges this gap by providing dynamically updated, industry-vetted roadmaps.
            </p>

            <div style={{ background: "#f0f0ff", borderLeft: "4px solid #6c63ff", padding: 24, borderRadius: "0 12px 12px 0", marginTop: 32 }}>
              <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>The Core Philosophy</h4>
              <p style={{ color: "#444", lineHeight: 1.6, margin: 0 }}>
                We believe in proof-of-work over traditional grading. Every module you complete on PathEd involves building real-world projects that directly contribute to your CRI score.
              </p>
            </div>
          </motion.div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
