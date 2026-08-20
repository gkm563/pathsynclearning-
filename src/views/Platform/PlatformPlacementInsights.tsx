"use client";
import { routes } from "@/lib/routes";

import { useRouter } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";
import { 
  Lightbulb, Brain, Bot, Users, Award, TrendingUp, Sparkles, 
  CheckCircle2, AlertTriangle, ArrowUpRight, BarChart2, Star, ShieldAlert,
  ChevronRight, RefreshCw, MessageSquare
} from "lucide-react";
import { Chip, SkillBar, HoverCard } from "../../components/ui/Shared";

// Mock AI Insights data
const AI_INSIGHTS = [
  {
    id: "ai1",
    title: "Targeted DSA Competency Boost",
    category: "DSA · Graph & DP",
    impact: "+8% CRI Score",
    type: "immediate",
    desc: "Your current Graph & Dynamic Programming node mastery stands at 62%. Upgrading this node to 75% will satisfy recruitment thresholds for top-tier companies like Stripe and Uber.",
    actionText: "Practice Graph Problems",
    icon: "🎯",
    link: routes.app.challenges
  },
  {
    id: "ai2",
    title: "Backend Portfolio Packaging",
    category: "Architecture · System Integration",
    impact: "+14% SDE Alignment",
    type: "project",
    desc: "Your GitHub portfolio contains 2 projects. Introducing a microservices-based project (utilizing Redis caching and Docker containerization) will showcase standard industrial skills sought by recruiters.",
    actionText: "Unlock Project Blueprint",
    icon: "🚀",
    link: "/project-collab"
  },
  {
    id: "ai3",
    title: "DBMS Skill Recency Decay Warning",
    category: "Data Integrity · Indexing",
    impact: "Stabilize CRI score",
    type: "decay",
    desc: "Your DBMS Indexing and B-Trees skill node has a recency decay warning. Spend 20 minutes refreshing transactions to maintain your top 12% national percentile ranking.",
    actionText: "Take 10m Refresh Quiz",
    icon: "⚡",
    link: routes.app.challenges
  },
  {
    id: "ai4",
    title: "Market Demand Alignment",
    category: "Tech Stack · Go/Rust Concurrency",
    impact: "+18 Active Leads",
    type: "trend",
    desc: "Recruiter requests for Go/Rust concurrency fundamentals have increased by 35% this quarter. Unlocking the basic Go channel node will make your profile eligible for 12 new automated recruiter views.",
    actionText: "Unlock Go Roadmap",
    icon: "📈",
    link: routes.app.roadmap
  }
];

// Mock Mentor Insights data
const MENTOR_INSIGHTS = [
  {
    id: "me1",
    mentorName: "Aarav Mehta",
    mentorTitle: "SDE 2 @ Google",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    date: "Reviewed July 21, 2026",
    projectName: "Distributed Chat Application",
    comment: "Code review on your chat repository shows solid object-oriented layout and clean Separation of Concerns. However, your WebSocket connection pooling is unthrottled, which could cause socket starvation under heavy load. I've left detailed notes on how to refactor your Redis Pub/Sub client connection builder to prevent memory leaks.",
    score: "4.8 / 5"
  },
  {
    id: "me2",
    mentorName: "Sophia Vance",
    mentorTitle: "Engineering Lead @ Stripe",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    date: "Reviewed July 17, 2026",
    projectName: "Mock Whiteboard Round - Array Mapping",
    comment: "During our mock whiteboard session, your communication was highly structured and logical. You correctly identified the brute-force time complexity as O(N²). To stand out in high-paying interviews, try immediately highlighting the space-time trade-off using hash maps to reach O(N) linear time without being prompted. Excellent confidence overall.",
    score: "4.5 / 5"
  },
  {
    id: "me3",
    mentorName: "Rahul Sen",
    mentorTitle: "Senior Architect @ Adobe",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    date: "Reviewed July 12, 2026",
    projectName: "E-Commerce System Design Mock",
    comment: "Your high-level system diagram has a robust database partition structure. However, when designing microservices, pay close attention to distributed transaction limits. Recruiters looking for core backend developers love to hear about the Saga Pattern or Two-Phase Commit strategies. Work on explaining data consistency next.",
    score: "4.6 / 5"
  }
];

