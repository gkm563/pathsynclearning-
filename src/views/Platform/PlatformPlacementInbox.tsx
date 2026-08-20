"use client";

import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, Search, Filter, Briefcase, MapPin, Coins, Award, 
  ArrowUpRight, ChevronRight, Calendar, User, Send, CheckCircle2,
  AlertCircle, Sparkles, BookOpen, Clock, Heart, ThumbsUp
} from "lucide-react";

// Mock Recruiter Messages
const RECRUITER_MESSAGES = [
  {
    id: "m1",
    company: "Stripe",
    logoText: "S",
    logoBg: "linear-gradient(135deg, #635bff, #0a2540)",
    role: "Software Engineer (Backend) - Intern",
    recruiterName: "Rebecca Chen",
    recruiterTitle: "University Recruiting Lead",
    recruiterImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    date: "July 22, 2026",
    status: "Interview Offered",
    statusCol: "#00c9a7",
    statusBg: "rgba(0,201,167,0.12)",
    compensation: "₹45,000 / month + housing allowance",
    location: "Bangalore (Hybrid)",
    criThreshold: 60,
    snippet: "Hi Rahul, your DSA node mastery (72%) and Career Readiness Index (CRI) caught our attention. We'd love to fast-track you...",
    body: "Hi Rahul,\n\nI'm Rebecca from the Stripe engineering recruiting team. We've been tracking B.Tech candidates with exceptional system consistency on PathEd, and your profile stands out in the top 15% percentile.\n\nParticularly, your 72% DSA mastery rating and recent project showcase meet our high standards for backend engineering interns. We would like to invite you for a 45-minute technical review next week. You will skip our standard resume screening and initial coding test, going straight to the engineering whiteboard assessment.\n\nLet us know if you are interested, and click 'Accept Invite' to sync your calendar.\n\nBest,\nRebecca Chen"
  },
  {
    id: "m2",
    company: "Google Labs",
    logoText: "G",
    logoBg: "linear-gradient(135deg, #4285f4, #ea4335)",
    role: "Associate AI Resident Engineer",
    recruiterName: "David Miller",
    recruiterTitle: "Principal AI Recruiter",
    recruiterImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
    date: "July 20, 2026",
    status: "Test Passed - Shortlisted",
    statusCol: "#6c63ff",
    statusBg: "rgba(108,99,255,0.12)",
    compensation: "₹18 LPA base + Performance bonus",
    location: "Hyderabad (On-site)",
    criThreshold: 62,
    snippet: "Congratulations! You've successfully cleared the Google AI Global Hackathon evaluation with a score matching our...",
    body: "Hi Rahul,\n\nCongratulations on completing the Google AI Global Hackathon challenge! Your platform performance matches our benchmark for the Associate AI Resident Program.\n\nOur engineering team has reviewed your code structure and verified your data structures fundamentals on PathEd. Since your CRI of 62% satisfies our minimum residency criteria, we have updated your status to Shortlisted.\n\nYour next step is a 1-on-1 discussion with an AI research mentor from Google Labs Bangalore. Please confirm your availability.\n\nCheers,\nDavid Miller"
  },
  {
    id: "m3",
    company: "Razorpay",
    logoText: "R",
    logoBg: "linear-gradient(135deg, #0500ff, #00d3ff)",
    role: "Full Stack Engineer (React/Node)",
    recruiterName: "Neha Sharma",
    recruiterTitle: "Lead Tech Recruiter",
    recruiterImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
    date: "July 18, 2026",
    status: "Application Open",
    statusCol: "#f7971e",
    statusBg: "rgba(247,151,30,0.12)",
    compensation: "₹12 - ₹15 LPA",
    location: "Bangalore / Remote",
    criThreshold: 55,
    snippet: "We are hiring for our Core Payments team. Your high Web Dev (88%) score makes you an excellent fit for the role...",
    body: "Hi Rahul,\n\nI'm Neha from Razorpay. We are scaling our core payments engineering team and looking for junior developers with strong front-end capability and solid API design knowledge.\n\nYour PathEd skill profile shows an 88% mastery rating in Web Development and excellent responsive coding speed. We'd love to review your application. As you already have a verified portfolio, you can apply directly with a single click. No extra forms are needed.\n\nLooking forward to your application!\n\nBest regards,\nNeha"
  },
  {
    id: "m4",
    company: "Mercedes-Benz RD India",
    logoText: "M",
    logoBg: "linear-gradient(135deg, #1e293b, #0f172a)",
    role: "Graduate Engineer Trainee (C++)",
    recruiterName: "Arjun Verma",
    recruiterTitle: "Head of Talent Acquisition",
    recruiterImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
    date: "July 15, 2026",
    status: "Direct Interview Invite",
    statusCol: "#e040fb",
    statusBg: "rgba(224,64,251,0.12)",
    compensation: "₹10 LPA base + benefits",
    location: "Pune / Bangalore",
    criThreshold: 58,
    snippet: "We saw your solid fundamentals in Object-Oriented programming and C++ execution. We have bypassed the round 1 test...",
    body: "Hello Rahul,\n\nWe are recruiting Graduate Engineer Trainees for our automotive software engineering division at Mercedes-Benz Research and Development India.\n\nYour verified OOP fundamentals (90% rating) and C++ memory management skills align perfectly with our engine simulation team. We've bypassed the Round 1 screening test for you. Please choose a slot for a live C++ coding review with our panel.\n\nThanks,\nArjun Verma"
  },
  {
    id: "m5",
    company: "Adobe",
    logoText: "A",
    logoBg: "linear-gradient(135deg, #ff0000, #990000)",
    role: "Software Engineer - Document Cloud",
    recruiterName: "Sarah Connor",
    recruiterTitle: "Senior Tech Talent Partner",
    recruiterImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    date: "July 10, 2026",
    status: "Action Required",
    statusCol: "#ef4444",
    statusBg: "rgba(239,68,68,0.12)",
    compensation: "₹22 LPA base + stocks",
    location: "Noida / Hybrid",
    criThreshold: 65,
    snippet: "Your profile matches our SDE 1 requirements, but your DBMS index node is slightly below our 70% threshold. Boost...",
    body: "Hi Rahul,\n\nWe have reviewed your profile for the Document Cloud team. Your overall CRI of 62% is excellent, and your coding performance is very strong.\n\nHowever, our technical filters for this role require a minimum of 70% mastery in DBMS concepts, specifically Indexing & B-Trees, which is currently at 60% on your graph. If you can complete the remaining DBMS nodes and verify them this week, you will automatically unlock this interview slot.\n\nKeep coding and let us know once you've unlocked it!\n\nBest,\nSarah Connor"
  }
];

