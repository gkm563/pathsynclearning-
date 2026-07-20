import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Briefcase, BookOpen, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles, Check, ShieldCheck } from "lucide-react";

const GoogleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const GithubIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const LinkedinIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0a66c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    tag: "Claim Your Free Career & Academic Roadmap",
    accent: "#6c63ff",
    bg: "rgba(108,99,255,0.12)",
    perks: ["AI Skill Graph Calibration", "Real-Time CRI Scoring", "Daily XP & Coding Streaks"]
  },
  {
    id: "teacher", 
    icon: <BookOpen size={24} />, 
    name: "Educator", 
    tag: "Set Up Your Academic Command Center",
    accent: "#f7971e",
    bg: "rgba(247,151,30,0.12)",
    perks: ["Classroom Skill Analytics", "Automated AI Evaluation", "Syllabus Progress Tracking"]
  },
  {
    id: "recruiter", 
    icon: <Briefcase size={24} />, 
    name: "Recruiter", 
    tag: "Access Verified Student Skill Pipeline",
    accent: "#00c9a7",
    bg: "rgba(0,201,167,0.12)",
    perks: ["Direct CRI Talent Search", "Zero Resume Screening", "Verified Student Resumes"]
  }
];

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Looping CRI Score 0 -> 78 -> 0 Animation
  const [criScore, setCriScore] = useState(0);

  useEffect(() => {
    let timer;
    let current = 0;
    const runAnimation = () => {
      timer = setInterval(() => {
        current += 1;
        if (current > 78) {
          clearInterval(timer);
          setTimeout(() => {
            current = 0;
            setCriScore(0);
            runAnimation();
          }, 2000);
        } else {
          setCriScore(current);
        }
      }, 40);
    };
    runAnimation();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const activeRole = ROLES.find(r => r.id === role);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || form.password.length < 6 || form.password !== form.confirm || !terms) {
      setError(true);
      setTimeout(() => setError(false), 600);
      return;
    }
    
    setLoading(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRegistered", "true");
        window.dispatchEvent(new Event("storage"));
        setTimeout(() => navigate('/platform'), 400);
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
          background: `radial-gradient(circle, ${activeRole.accent}18 0%, transparent 70%)`,
          pointerEvents: "none", zIndex: 0, filter: "blur(60px)"
        }}
      />

      {/* Premium Ambient Background Blobs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, 45, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: "-5%", top: "-10%", width: "50vw", height: "50vw", background: `radial-gradient(ellipse, ${activeRole.accent} 0%, transparent 60%)`, filter: "blur(100px)", opacity: 0.18 }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15], x: [0, -80, 0], y: [0, 80, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", right: "-10%", bottom: "-10%", width: "60vw", height: "60vw", background: `radial-gradient(ellipse, var(--purple) 0%, transparent 60%)`, filter: "blur(120px)", opacity: 0.12 }} 
        />
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(to right, var(--text-main) 1px, transparent 1px), linear-gradient(to bottom, var(--text-main) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Left Hero Column */}
      <div style={{ flex: "1 1 50%", display: "flex", flexDirection: "column", padding: "50px 60px", position: "relative", zIndex: 1, justifyContent: "space-between" }}>
        
        {/* Brand Header */}
        <Link to="/" style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)", textDecoration: "none", width: "fit-content" }}>
          Path<span style={{ color: activeRole.accent }}>Ed</span>
        </Link>
        
        <div style={{ maxWidth: 500, margin: "auto 0" }}>
          <motion.div 
            key={activeRole.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: activeRole.bg, border: `1px solid ${activeRole.accent}40`, padding: "6px 14px", borderRadius: 20, marginBottom: 20 }}>
              <Sparkles size={14} color={activeRole.accent} />
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: activeRole.accent, letterSpacing: 1 }}>
                CREATE FREE ACCOUNT
              </span>
            </div>

            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 3.8vw, 52px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16, color: "var(--text-main)" }}>
              Start your journey to <span style={{ color: activeRole.accent }}>mastery.</span>
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 18, marginBottom: 32, lineHeight: 1.6 }}>{activeRole.tag}</p>

            {/* Role Perks Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
              {activeRole.perks.map((perk, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: activeRole.bg, border: `1px solid ${activeRole.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={14} color={activeRole.accent} />
                  </div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: "var(--text-main)" }}>{perk}</span>
                </div>
              ))}
            </div>

            {/* Floating Live Animated CRI Preview Card (Looping 0 -> 78%) */}
            <motion.div 
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ display: "flex", alignItems: "center", gap: 20, background: "var(--bg-card)", border: `1.5px solid ${activeRole.accent}40`, padding: "16px 22px", borderRadius: 20, boxShadow: `0 12px 30px ${activeRole.accent}15` }}
            >
              <div style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="64" height="64" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-light)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={activeRole.accent} strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 - (264 * criScore) / 100} strokeLinecap="round" transform="rotate(-90 50 50)" />
                </svg>
                <span style={{ position: "absolute", fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-main)" }}>
                  {criScore}%
                </span>
              </div>
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: activeRole.accent, letterSpacing: 1.5, marginBottom: 2 }}>
                  LIVE CRI CALIBRATOR
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>
                  Career Readiness Index Progress
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "var(--text-muted)" }}>
                  Automated skill validation on sign-up
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* Footer Badge */}
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={16} color={activeRole.accent} /> Instant Setup • No Credit Card Required
        </div>
      </div>

      {/* Right Form Column */}
      <div style={{ flex: "1 1 50%", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", position: "relative", zIndex: 1 }}>
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", maxWidth: 480, background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: "40px", position: "relative", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}
        >
          {loading && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.1)" }}>
              <div style={{ height: "100%", background: activeRole.accent, width: `${progress}%`, transition: "width 0.3s ease" }} />
            </div>
          )}

          {/* Role Switcher */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "var(--bg-alt)", padding: 6, borderRadius: 16, border: "1px solid var(--border-light)" }}>
            {ROLES.map(r => (
              <button 
                key={r.id} 
                onClick={() => { setRole(r.id); setError(false); }}
                style={{ 
                  flex: 1, padding: "10px 6px", borderRadius: 12, border: "none", cursor: "pointer", 
                  background: role === r.id ? r.bg : "transparent",
                  color: role === r.id ? r.accent : "var(--text-muted)",
                  transition: "all 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  boxShadow: role === r.id ? `0 4px 12px ${r.accent}25` : "none"
                }}
              >
                {r.icon}
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{r.name}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, fontFamily: "'Fira Code', monospace", letterSpacing: 1 }}>FULL NAME</label>
              <input 
                type="text" 
                value={form.name}
                onChange={e => { setForm({...form, name: e.target.value}); setError(false); }}
                placeholder="Alex Morgan"
                style={{ width: "100%", padding: "12px 16px", background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 12, color: "var(--text-main)", fontSize: 15, outline: "none", transition: "all 0.3s" }}
                onFocus={(e) => { e.target.style.borderColor = activeRole.accent; e.target.style.boxShadow = `0 0 0 3px ${activeRole.accent}30`; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-light)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, fontFamily: "'Fira Code', monospace", letterSpacing: 1 }}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                value={form.email}
                onChange={e => { setForm({...form, email: e.target.value}); setError(false); }}
                placeholder="you@pathed.org"
                style={{ width: "100%", padding: "12px 16px", background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 12, color: "var(--text-main)", fontSize: 15, outline: "none", transition: "all 0.3s" }}
                onFocus={(e) => { e.target.style.borderColor = activeRole.accent; e.target.style.boxShadow = `0 0 0 3px ${activeRole.accent}30`; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-light)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, fontFamily: "'Fira Code', monospace", letterSpacing: 1 }}>PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={form.password}
                    onChange={e => { setForm({...form, password: e.target.value}); setError(false); }}
                    placeholder="••••••••"
                    style={{ width: "100%", padding: "12px 36px 12px 16px", background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 12, color: "var(--text-main)", fontSize: 15, outline: "none", transition: "all 0.3s" }}
                    onFocus={(e) => { e.target.style.borderColor = activeRole.accent; e.target.style.boxShadow = `0 0 0 3px ${activeRole.accent}30`; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border-light)"; e.target.style.boxShadow = "none"; }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, fontFamily: "'Fira Code', monospace", letterSpacing: 1 }}>CONFIRM</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={form.confirm}
                  onChange={e => { setForm({...form, confirm: e.target.value}); setError(false); }}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "12px 16px", background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 12, color: "var(--text-main)", fontSize: 15, outline: "none", transition: "all 0.3s" }}
                  onFocus={(e) => { e.target.style.borderColor = activeRole.accent; e.target.style.boxShadow = `0 0 0 3px ${activeRole.accent}30`; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border-light)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <input type="checkbox" id="terms" checked={terms} onChange={e => { setTerms(e.target.checked); setError(false); }} style={{ width: 16, height: 16, accentColor: activeRole.accent, cursor: "pointer" }} />
              <label htmlFor="terms" style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.4, cursor: "pointer" }}>
                I agree to the <Link to="/terms-of-service" style={{ color: activeRole.accent, fontWeight: 600 }}>Terms of Service</Link> and <Link to="/privacy-policy" style={{ color: activeRole.accent, fontWeight: 600 }}>Privacy Policy</Link>.
              </label>
            </div>

            {error && (
              <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={16} /> Please fill all fields correctly and agree to the terms.
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || !terms}
              style={{ width: "100%", padding: "15px", background: activeRole.accent, border: "none", borderRadius: 12, color: "#ffffff", fontSize: 16, fontWeight: 700, cursor: (!terms || loading) ? "not-allowed" : "pointer", opacity: (!terms || loading) ? 0.6 : 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, transition: "all 0.2s", boxShadow: `0 8px 24px ${activeRole.accent}40` }}
            >
              {loading ? "Creating Account..." : <>Create {activeRole.name} Account <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Social Logins Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "24px 0", gap: 16 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 600 }}>OR SIGN UP WITH</span>
            <div style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
          </div>

          {/* Social Login Buttons (Google, GitHub, LinkedIn) */}
          <div style={{ display: "flex", gap: 10 }}>
            <button 
              onClick={() => alert("Google Sign-Up initialised.")}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 10px", borderRadius: 12, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#4285F4"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(66,133,244,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <GoogleIcon size={18} /> Google
            </button>
            
            <button 
              onClick={() => alert("GitHub Sign-Up initialised.")}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 10px", borderRadius: 12, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-main)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <GithubIcon size={18} /> GitHub
            </button>

            <button 
              onClick={() => alert("LinkedIn Sign-Up initialised.")}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 10px", borderRadius: 12, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0a66c2"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(10,102,194,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <LinkedinIcon size={18} /> LinkedIn
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>
            Already have an account? <Link to="/login" style={{ color: activeRole.accent, textDecoration: "none", fontWeight: 700 }}>Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
