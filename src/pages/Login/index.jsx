import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Briefcase, BookOpen, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

const GithubIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const LinkedinIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const ROLES = [
  {
    id: "student", 
    icon: <GraduationCap size={24} />, 
    name: "Student", 
    tag: "Access Your Roadmap",
    accent: "#6c63ff",
    bg: "rgba(108,99,255,0.1)",
    features: [
      { title: "CRI Tracker Active", sub: "CAREER READINESS INDEX" },
      { title: "AI Roadmap Ready", sub: "SKILL PATHS" },
      { title: "XP Streaks On", sub: "DAILY CHALLENGES" },
    ]
  },
  {
    id: "teacher", 
    icon: <BookOpen size={24} />, 
    name: "Educator", 
    tag: "Enter Command Center",
    accent: "#f7971e",
    bg: "rgba(247,151,30,0.1)",
    features: [
      { title: "12,000+ Educators", sub: "ACTIVE TEACHERS" },
      { title: "Class Analytics", sub: "LIVE INSIGHTS" },
      { title: "AI Grader On", sub: "AUTO-ASSESSMENTS" },
    ]
  },
  {
    id: "recruiter", 
    icon: <Briefcase size={24} />, 
    name: "Recruiter", 
    tag: "Access Talent Portal",
    accent: "#00c9a7",
    bg: "rgba(0,201,167,0.1)",
    features: [
      { title: "500+ Companies", sub: "VERIFIED HIRING" },
      { title: "CRI-Verified Talent", sub: "SKILL-MATCHED" },
      { title: "Live Pipeline", sub: "REAL-TIME TRACKING" },
    ]
  }
];

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const activeRole = ROLES.find(r => r.id === role);

  const handleLogin = (e) => {
    e.preventDefault();
    if (form.identifier.length < 3 || form.password.length < 6) {
      setError(true);
      setTimeout(() => setError(false), 600);
      return;
    }
    
    setLoading(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => navigate(role === 'student' ? '/platform' : '/'), 400);
      }
    }, 300);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", display: "flex", fontFamily: "'Inter', sans-serif", color: "var(--text-main)", position: "relative", overflow: "hidden" }}>
      
      {/* Interactive Cursor Glow (Spotlight) */}
      <motion.div
        animate={{ x: mousePos.x - 400, y: mousePos.y - 400 }}
        transition={{ type: "tween", ease: "easeOut", duration: 0 }}
        style={{
          position: "absolute", width: 800, height: 800, borderRadius: "50%",
          background: `radial-gradient(circle, ${activeRole.accent}15 0%, transparent 70%)`,
          pointerEvents: "none", zIndex: 0, filter: "blur(60px)"
        }}
      />

      {/* Premium Glassmorphism Mesh Background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, 45, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: "-5%", top: "-10%", width: "50vw", height: "50vw", background: `radial-gradient(ellipse, ${activeRole.accent} 0%, transparent 60%)`, filter: "blur(100px)", opacity: 0.15 }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15], x: [0, 100, 0], y: [0, -100, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", right: "-10%", bottom: "-10%", width: "60vw", height: "60vw", background: `radial-gradient(ellipse, var(--purple) 0%, transparent 60%)`, filter: "blur(120px)", opacity: 0.1 }} 
        />
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(to right, var(--text-main) 1px, transparent 1px), linear-gradient(to bottom, var(--text-main) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Left Hero Column */}
      <div style={{ flex: "1 1 50%", display: "flex", flexDirection: "column", padding: "60px", position: "relative", zIndex: 1, justifyContent: "center" }}>
        <Link to="/" style={{ position: "absolute", top: 40, left: 40, fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", textDecoration: "none" }}>
          Path<span style={{ color: activeRole.accent }}>Ed</span>
        </Link>
        
        <div style={{ maxWidth: 440, margin: "0 auto" }}>
          <motion.div 
            key={activeRole.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(40px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
              Welcome back to your <span style={{ color: activeRole.accent }}>future.</span>
            </h1>
            <p style={{ color: "var(--text-light)", fontSize: 18, marginBottom: 48 }}>{activeRole.tag}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {activeRole.features.map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--bg-card)", border: "1px solid var(--border-light)", padding: "16px 20px", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                >
                  <div style={{ background: activeRole.bg, color: activeRole.accent, width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {activeRole.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>{f.title}</div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-light)", letterSpacing: 1 }}>{f.sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Form Column */}
      <div style={{ flex: "1 1 50%", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", position: "relative", zIndex: 1 }}>
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", maxWidth: 440, background: "var(--overlay-bg)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid var(--border-light)", borderRadius: 24, padding: 40, position: "relative", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
        >
          {loading && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.1)" }}>
              <div style={{ height: "100%", background: activeRole.accent, width: `${progress}%`, transition: "width 0.3s ease" }} />
            </div>
          )}

          {/* Role Switcher */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32, background: "var(--bg-main)", padding: 8, borderRadius: 16, border: "1px solid var(--border-light)" }}>
            {ROLES.map(r => (
              <button 
                key={r.id} 
                onClick={() => { setRole(r.id); setError(false); }}
                style={{ 
                  flex: 1, padding: "12px 8px", borderRadius: 12, border: "none", cursor: "pointer", 
                  background: role === r.id ? r.bg : "transparent",
                  color: role === r.id ? r.accent : "#6b7280",
                  transition: "all 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 4
                }}
              >
                {r.icon}
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{r.name}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-light)", marginBottom: 8, fontFamily: "'Fira Code', monospace" }}>EMAIL OR USERNAME</label>
              <input 
                type="text" 
                value={form.identifier}
                onChange={e => { setForm({...form, identifier: e.target.value}); setError(false); }}
                style={{ width: "100%", padding: "16px 20px", background: "var(--bg-alt)", border: `1px solid ${error ? "#ef4444" : "var(--border-light)"}`, borderRadius: 12, color: "var(--text-main)", fontSize: 16, outline: "none", transition: "all 0.3s" }}
                onFocus={(e) => { e.target.style.borderColor = activeRole.accent; e.target.style.boxShadow = `0 0 0 3px ${activeRole.accent}40`; }}
                onBlur={(e) => { e.target.style.borderColor = error ? "#ef4444" : "var(--border-light)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-light)", marginBottom: 8, fontFamily: "'Fira Code', monospace" }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={form.password}
                  onChange={e => { setForm({...form, password: e.target.value}); setError(false); }}
                  style={{ width: "100%", padding: "16px 48px 16px 20px", background: "var(--bg-alt)", border: `1px solid ${error ? "#ef4444" : "var(--border-light)"}`, borderRadius: 12, color: "var(--text-main)", fontSize: 16, outline: "none", transition: "all 0.3s" }}
                  onFocus={(e) => { e.target.style.borderColor = activeRole.accent; e.target.style.boxShadow = `0 0 0 3px ${activeRole.accent}40`; }}
                  onBlur={(e) => { e.target.style.borderColor = error ? "#ef4444" : "var(--border-light)"; e.target.style.boxShadow = "none"; }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ color: "#ef4444", fontSize: 14, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={16} /> Invalid credentials. Please try again.
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: 16, background: activeRole.accent, border: "none", borderRadius: 12, color: "var(--bg-card)", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, transition: "opacity 0.3s" }}
            >
              {loading ? "Authenticating..." : <>Sign In <ArrowRight size={20} /></>}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", margin: "32px 0", gap: 16 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ color: "#6b7280", fontSize: 14 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--bg-card)", fontWeight: 600, transition: "all 0.2s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
              <GithubIcon size={20} /> GitHub
            </button>
            <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--bg-card)", fontWeight: 600, transition: "all 0.2s", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
              <LinkedinIcon size={20} /> LinkedIn
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 32, fontSize: 14, color: "var(--text-light)" }}>
            Don't have an account? <Link to="/register" style={{ color: activeRole.accent, textDecoration: "none", fontWeight: 700 }}>Create one</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