export default function PlatformPlacementInbox() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(RECRUITER_MESSAGES[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'interview', 'action'

  const selectedMessage = RECRUITER_MESSAGES.find(m => m.id === selectedId) || RECRUITER_MESSAGES[0];

  const filteredMessages = RECRUITER_MESSAGES.filter(msg => {
    const matchesSearch = msg.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          msg.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          msg.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "interview") return msg.status.toLowerCase().includes("interview") || msg.status.toLowerCase().includes("shortlisted");
    if (filterType === "action") return msg.status.toLowerCase().includes("action") || msg.status.toLowerCase().includes("open");
    return matchesSearch;
  });

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
                <Inbox size={26} color="#6c63ff" />
                Placement <span style={{ color: "#6c63ff" }}>Inbox</span>
              </h1>
              <span style={{
                padding: "4px 12px", borderRadius: 14,
                background: "rgba(0, 201, 167, 0.12)", border: "1px solid #00c9a750",
                color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900
              }}>
                ● DIRECT CHANNELS UNLOCKED
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
              Verified recruiters sending direct assessment bypasses based on your <b>CRI (62%)</b>
            </p>
          </div>

          {/* Placement Stats */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", padding: "10px 16px", borderRadius: 18 }}>
              <Award size={18} color="#6c63ff" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: "var(--text-muted)", fontWeight: 800 }}>ACTIVE LEADS</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text-main)" }}>5 Opportunities</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", padding: "10px 16px", borderRadius: 18 }}>
              <Clock size={18} color="#f7971e" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: "var(--text-muted)", fontWeight: 800 }}>PROFILE VIEWS</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text-main)" }}>14 Recruiter Views</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Two-Column Inbox Layout & The Educational Opportunity Card */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", lgLayout: "unset", gap: 24 }} className="inbox-container">
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 1024px) {
              .inbox-container {
                grid-template-columns: 360px 1fr !important;
              }
            }
          `}} />

          {/* Left Column: Search, Filters, and Recruiter List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Grab Placement Opportunities Educational Card */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 15px 30px rgba(108,99,255,0.2)" }}
              onClick={() => router.push(routes.marketing.guides)}
              style={{
                background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
                borderRadius: 22,
                padding: "20px 24px",
                color: "#ffffff",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                border: "none"
              }}
            >
              {/* Decorative Blur Spheres */}
              <div style={{ position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.15)", filter: "blur(20px)" }} />
              <div style={{ position: "absolute", left: -20, bottom: -40, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.1)", filter: "blur(15px)" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Sparkles size={18} style={{ color: "#fff9e6" }} />
                <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800, color: "#fff9e6", letterSpacing: 1.2 }}>PATHED PLAYBOOK</span>
              </div>
              
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "#ffffff", marginBottom: 8, lineHeight: 1.3 }}>
                How to grab placement opportunities?
              </h3>
              
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.9)", lineHeight: 1.5, margin: "0 0 16px", fontWeight: 500 }}>
                Recruiters bypass standard resume filters and invite you directly based on your Career Readiness Index (CRI). Complete challenges and roadmap nodes to unlock premium companies.
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                <span>Read Placement Guide</span>
                <ArrowUpRight size={16} />
              </div>
            </motion.div>

            {/* List & Filtering card */}
            <div style={{
              background: "var(--bg-card)",
              borderRadius: 22,
              border: "1.5px solid var(--border-light)",
              padding: 20,
              boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}>
              {/* Search Bar */}
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
                <input
                  type="text"
                  placeholder="Search recruiters or roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    borderRadius: 14,
                    background: "var(--bg-alt)",
                    border: "1.5px solid var(--border-light)",
                    color: "var(--text-main)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    outline: "none",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#6c63ff"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border-light)"}
                />
              </div>

              {/* Filters Toggle Group */}
              <div style={{ display: "flex", background: "var(--bg-alt)", padding: 4, borderRadius: 12, border: "1px solid var(--border-light)" }}>
                {[
                  { id: "all", label: "All" },
                  { id: "interview", label: "Invites" },
                  { id: "action", label: "Pending" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "none",
                      background: filterType === tab.id ? "var(--bg-card)" : "transparent",
                      color: filterType === tab.id ? "#6c63ff" : "var(--text-muted)",
                      fontWeight: 700,
                      borderRadius: 9,
                      cursor: "pointer",
                      fontSize: 12.5,
                      fontFamily: "'Outfit', sans-serif",
                      boxShadow: filterType === tab.id ? "0 4px 10px rgba(0,0,0,0.04)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Recruiter Messages List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
                <AnimatePresence mode="popLayout">
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map(msg => {
                      const isSelected = msg.id === selectedId;
                      return (
                        <motion.div
                          key={msg.id}
                          layoutId={`card-${msg.id}`}
                          onClick={() => setSelectedId(msg.id)}
                          style={{
                            padding: "16px",
                            borderRadius: 16,
                            background: isSelected ? "rgba(108,99,255,0.06)" : "var(--bg-alt)",
                            border: `1.5px solid ${isSelected ? "#6c63ff" : "var(--border-light)"}`,
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          whileHover={{ scale: 1.01, y: -2 }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: msg.logoBg, color: "#ffffff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 900
                              }}>
                                {msg.logoText}
                              </div>
                              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>
                                {msg.company}
                              </span>
                            </div>
                            <span style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 500 }}>
                              {msg.date.split(",")[0]}
                            </span>
                          </div>

                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, color: isSelected ? "#6c63ff" : "var(--text-main)", marginBottom: 8 }}>
                            {msg.role}
                          </div>

                          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {msg.snippet}
                          </p>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{
                              padding: "4px 8px", borderRadius: 8,
                              background: msg.statusBg, color: msg.statusCol,
                              fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 800
                            }}>
                              {msg.status}
                            </span>
                            <ChevronRight size={16} color="var(--text-light)" />
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                      <AlertCircle size={28} style={{ color: "var(--text-light)", marginBottom: 8 }} />
                      <div style={{ fontWeight: 700, fontSize: 14 }}>No matches found</div>
                      <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4 }}>Try revising search criteria</div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Message/Offer View */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{
              background: "var(--bg-card)",
              borderRadius: 22,
              border: "1.5px solid var(--border-light)",
              padding: "28px 32px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
              minHeight: 560,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              
              {/* Message Header */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, paddingBottom: 20, borderBottom: "1.5px solid var(--border-light)", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: selectedMessage.logoBg, color: "#ffffff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900
                    }}>
                      {selectedMessage.logoText}
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                        {selectedMessage.role}
                      </h2>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)" }}>{selectedMessage.company}</span>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text-light)" }} />
                        <span style={{ fontSize: 13, color: "var(--text-light)", fontWeight: 500 }}>Received {selectedMessage.date}</span>
                      </div>
                    </div>
                  </div>

                  <span style={{
                    padding: "6px 14px", borderRadius: 12,
                    background: selectedMessage.statusBg, color: selectedMessage.statusCol,
                    fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800
                  }}>
                    {selectedMessage.status}
                  </span>
                </div>

                {/* Offer Details Bar */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
                  <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "14px 18px" }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-light)", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>COMPENSATION</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>
                      {selectedMessage.compensation}
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "14px 18px" }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-light)", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>LOCATION</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={16} color="#6c63ff" />
                      {selectedMessage.location}
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "14px 18px" }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-light)", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>CRI THRESHOLD</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "#6c63ff" }}>
                      Requires {selectedMessage.criThreshold}% CRI
                    </div>
                  </div>
                </div>

                {/* Recruiter Profile Card */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "var(--bg-alt)",
                  border: "1px solid var(--border-light)",
                  padding: "14px 20px",
                  borderRadius: 18,
                  marginBottom: 24
                }}>
                  <img
                    src={selectedMessage.recruiterImage}
                    alt={selectedMessage.recruiterName}
                    style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--border-light)" }}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>
                        {selectedMessage.recruiterName}
                      </span>
                      <span style={{ fontSize: 11, background: "rgba(108,99,255,0.12)", color: "#6c63ff", padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>
                        Recruiter
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>
                      {selectedMessage.recruiterTitle} @ {selectedMessage.company}
                    </p>
                  </div>
                </div>

                {/* Message Body */}
                <div style={{
                  fontSize: 15,
                  color: "var(--text-main)",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  fontFamily: "'Inter', sans-serif",
                  marginBottom: 28
                }}>
                  {selectedMessage.body}
                </div>
              </div>

              {/* Call to Actions */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 12,
                paddingTop: 20,
                borderTop: "1.5px solid var(--border-light)",
                flexWrap: "wrap"
              }}>
                <button
                  onClick={() => alert(`Reviewing details for ${selectedMessage.company} SDE role...`)}
                  style={{
                    padding: "12px 22px",
                    borderRadius: 14,
                    border: "1.5px solid var(--border-light)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 14.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--text-muted)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)"; }}
                >
                  View Details
                </button>
                <button
                  onClick={() => alert(`Declined invitation. We will share your feedback with ${selectedMessage.recruiterName}.`)}
                  style={{
                    padding: "12px 22px",
                    borderRadius: 14,
                    border: "1.5px solid var(--border-light)",
                    background: "transparent",
                    color: "#ef4444",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 14.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(239,68,68,0.06)"; el.style.borderColor = "#ef444450"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.borderColor = "var(--border-light)"; }}
                >
                  Decline
                </button>
                <button
                  onClick={() => alert(`Interview scheduled! Syncing details with your calendar and sending confirmation to ${selectedMessage.recruiterName}.`)}
                  style={{
                    padding: "12px 26px",
                    borderRadius: 14,
                    border: "none",
                    background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
                    color: "#ffffff",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 14.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(108,99,255,0.25)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.95"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  Accept Invite
                </button>
              </div>

            </div>
          </div>

        </div>

      </div></>
  );
}
