import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip } from "../../components/ui/Shared";

export default function ApiReference() {
  const fadeInUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      <Header />
      
      <div style={{ display: "flex", paddingTop: 100, minHeight: "100vh" }}>
        {/* Sidebar */}
        <aside style={{ width: 280, borderRight: "1px solid rgba(255,255,255,0.1)", padding: "40px 32px", display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 100, height: "calc(100vh - 100px)", overflowY: "auto" }}>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>API Endpoints</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <li><a href="#authentication" style={{ color: "#00c9a7", fontWeight: 600, textDecoration: "none" }}>Authentication</a></li>
              <li><a href="#users" style={{ color: "#d1d5db", textDecoration: "none" }}>Users</a></li>
              <li><a href="#cri-scores" style={{ color: "#d1d5db", textDecoration: "none" }}>CRI Scores</a></li>
              <li><a href="#skill-trees" style={{ color: "#d1d5db", textDecoration: "none" }}>Skill Trees</a></li>
            </ul>
          </div>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: "60px 80px", maxWidth: 1000, scrollBehavior: "smooth" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="rgba(0,201,167,0.1)" border="rgba(0,201,167,0.3)" color="#00c9a7">v1.0.0 STABLE</Chip>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, marginTop: 24, marginBottom: 24 }}>
              API Reference
            </h1>
            <p style={{ fontSize: 18, color: "#9ca3af", lineHeight: 1.8, marginBottom: 48 }}>
              Integrate PathEd's career readiness data directly into your corporate HR systems or university dashboards using our robust REST API.
            </p>

            {/* AUTHENTICATION */}
            <section id="authentication" style={{ paddingTop: 24, marginBottom: 48 }}>
              <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ background: "#1677ff", color: "#fff", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>POST</span>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 16, color: "#d1d5db" }}>/api/v1/auth/token</span>
                </div>
                <div style={{ padding: 32 }}>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Authentication</h4>
                  <p style={{ color: "#9ca3af", lineHeight: 1.6, marginBottom: 24 }}>Exchange your client credentials for a Bearer token to authorize subsequent API requests.</p>
                  
                  <div style={{ background: "#1a1a2e", borderRadius: 8, padding: 20, fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#b2aeff" }}>
                    <span style={{ color: "#666" }}>// Request body</span><br/>
                    {'{'}<br/>
                    &nbsp;&nbsp;"client_id": "string",<br/>
                    &nbsp;&nbsp;"client_secret": "string"<br/>
                    {'}'}
                  </div>
                </div>
              </div>
            </section>

            {/* USERS */}
            <section id="users" style={{ paddingTop: 80, marginTop: -80, marginBottom: 48 }}>
              <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ background: "#00c9a7", color: "#fff", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>GET</span>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 16, color: "#d1d5db" }}>/api/v1/users/{'{uid}'}</span>
                </div>
                <div style={{ padding: 32 }}>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Retrieve User Data</h4>
                  <p style={{ color: "#9ca3af", lineHeight: 1.6, marginBottom: 24 }}>Fetch a student's public profile and metadata. Only accessible if the user has opted into the hiring network.</p>
                  
                  <div style={{ background: "#1a1a2e", borderRadius: 8, padding: 20, fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#00c9a7" }}>
                    <span style={{ color: "#666" }}>// Response</span><br/>
                    {'{'}<br/>
                    &nbsp;&nbsp;"uid": "user_123xyz",<br/>
                    &nbsp;&nbsp;"name": "Alex Chen",<br/>
                    &nbsp;&nbsp;"role_target": "Backend Engineer"<br/>
                    {'}'}
                  </div>
                </div>
              </div>
            </section>

            {/* CRI SCORES */}
            <section id="cri-scores" style={{ paddingTop: 80, marginTop: -80, marginBottom: 48 }}>
              <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ background: "#00c9a7", color: "#fff", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>GET</span>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 16, color: "#d1d5db" }}>/api/v1/users/{'{uid}'}/cri</span>
                </div>
                <div style={{ padding: 32 }}>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Retrieve CRI Score</h4>
                  <p style={{ color: "#9ca3af", lineHeight: 1.6, marginBottom: 24 }}>Fetch the latest Career Readiness Index score and breakdown for a specific authenticated user.</p>
                  
                  <div style={{ background: "#1a1a2e", borderRadius: 8, padding: 20, fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#00c9a7" }}>
                    <span style={{ color: "#666" }}>// Response</span><br/>
                    {'{'}<br/>
                    &nbsp;&nbsp;"uid": "user_123xyz",<br/>
                    &nbsp;&nbsp;"cri_score": 84.5,<br/>
                    &nbsp;&nbsp;"percentile": 92,<br/>
                    &nbsp;&nbsp;"last_updated": "2026-07-19T12:00:00Z"<br/>
                    {'}'}
                  </div>
                </div>
              </div>
            </section>

            {/* SKILL TREES */}
            <section id="skill-trees" style={{ paddingTop: 80, marginTop: -80, marginBottom: 48 }}>
              <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ background: "#00c9a7", color: "#fff", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>GET</span>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 16, color: "#d1d5db" }}>/api/v1/users/{'{uid}'}/skills</span>
                </div>
                <div style={{ padding: 32 }}>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Retrieve Skill Graph</h4>
                  <p style={{ color: "#9ca3af", lineHeight: 1.6, marginBottom: 24 }}>Fetch the user's completed skill nodes and their proficiency level in each.</p>
                  
                  <div style={{ background: "#1a1a2e", borderRadius: 8, padding: 20, fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#00c9a7" }}>
                    <span style={{ color: "#666" }}>// Response</span><br/>
                    {'{'}<br/>
                    &nbsp;&nbsp;"nodes_unlocked": 14,<br/>
                    &nbsp;&nbsp;"top_skills": ["Node.js", "PostgreSQL", "Redis"]<br/>
                    {'}'}
                  </div>
                </div>
              </div>
            </section>

          </motion.div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
