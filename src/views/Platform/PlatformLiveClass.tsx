"use client";

import { routes } from "@/lib/routes";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  ArrowLeft, Send, Users, MessageSquare, Video, ShieldCheck, 
  Sparkles, FileText, Download, Play, Volume2, Settings, Maximize2 
} from "lucide-react";

/* ─── COLOR TOKENS ─── */
const COLS = {
  primary: "#6c63ff",
  success: "#00c9a7",
  warning: "#f59e0b",
  danger: "#ec4899",
  info: "#38bdf8"
};

/* ─── CLASS PARTICIPANTS LIST DATA ─── */
const PARTICIPANTS = [
  { name: "Rahul Kushwaha", path: "AI & Machine Learning", status: "Active", avatar: "🎓" },
  { name: "Anjali Sharma", path: "Core Software Engineering (SDE)", status: "Active", avatar: "👩‍💻" },
  { name: "Rohan Das", path: "Database & Cloud Architecture", status: "Active", avatar: "👨‍💻" },
  { name: "Sneha Iyer", path: "AI & Machine Learning", status: "Active", avatar: "👩‍🎓" },
  { name: "Vikram Bose", path: "Core Software Engineering (SDE)", status: "Idle", avatar: "👨‍💻" },
  { name: "Priya Nair", path: "Database & Cloud Architecture", status: "Active", avatar: "👩‍💻" }
];

