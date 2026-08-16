"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  Award, ShieldCheck, CheckCircle2, FileCheck, Share2, Download, 
  ExternalLink, Copy, Maximize2, Eye, Sparkles, Link2, X, ChevronRight, Check
} from "lucide-react";
import { Chip } from "../../components/ui/Shared";

// Mock Certificates Data
const CERTIFICATES = [
  {
    id: "c1",
    title: "Elite Software Engineer Foundation (Level 2)",
    issuer: "PathEd Assessment Board",
    issueDate: "July 20, 2026",
    idCode: "PE-CRT-2026-X839A",
    status: "Verified & Active",
    skills: ["DSA (72%)", "OOP Fundamentals (90%)", "Web Dev (88%)"],
    bgGradient: "linear-gradient(135deg, rgba(108, 99, 255, 0.08), rgba(0, 201, 167, 0.06))",
    borderCol: "#6c63ff50",
    icon: "🎓"
  },
  {
    id: "c2",
    title: "Advanced Data Structures & Algorithms Mastery",
    issuer: "PathEd DSA Committee",
    issueDate: "June 15, 2026",
    idCode: "PE-CRT-2026-D104B",
    status: "Verified & Active",
    skills: ["Trees & Graphs", "Dynamic Programming", "Time Complexity Optimization"],
    bgGradient: "linear-gradient(135deg, rgba(0, 201, 167, 0.08), rgba(56, 189, 248, 0.06))",
    borderCol: "#00c9a750",
    icon: "🌳"
  },
  {
    id: "c3",
    title: "Full-Stack Application Deployment (Capstone)",
    issuer: "PathEd Project Board",
    issueDate: "May 28, 2026",
    idCode: "PE-CRT-2026-F982C",
    status: "Verified & Active",
    skills: ["React Frontend", "REST API Development", "Redis Caching"],
    bgGradient: "linear-gradient(135deg, rgba(224, 64, 251, 0.08), rgba(108, 99, 255, 0.06))",
    borderCol: "#e040fb50",
    icon: "⚛️"
  }
];

// Mock Skill Badges Data
const BADGES = [
  { name: "Recursion Wizard", icon: "🪄", desc: "Solve 15 recursion-based challenges without errors", color: "#6c63ff" },
  { name: "React Architect", icon: "⚛️", desc: "Build a responsive web application with 90%+ modularity", color: "#00c9a7" },
  { name: "SQL Optimizer", icon: "🗄️", desc: "Reduce indexing query latency by 45% in DBMS", color: "#e040fb" },
  { name: "7-Day Streak Warrior", icon: "🔥", desc: "Maintain a 7-day coding and evaluation streak", color: "#f7971e" },
  { name: "Hackathon Finalist", icon: "⚔️", desc: "Finish in the top 5% of the Google AI Hackathon", color: "#ef4444" },
  { name: "Clean Coder", icon: "✨", desc: "Achieve an average of 95% on verified mentor reviews", color: "#38bdf8" },
  { name: "Graph Navigator", icon: "🕸️", desc: "Master all graph search and shortest path algorithms", color: "#8b5cf6" },
  { name: "Memory Guardian", icon: "🛡️", desc: "Successfully prevent all memory leaks in C++ reviews", color: "#ec4899" }
];

// Mock Academic / Assessment Records Data
const ACADEMIC_RECORDS = [
  { term: "B.Tech Semester 3", score: "9.4 CGPA", detail: "CS Core: DSA (A+), DBMS (A), Discrete Math (A+)", hash: "0x8fa351db902" },
  { term: "B.Tech Semester 2", score: "9.0 CGPA", detail: "OOP & Java (A+), Digital Logic (A), Probability (A)", hash: "0x7d1ab82c120" },
  { term: "B.Tech Semester 1", score: "9.2 CGPA", detail: "Computer Fundamentals (A+), Calculus (A), Physics (A+)", hash: "0x4e29e92a891" }
];