export default function PlatformPlacementInsights() {
  const router = useRouter();
  const fadeInUp = { initial: { opacity: 0, y: 25 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60 }}>
        
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
                <Lightbulb size={26} color="#6c63ff" />
                Placement <span style={{ color: "#6c63ff" }}>Insights</span>
              </h1>
              <span style={{
                padding: "4px 12px", borderRadius: 14,
                background: "rgba(108, 99, 255, 0.12)", border: "1px solid #6c63ff50",
                color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900
              }}>
                ✦ AI & MENTOR CONNECTEDED
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 16, color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
              Actionable engineering guidance synchronized across your active roadmap evaluations
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600 }}>Sync updated: 14 minutes ago</span>
            <button
              onClick={() => alert("Re-analyzing roadmap nodes, project updates, and mentor logs...")}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12,
                background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer"
              }}
            >
              <RefreshCw size={13} /> Re-analyze Profile
            </button>
          </div>
        </div>

        {/* 2. Top Analytics Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {/* Card 1: Placement Readiness */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 22, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#6c63ff", letterSpacing: 0.5 }}>
                READINESS SCORE (CRI)
              </div>
              <Award size={20} color="#6c63ff" />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: "var(--text-main)" }}>62%</span>
              <span style={{ fontSize: 15, color: "#00c9a7", fontWeight: 700 }}>+4% this week</span>
            </div>
            <div style={{ fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.5, fontWeight: 500 }}>
              Top 15% percentile among B.Tech candidates nationwide.
            </div>
          </div>

          {/* Card 2: Active Views */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 22, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#f7971e", letterSpacing: 0.5 }}>
                ACTIVE RECRUITER VIEWS
              </div>
              <TrendingUp size={20} color="#f7971e" />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: "var(--text-main)" }}>14</span>
              <span style={{ fontSize: 15, color: "#f7971e", fontWeight: 700 }}>+5 views</span>
            </div>
            <div style={{ fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.5, fontWeight: 500 }}>
              Recruiters from Stripe, Razorpay, and Adobe viewed your profile.
            </div>
          </div>

          {/* Card 3: Peer Cohort Percentile */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 22, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#00c9a7", letterSpacing: 0.5 }}>
                COHORT PERCENTILE
              </div>
              <Star size={20} color="#00c9a7" />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: "var(--text-main)" }}>Top 12%</span>
              <span style={{ fontSize: 15, color: "#00c9a7", fontWeight: 700 }}>IIT Kanpur SDEs</span>
            </div>
            <div style={{ fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.5, fontWeight: 500 }}>
              Leading in coding consistency and roadmap node verification count.
            </div>
          </div>
        </div>

        {/* 3. Mid-Page Skill Dimension Breakdown */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          lgLayout: "unset",
          gap: 24
        }} className="insights-grid">
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 1024px) {
              .insights-grid {
                grid-template-columns: 360px 1fr !important;
              }
            }
          `}} />

          {/* Skill Performance Ratings Column */}
          <div style={{
            background: "var(--bg-card)",
            border: "1.5px solid var(--border-light)",
            borderRadius: 22,
            padding: 24,
            boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <BarChart2 size={20} color="#6c63ff" />
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  Engineering Competency
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  { label: "DSA & Problem Solving", pct: 72, color: "#6c63ff" },
                  { label: "Coding Speed & Quality", pct: 88, color: "#00c9a7" },
                  { label: "System Architecture", pct: 45, color: "#f7971e" },
                  { label: "Data Management & SQL", pct: 60, color: "#e040fb" },
                  { label: "Technical Communication", pct: 75, color: "#38bdf8" }
                ].map((skill, idx) => (
                  <div key={idx}>
                    <SkillBar label={skill.label} pct={skill.pct} c={skill.color} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: "var(--bg-alt)",
              borderRadius: 14,
              padding: 16,
              border: "1px solid var(--border-light)",
              marginTop: 24
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Sparkles size={14} color="#6c63ff" />
                <span style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-main)", fontFamily: "'Outfit', sans-serif" }}>Focus Next Block</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, fontWeight: 500 }}>
                Devoting two 45m blocks to System Architecture (System Design) and data caching nodes will raise your composite score above the 70% direct referral threshold.
              </p>
            </div>
          </div>

          {/* AI Insights & Mentor Feedback Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* AI Insights Panel */}
            <div style={{
              background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)",
              borderRadius: 22,
              padding: 24,
              boxShadow: "0 8px 24px rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Bot size={20} color="#6c63ff" />
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  PathEd AI Diagnostics & Recommendations
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                {AI_INSIGHTS.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "var(--bg-alt)",
                      border: "1px solid var(--border-light)",
                      borderRadius: 16,
                      padding: 18,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "transform 0.2s"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{item.icon}</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "#6c63ff", fontFamily: "'Fira Code', monospace" }}>{item.category}</span>
                        </div>
                        <span style={{ fontSize: 13, background: "rgba(0,201,167,0.12)", color: "#00c9a7", padding: "3px 8px", borderRadius: 8, fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>
                          {item.impact}
                        </span>
                      </div>
                      <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 16px", fontWeight: 500 }}>
                        {item.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => router.push(item.link)}
                      style={{
                        width: "100%",
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
                        gap: 6,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6c63ff"; e.currentTarget.style.color = "#6c63ff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.color = "var(--text-main)"; }}
                    >
                      {item.actionText} <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mentor Insights Panel */}
            <div style={{
              background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)",
              borderRadius: 22,
              padding: 24,
              boxShadow: "0 8px 24px rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Users size={20} color="#6c63ff" />
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  Verified Mentor Reviews & Evaluations
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {MENTOR_INSIGHTS.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      background: "var(--bg-alt)",
                      border: "1px solid var(--border-light)",
                      borderRadius: 18,
                      padding: 20,
                      display: "flex",
                      gap: 16,
                      flexDirection: "column",
                      responsiveLayout: "unset"
                    }}
                    className="mentor-card"
                  >
                    <style dangerouslySetInnerHTML={{__html: `
                      @media (min-width: 640px) {
                        .mentor-card {
                          flex-direction: row !important;
                        }
                      }
                    `}} />

                    {/* Mentor Profile */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", minWidth: 140, flexShrink: 0 }}>
                      <img
                        src={review.avatar}
                        alt={review.mentorName}
                        style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", marginBottom: 8, border: "2.5px solid var(--border-strong)" }}
                      />
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 800, color: "var(--text-main)" }}>
                        {review.mentorName}
                      </div>
                      <div style={{ fontSize: 13, color: "#6c63ff", fontWeight: 700, fontFamily: "'Fira Code', monospace", marginTop: 2 }}>
                        {review.mentorTitle}
                      </div>
                    </div>

                    {/* Feedback Detail */}
                    <div style={{ display: "flex", flexDirection: "column", justifyRules: "space-between", flexGrow: 1 }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>
                            📄 {review.projectName}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: "#f7971e" }}>★ {review.score}</span>
                          </div>
                        </div>

                        <p style={{ margin: 0, fontSize: 15.5, color: "var(--text-main)", lineHeight: 1.6, fontWeight: 500 }}>
                          "{review.comment}"
                        </p>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: 10, marginTop: 12 }}>
                        <span style={{ fontSize: 13, color: "var(--text-light)" }}>{review.date}</span>
                        <button
                          onClick={() => alert(`Opening full code session logs with ${review.mentorName}...`)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#6c63ff",
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 14.5,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4
                          }}
                        >
                          View Session Logs <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div></>
  );
}