/* ─── CLASS DETAILS DICTIONARY ─── */
const CLASS_INFO = {
  m1: {
    topic: "ML Systems Design & Hyper-parameter Triage",
    desc: "In this session, we cover the end-to-end lifecycle of deploying Machine Learning systems in production. We address data drift, concept drift, feature store scaling, validation strategies, and hyper-parameter optimization loops (Bayesian Search vs Grid Search).",
    notes: "ML_Optimization_Notes.pdf",
    outline: [
      "1. Data validation and validation pipelines (TFDV)",
      "2. Feature engineering pipelines and online/offline alignment",
      "3. Distributed model training with Pytorch Lightning",
      "4. Performance tuning: quantization, pruning, and model distillation"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  m2: {
    topic: "Preparing for Google STEP interviews",
    desc: "This lecture outlines the algorithmic expectations for Google STEP candidates. We analyze recursive structures, backtracking recursion trees, space complexity, and how to successfully pitch optimizations verbally during technical interview windows.",
    notes: "Google_STEP_Preparation.pdf",
    outline: [
      "1. Array manipulation and dynamic sliding window thresholds",
      "2. Stack matching algorithms & parentheses balanced sequences",
      "3. Tree traversal recursion and space-complexity validation",
      "4. Interviewer communication: edge case listing and optimization pitches"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  m7: {
    topic: "Thinking like an Engineer: DSA Traverses",
    desc: "A hands-on coding walkthrough on data structure traversals. We analyze DFS, BFS, pre-order/post-order traversals, and look at the mathematical properties of graph cycle detection and topological sorting.",
    notes: "DSA_Traversals_Handout.pdf",
    outline: [
      "1. Graph representation: Adjacency list memory optimization",
      "2. Depth-First Search (DFS) recursion stack modeling",
      "3. Breadth-First Search (BFS) queue mechanics & shortest path properties",
      "4. Topological sort algorithm with cycle verification"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
};

export default function PlatformLiveClass() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teacherId = searchParams.get("teacher") || "m7";
  const classTopic = searchParams.get("topic") || "DSA Traverses";

  const classData = CLASS_INFO[teacherId] || CLASS_INFO.m7;

  // Active side panel tab: "comments" | "participants"
  const [panelTab, setPanelTab] = useState("comments");

  // Chat message state
  const [messages, setMessages] = useState([
    { user: "Anjali Sharma", text: "Is the latency of the Redis caching layers dependent on partition sizes?", time: "4:02 PM", self: false },
    { user: "Rohan Das", text: "Yes, larger hash rings require additional lookup segments.", time: "4:03 PM", self: false },
    { user: "Dr. Arpan Mukherjee", text: "Welcome everyone! We will start the system designs discussion now. Feel free to type comments.", time: "4:04 PM", self: false }
  ]);
  const [inputVal, setInputVal] = useState("");
  const chatEndRef = useRef<any>(null);

  // AI Assistance tutor panel state
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const aiEndRef = useRef<any>(null);

  const getInitialAiMessage = () => {
    if (teacherId === "m1") {
      return "Hello Rahul! The instructor is presenting Machine Learning System Design and Hyper-parameter grids. I can help explain Bayesian Search heuristics, online validation strategies, or offline pipeline aligners.";
    }
    if (teacherId === "m2") {
      return "Hello Rahul! The instructor is covering Google STEP recruitment preparation, arrays, sliding windows, and recursion tree complexity. Ask me to analyze recursion space matching or draft slide index codes.";
    }
    return "Hello Rahul! The instructor is demonstrating Graph Traversals (DFS/BFS) and adjacency list optimizations. I can explain queue mechanics, shortest path bounds, or standard cycle checking models.";
  };

  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", text: getInitialAiMessage(), time: "4:05 PM" }
  ]);

  // Auto-scroll chat and AI responses
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (aiEndRef.current) {
      aiEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages, showAiPanel]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setMessages(prev => [
      ...prev,
      { user: "Rahul Kushwaha (You)", text: inputVal, time: "4:05 PM", self: true }
    ]);
    setInputVal("");
  };

  const handleAiSend = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userText = aiInput;
    setAiMessages(prev => [...prev, { role: "user", text: userText, time: "4:06 PM" }]);
    setAiInput("");

    // Simulate AI response based on topic keywords
    setTimeout(() => {
      let reply = "That is a great question. Let me break that concept down for you. In production environments, we prioritize modularity and low space complexity. Let me know if you would like a code snippet of this traversal implementation!";
      if (userText.toLowerCase().includes("dfs") || userText.toLowerCase().includes("traverse")) {
        reply = "Depth-First Search (DFS) traverses down recursion branches until they terminate, pushing nodes onto the system stack. It has O(V + E) time complexity and O(V) space complexity due to recursion depth. In comparison, BFS uses queue structures to traverse level-by-level.";
      } else if (userText.toLowerCase().includes("ml") || userText.toLowerCase().includes("hyperparameter")) {
        reply = "Hyper-parameter optimization calibrates training parameters (like learning rate or batch size) outside the model loop. Bayesian search uses prior trials to build a probability model of the objective function, targeting optimal values much faster than grid search.";
      } else if (userText.toLowerCase().includes("step") || userText.toLowerCase().includes("google")) {
        reply = "For Google STEP interviews, focus on clean recursive formulations and sliding windows. Practice expressing recursion trees clearly with verbal walkthroughs and write test cases covering empty arrays and duplicates.";
      }
      setAiMessages(prev => [...prev, { role: "assistant", text: reply, time: "4:06 PM" }]);
    }, 1000);
  };

  return (
    <DashboardLayout activeTab="mentorship" setActiveTab={() => router.push(routes.app.mentorship)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 60 }}>
        
        {/* Top bar header */}
        <div style={{
          padding: "18px 24px", borderRadius: 20, background: "var(--bg-card)",
          border: "1.5px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => router.push(routes.app.mentorship)}
              style={{
                display: "flex", alignItems: "center", gap: 8, background: "var(--bg-alt)",
                border: "1px solid var(--border-light)", borderRadius: 12, padding: "8px 14px",
                color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 13.5,
                fontWeight: 800, cursor: "pointer"
              }}
            >
              <ArrowLeft size={16} /> Back to Mentorship
            </button>
            
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ padding: "4px 8px", background: "rgba(239, 68, 68, 0.15)", color: "#ec4899", border: "1px solid #ec4899", borderRadius: 8, fontSize: 11, fontFamily: "'Fira Code', monospace", fontWeight: 900 }}>
                ● LIVE STREAM
              </span>
              <span style={{ padding: "4px 8px", background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 8, fontSize: 11, fontFamily: "'Fira Code', monospace", fontWeight: 800, color: "var(--text-muted)" }}>
                {PARTICIPANTS.length + 18} WATCHING
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setShowAiPanel(true)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg, rgba(108, 99, 255, 0.12), rgba(0, 201, 167, 0.12))",
                border: "1.5px solid #6c63ff", borderRadius: 12, padding: "8px 16px",
                color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontSize: 13.5,
                fontWeight: 900, cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <Sparkles size={15} color="#6c63ff" />
              <span>AI Assistance</span>
            </button>
          </div>
        </div>

        {/* Live streaming layout: Left video/notes, Right panel */}
        <div style={{ display: "grid", gridTemplateColumns: "2.4fr 1.1fr", gap: 24, alignItems: "start" }}>
          
          {/* Left Column: Video screen & syllabus description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Immersive Video Screen (YouTube styled) */}
            <div style={{
              background: "#000", borderRadius: 24, overflow: "hidden", 
              border: "1.5px solid var(--border-light)", position: "relative",
              aspectRatio: "16/9", display: "flex", flexDirection: "column"
            }}>
              {/* Mock Video Iframe */}
              <iframe
                width="100%"
                height="100%"
                src={classData.videoUrl}
                title="Live Stream Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ flex: 1, border: "none" }}
              />

              {/* YouTube Styled Custom Control overlay */}
              <div style={{
                background: "rgba(15, 23, 42, 0.9)", padding: "12px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <button style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}><Play size={16} /></button>
                  <button style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}><Volume2 size={16} /></button>
                  <span style={{ fontSize: 12, fontFamily: "'Fira Code', monospace", opacity: 0.8 }}>04:12 / Live Class</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <button style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}><Settings size={16} /></button>
                  <button style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}><Maximize2 size={16} /></button>
                </div>
              </div>
            </div>

            {/* Description & Syllabus Outline */}
            <div style={{
              padding: 28, borderRadius: 24, background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)", display: "flex", flexDirection: "column", gap: 16
            }}>
              <div>
                <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#6c63ff", fontWeight: 900 }}>
                  SYLLABUS LECTURE HIGHLIGHTS
                </span>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 900, color: "var(--text-main)", margin: "4px 0 0" }}>
                  {classData.topic}
                </h2>
              </div>

              <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                {classData.desc}
              </p>

              {/* Document/Notes download area */}
              <div style={{
                padding: "16px 20px", borderRadius: 16, background: "var(--bg-alt)",
                border: "1.5px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <FileText size={22} color="#6c63ff" />
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800, color: "var(--text-main)" }}>
                      {classData.notes}
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Syllabus notes, traversal diagrams, and code snippets handout
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Downloading ${classData.notes}...`)}
                  style={{
                    padding: "8px 16px", borderRadius: 10, border: "none",
                    background: "rgba(108,99,255,0.12)", color: "#6c63ff",
                    fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  <Download size={14} /> Download
                </button>
              </div>

              {/* Core outlines */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "var(--text-muted)", fontWeight: 800 }}>
                  LECTURE SYLLABUS PATH INDEX:
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {classData.outline.map((out, idx) => (
                    <div key={idx} style={{ fontSize: 14.5, fontFamily: "'Outfit', sans-serif", color: "var(--text-main)", display: "flex", gap: 8 }}>
                      <span style={{ color: "#00c9a7" }}>✓</span>
                      <span>{out}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Panel with Comments / Participants toggle (YouTube styled) */}
          <div style={{
            background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
            borderRadius: 24, height: "100%", minHeight: 600, display: "flex", flexDirection: "column",
            overflow: "hidden", position: "relative"
          }}>
            
            {/* AI Tutor Panel Overlay */}
            {showAiPanel && (
              <>
                {/* Transparent click-outside dismiss overlay covering the entire window */}
                <div 
                  onClick={() => setShowAiPanel(false)}
                  style={{
                    position: "fixed", inset: 0, zIndex: 110,
                    background: "rgba(0,0,0,0.02)", cursor: "default"
                  }}
                />

                {/* Floating AI Panel inside the right column bounds */}
                <div style={{
                  position: "absolute", inset: 0, background: "var(--bg-card)",
                  borderRadius: 24, zIndex: 120, display: "flex", flexDirection: "column",
                  boxShadow: "-8px 8px 30px rgba(0,0,0,0.12)", border: "1.5px solid #6c63ff",
                  overflow: "hidden"
                }}>
                  
                  {/* Header */}
                  <div style={{
                    padding: "16px 20px", borderBottom: "1.5px solid var(--border-light)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "linear-gradient(135deg, rgba(108,99,255,0.06), rgba(0,201,167,0.06))"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>🤖</span>
                      <div>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, color: "var(--text-main)" }}>
                          PathED AI Tutor
                        </div>
                        <span style={{ fontSize: 11, color: "#00c9a7", fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>
                          Active Stream Analyst
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAiPanel(false)}
                      style={{
                        background: "transparent", border: "none", color: "var(--text-muted)",
                        fontSize: 18, cursor: "pointer", fontWeight: 900
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Message body */}
                  <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                    {aiMessages.map((msg, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                        <span style={{ fontSize: 11.5, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>
                          {msg.role === "user" ? "You" : "PathED AI Tutor"} • {msg.time}
                        </span>
                        <div style={{
                          padding: "10px 14px", borderRadius: 14,
                          background: msg.role === "user" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "var(--bg-alt)",
                          color: msg.role === "user" ? "#fff" : "var(--text-main)",
                          fontSize: 13.5, fontFamily: "'Outfit', sans-serif", lineHeight: 1.45,
                          border: msg.role === "user" ? "none" : "1px solid var(--border-light)"
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={aiEndRef} />
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleAiSend} style={{ display: "flex", gap: 8, padding: 20, borderTop: "1.5px solid var(--border-light)" }}>
                    <input
                      type="text"
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      placeholder="Ask the AI Tutor anything..."
                      style={{
                        flex: 1, padding: "10px 14px", borderRadius: 12,
                        background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                        color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        width: 42, height: 42, borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                      }}
                    >
                      <Send size={15} />
                    </button>
                  </form>

                </div>
              </>
            )}
            
            {/* Toggle header */}
            <div style={{
              display: "flex", background: "var(--bg-alt)", borderBottom: "1.5px solid var(--border-light)",
              padding: 6, gap: 6
            }}>
              <button
                onClick={() => setPanelTab("comments")}
                style={{
                  flex: 1, padding: "12px", borderRadius: 14, border: "none",
                  background: panelTab === "comments" ? "var(--bg-card)" : "transparent",
                  color: panelTab === "comments" ? "#6c63ff" : "var(--text-muted)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}
              >
                <MessageSquare size={15} />
                <span>Comments</span>
              </button>

              <button
                onClick={() => setPanelTab("participants")}
                style={{
                  flex: 1, padding: "12px", borderRadius: 14, border: "none",
                  background: panelTab === "participants" ? "var(--bg-card)" : "transparent",
                  color: panelTab === "participants" ? "#6c63ff" : "var(--text-muted)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}
              >
                <Users size={15} />
                <span>Participants</span>
              </button>
            </div>

            {/* Content area: Comments or Participants (with full vertical scrolling) */}
            <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              
              {panelTab === "comments" ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                    {messages.map((msg, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, alignSelf: msg.self ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                        <span style={{ fontSize: 11.5, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>
                          {msg.user} • {msg.time}
                        </span>
                        <div style={{
                          padding: "10px 14px", borderRadius: 14,
                          background: msg.self ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "var(--bg-alt)",
                          color: msg.self ? "#fff" : "var(--text-main)",
                          fontSize: 13.5, fontFamily: "'Outfit', sans-serif", lineHeight: 1.45,
                          border: msg.self ? "none" : "1px solid var(--border-light)"
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Submission form */}
                  <form onSubmit={handleSend} style={{ display: "flex", gap: 8, marginTop: 12, borderTop: "1.5px solid var(--border-light)", paddingTop: 14 }}>
                    <input
                      type="text"
                      value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      placeholder="Ask the instructor a question..."
                      style={{
                        flex: 1, padding: "10px 14px", borderRadius: 12,
                        background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                        color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        width: 42, height: 42, borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                      }}
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </>
              ) : (
                /* Participants Roster List with detailed careers */
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, color: "var(--text-muted)", fontWeight: 800, marginBottom: 4 }}>
                    ACTIVE ATTENDEES ROSTER:
                  </div>
                  {PARTICIPANTS.map((part, i) => (
                    <div key={i} style={{
                      padding: 12, borderRadius: 12, background: "var(--bg-alt)",
                      border: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{part.avatar}</span>
                        <div>
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800, color: "var(--text-main)" }}>
                            {part.name}
                          </div>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {part.path}
                          </span>
                        </div>
                      </div>

                      <span style={{
                        padding: "2px 6px", borderRadius: 6,
                        background: part.status === "Active" ? "rgba(0, 201, 167, 0.12)" : "rgba(245, 158, 11, 0.12)",
                        color: part.status === "Active" ? "#00c9a7" : "#f59e0b",
                        fontSize: 10, fontFamily: "'Fira Code', monospace", fontWeight: 800
                      }}>
                        {part.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