export default function PlatformRecordsCerts() {
  const [activePreview, setActivePreview] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://pathed.ai/p/rahul-kushwaha");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <DashboardLayout activeTab="records-certs">
      <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60 }}>
        
        {/* 1. Header Section */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, padding: "20px 24px",
          background: "var(--bg-card)", borderRadius: 24,
          border: "1.5px solid var(--border-light)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 900, color: "var(--text-main)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <Award size={26} color="#6c63ff" />
                Records & <span style={{ color: "#6c63ff" }}>Certificates Vault</span>
              </h1>
              <span style={{
                padding: "4px 12px", borderRadius: 14,
                background: "rgba(0, 201, 167, 0.12)", border: "1px solid #00c9a750",
                color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900
              }}>
                ● CRYPTOGRAPHICALLY SECURED
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 16, color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
              Verifiable academic records, skill badges, and credentials shared directly with target recruiters
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", padding: "10px 16px", borderRadius: 18 }}>
              <ShieldCheck size={18} color="#00c9a7" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)", fontWeight: 800 }}>VERIFIED CREDENTIALS</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-main)" }}>3 Active Certs</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", padding: "10px 16px", borderRadius: 18 }}>
              <Sparkles size={18} color="#e040fb" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)", fontWeight: 800 }}>BADGES EARNED</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-main)" }}>8 Badges</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Top Section: Shareable Profile & Academic Records side-by-side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", lgLayout: "unset", gap: 24 }} className="top-vault-grid">
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 1024px) {
              .top-vault-grid {
                grid-template-columns: 380px 1fr !important;
              }
            }
          `}} />

          {/* Shareable Public Profile Card */}
          <div style={{
            background: "linear-gradient(135deg, rgba(108, 99, 255, 0.05), var(--bg-card))",
            border: "1.5px solid #6c63ff40",
            borderRadius: 22,
            padding: 26,
            boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Link2 size={20} color="#6c63ff" />
                <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#6c63ff", letterSpacing: 1 }}>PUBLIC LEDGER LINK</span>
              </div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-main)", marginBottom: 10 }}>
                Shareable Candidate Profile
              </h3>
              <p style={{ fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20, fontWeight: 500 }}>
                Recruiters can inspect your live Skill Roadmap, verified test CGPAs, and coding speeds via this encrypted URL.
              </p>

              {/* URL Display */}
              <div style={{
                background: "var(--bg-alt)",
                border: "1px solid var(--border-light)",
                borderRadius: 12,
                padding: "12px 14px",
                fontFamily: "'Fira Code', monospace",
                fontSize: 14,
                color: "#6c63ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20
              }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 10 }}>
                  pathed.ai/p/rahul-kushwaha
                </span>
                <button
                  onClick={handleCopyLink}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: copiedLink ? "#00c9a7" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0
                  }}
                  title="Copy Profile Link"
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={() => alert("Launching your public candidate card in a new browser view...")}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
                color: "#ffffff",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 16,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 6px 18px rgba(108,99,255,0.2)"
              }}
            >
              Preview Public Profile <ExternalLink size={15} />
            </button>
          </div>

          {/* Academic & Verification Ledger */}
          <div style={{
            background: "var(--bg-card)",
            border: "1.5px solid var(--border-light)",
            borderRadius: 22,
            padding: 24,
            boxShadow: "0 8px 24px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <FileCheck size={20} color="#00c9a7" />
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                Academic & Assessment Ledger
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ACADEMIC_RECORDS.map((record, index) => (
                <div
                  key={index}
                  style={{
                    background: "var(--bg-alt)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 16,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)" }}>
                        {record.term}
                      </span>
                      <span style={{ fontSize: 13, background: "rgba(0,201,167,0.12)", color: "#00c9a7", padding: "2px 8px", borderRadius: 8, fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>
                        Ledger Synced
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.4 }}>
                      {record.detail}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text-main)" }}>
                      {record.score}
                    </div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>
                      BLOCK: {record.hash}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Verifiable Certificates Grid */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Award size={20} color="#6c63ff" />
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
              Verifiable Certifications
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {CERTIFICATES.map(cert => (
              <div
                key={cert.id}
                style={{
                  background: cert.bgGradient,
                  border: `1.5px solid ${cert.borderCol}`,
                  borderRadius: 22,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
                  position: "relative"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <span style={{ fontSize: 32 }}>{cert.icon}</span>
                    <span style={{
                      padding: "4px 10px", borderRadius: 10,
                      background: "var(--bg-card)", border: "1px solid var(--border-light)",
                      fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#00c9a7"
                    }}>
                      ✓ {cert.status}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text-main)", marginBottom: 8, lineHeight: 1.35 }}>
                    {cert.title}
                  </h3>
                  
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13.5, color: "var(--text-light)", marginBottom: 16 }}>
                    Issued: {cert.issueDate} • ID: {cert.idCode}
                  </div>

                  {/* Skills Tag Row */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                    {cert.skills.map((sk, idx) => (
                      <span key={idx} style={{ padding: "4px 10px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-light)", fontSize: 13.5, fontWeight: 600, color: "var(--text-muted)" }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
                  <button
                    onClick={() => setActivePreview(cert)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 10,
                      background: "var(--bg-card)",
                      border: "1.5px solid var(--border-light)",
                      color: "var(--text-main)",
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <Eye size={14} /> View Certificate
                  </button>
                  <button
                    onClick={() => alert(`Adding ${cert.title} directly to your LinkedIn licenses section...`)}
                    style={{
                      padding: "12px",
                      borderRadius: 10,
                      background: "var(--bg-card)",
                      border: "1.5px solid var(--border-light)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="Share to LinkedIn"
                  >
                    <Share2 size={14} />
                  </button>
                  <button
                    onClick={() => alert(`Generating high-resolution PDF for credential ${cert.idCode}...`)}
                    style={{
                      padding: "12px",
                      borderRadius: 10,
                      background: "var(--bg-card)",
                      border: "1.5px solid var(--border-light)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="Download PDF"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Verified Skill Badges Grid */}
        <div style={{
          background: "var(--bg-card)",
          border: "1.5px solid var(--border-light)",
          borderRadius: 22,
          padding: 26,
          boxShadow: "0 8px 24px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Sparkles size={20} color="#e040fb" />
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
              Earned Skill Badges
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))", gap: 14 }}>
            {BADGES.map((badge, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, scale: 1.03 }}
                style={{
                  background: "var(--bg-alt)",
                  border: "1.5px solid var(--border-light)",
                  borderRadius: 18,
                  padding: "18px 10px",
                  textAlign: "center",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
                onClick={() => alert(`Badge: ${badge.name}\nRequirement: ${badge.desc}`)}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: "50%",
                  background: `${badge.color}15`, border: `2px solid ${badge.color}60`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, marginBottom: 8,
                  boxShadow: `0 4px 10px ${badge.color}15`
                }}>
                  {badge.icon}
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800, color: "var(--text-main)", lineHeight: 1.25 }}>
                  {badge.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Full Screen Certificate Preview Modal */}
      <AnimatePresence>
        {activePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                width: "100%", maxWidth: 800,
                background: "var(--bg-card)",
                borderRadius: 24,
                border: `2px solid ${activePreview.borderCol}`,
                padding: "36px 40px",
                position: "relative",
                boxShadow: "0 25px 60px rgba(0,0,0,0.4)"
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setActivePreview(null)}
                style={{
                  position: "absolute", top: 20, right: 20,
                  width: 38, height: 38, borderRadius: "50%",
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-main)", cursor: "pointer"
                }}
              >
                <X size={18} />
              </button>

              {/* Certificate Border Frame */}
              <div style={{
                border: "2px solid var(--border-strong)",
                borderRadius: 16,
                padding: "36px 20px",
                textAlign: "center",
                background: "radial-gradient(circle, var(--bg-alt) 0%, var(--bg-card) 100%)",
                position: "relative",
                overflow: "hidden"
              }}>
                {/* Decorative background watermark */}
                <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: `${activePreview.borderCol}10`, filter: "blur(50px)" }} />
                <div style={{ position: "absolute", bottom: -100, left: -100, width: 300, height: 300, borderRadius: "50%", background: `${activePreview.borderCol}10`, filter: "blur(50px)" }} />

                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 32 }}>
                    🎓
                  </div>
                </div>

                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#6c63ff", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
                  PathEd Verification Credential
                </div>
                
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 24 }}>
                  This certifies that
                </div>

                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: "var(--text-main)", marginBottom: 8 }}>
                  Rahul Kushwaha
                </h2>
                
                <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.5, fontWeight: 500 }}>
                  has successfully verified their engineering competency and completed all required curriculum checkpoints for
                </p>

                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "#00c9a7", marginBottom: 24 }}>
                  {activePreview.title}
                </h3>

                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
                  {activePreview.skills.map((skill, idx) => (
                    <span key={idx} style={{ padding: "5px 12px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-light)", fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Footer details inside certificate */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid var(--border-light)", paddingTop: 20, maxWidth: 640, margin: "0 auto" }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-light)" }}>ISSUED BY</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)", fontFamily: "'Outfit', sans-serif" }}>{activePreview.issuer}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{activePreview.issueDate}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-light)" }}>VERIFICATION HASH</div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#6c63ff", fontWeight: 700 }}>
                      {activePreview.idCode}
                    </div>
                  </div>
                </div>

              </div>

              {/* Actions row inside modal */}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                <button
                  onClick={() => setActivePreview(null)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: "1.5px solid var(--border-light)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  Close Preview
                </button>
                <button
                  onClick={() => alert(`Adding credential ${activePreview.idCode} directly to your LinkedIn...`)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
                    color: "#ffffff",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Share2 size={14} /> Add to LinkedIn
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
