import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Briefcase, BookOpen, Eye, EyeOff, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";

const ROLES = [
  {
    id: "student", 
    icon: <GraduationCap size={24} />, 
    name: "Student", 
    tag: "Learn & Track Progress",
    accent: "#6c63ff",
    bg: "rgba(108,99,255,0.1)",
    features: [
      { title: "40,000+ Students", sub: "ACTIVE LEARNERS" },
      { title: "95% Placement Rate", sub: "TOP COMPANIES" },
      { title: "500+ Companies", sub: "HIRING PARTNERS" },
    ]
  },
  {
    id: "teacher", 
    icon: <BookOpen size={24} />, 
    name: "Educator", 
    tag: "Manage Classes & Engage",
    accent: "#f7971e",
    bg: "rgba(247,151,30,0.1)",
    features: [
      { title: "12,000+ Educators", sub: "ACTIVE TEACHERS" },
      { title: "94% Avg Placement", sub: "COHORT OUTCOMES" },
      { title: "2M+ AI Insights", sub: "GENERATED DAILY" },
    ]
  },
  {
    id: "recruiter", 
    icon: <Briefcase size={24} />, 
    name: "Recruiter", 
    tag: "Find Talent & Post Jobs",
    accent: "#00c9a7",
    bg: "rgba(0,201,167,0.1)",
    features: [
      { title: "500+ Companies", sub: "VERIFIED HIRING" },
      { title: "CRI-Verified Talent", sub: "SKILL-MATCHED" },
      { title: "Real-Time Pipeline", sub: "LIVE TRACKING" },
    ]
  }
];

// Password strength component
function PasswordStrength({ password, accent }) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  const colors = ["#ef4444", "#f59e0b", "#10b981", "#10b981"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? colors[Math.min(score - 1, 3)] : "rgba(255,255,255,0.1)", transition: "all 0.3s" }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: score > 0 ? colors[Math.min(score - 1, 3)] : "#6b7280", fontFamily: "'Fira Code', monospace", textAlign: "right", height: 16 }}>
        {score > 0 ? labels[Math.min(score - 1, 3)] : ""}
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const activeRole = ROLES.find(r => r.id === role);

  // Validation
  const validUsername = form.username.length >= 3;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const validPassword = form.password.length >= 6;
  const validConfirm = form.confirm === form.password && form.password.length > 0;
  
  // Progress calculation
  let progress = 0;
  if (validUsername) progress += 25;
  if (validEmail) progress += 25;
  if (validPassword) progress += 25;
  if (validConfirm) progress += 25;

  const handleRegister = (e) => {
    e.preventDefault();
    if (progress < 100 || !terms) {
      setError(true);
      setTimeout(() => setError(false), 600);
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    }, 1500);
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", color: "#fff" }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center" }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: activeRole.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", color: activeRole.accent }}>
            <ShieldCheck size={48} />
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Account Created!</h1>
          <p style={{ color: "#9ca3af", fontSize: 18, marginBottom: 32 }}>Redirecting you to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", fontFamily: "'Inter', sans-serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      {/* Animated Background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: "-10%", top: "-10%", width: 600, height: 600, background: `radial-gradient(circle, ${activeRole.accent} 0%, transparent 70%)`, filter: "blur(60px)" }} 
        />
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Left Hero Column */}
      <div style={{ flex: "1 1 50%", display: "flex", flexDirection: "column", padding: "60px", position: "relative", zIndex: 1, justifyContent: "center" }}>
        <Link to="/" style={{ position: "absolute", top: 40, left: 40, fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", textDecoration: "none" }}>
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
              Join the <span style={{ color: activeRole.accent }}>revolution.</span>
            </h1>
            <p style={{ color: "#9ca3af", fontSize: 18, marginBottom: 48 }}>{activeRole.tag}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {activeRole.features.map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", padding: "16px 20px", borderRadius: 16 }}
                >
                  <div style={{ background: activeRole.bg, color: activeRole.accent, width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "#fff" }}>{f.title}</div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#9ca3af", letterSpacing: 1 }}>{f.sub}</div>
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
          style={{ width: "100%", maxWidth: 480, background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 40, position: "relative", overflow: "hidden" }}
        >
          {/* Progress Bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.1)" }}>
            <div style={{ height: "100%", background: activeRole.accent, width: `${progress}%`, transition: "width 0.3s ease" }} />
          </div>

          {/* Role Switcher */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32, background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: 16 }}>
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

          <form onSubmit={handleRegister}>
            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 8, fontFamily: "'Fira Code', monospace" }}>USERNAME</label>
                <input 
                  type="text" 
                  value={form.username}
                  onChange={e => { setForm({...form, username: e.target.value}); setError(false); }}
                  style={{ width: "100%", padding: "14px 16px", background: "rgba(0,0,0,0.2)", border: `1px solid ${validUsername ? "#10b981" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", transition: "border 0.3s" }}
                  onFocus={(e) => e.target.style.borderColor = activeRole.accent}
                  onBlur={(e) => e.target.style.borderColor = validUsername ? "#10b981" : "rgba(255,255,255,0.1)"}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 8, fontFamily: "'Fira Code', monospace" }}>EMAIL</label>
                <input 
                  type="email" 
                  value={form.email}
                  onChange={e => { setForm({...form, email: e.target.value}); setError(false); }}
                  style={{ width: "100%", padding: "14px 16px", background: "rgba(0,0,0,0.2)", border: `1px solid ${validEmail ? "#10b981" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", transition: "border 0.3s" }}
                  onFocus={(e) => e.target.style.borderColor = activeRole.accent}
                  onBlur={(e) => e.target.style.borderColor = validEmail ? "#10b981" : "rgba(255,255,255,0.1)"}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 8, fontFamily: "'Fira Code', monospace" }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={form.password}
                  onChange={e => { setForm({...form, password: e.target.value}); setError(false); }}
                  style={{ width: "100%", padding: "14px 48px 14px 16px", background: "rgba(0,0,0,0.2)", border: `1px solid ${validPassword ? "#10b981" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", transition: "border 0.3s" }}
                  onFocus={(e) => e.target.style.borderColor = activeRole.accent}
                  onBlur={(e) => e.target.style.borderColor = validPassword ? "#10b981" : "rgba(255,255,255,0.1)"}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <PasswordStrength password={form.password} accent={activeRole.accent} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 8, fontFamily: "'Fira Code', monospace" }}>CONFIRM PASSWORD</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={form.confirm}
                onChange={e => { setForm({...form, confirm: e.target.value}); setError(false); }}
                style={{ width: "100%", padding: "14px 16px", background: "rgba(0,0,0,0.2)", border: `1px solid ${validConfirm ? "#10b981" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", transition: "border 0.3s" }}
                onFocus={(e) => e.target.style.borderColor = activeRole.accent}
                onBlur={(e) => e.target.style.borderColor = validConfirm ? "#10b981" : "rgba(255,255,255,0.1)"}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 32 }}>
              <input type="checkbox" id="terms" checked={terms} onChange={e => { setTerms(e.target.checked); setError(false); }} style={{ marginTop: 4, width: 16, height: 16, accentColor: activeRole.accent }} />
              <label htmlFor="terms" style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.5 }}>
                I agree to the <Link to="/terms-of-service" style={{ color: activeRole.accent }}>Terms of Service</Link> and <Link to="/privacy-policy" style={{ color: activeRole.accent }}>Privacy Policy</Link>.
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading || progress < 100 || !terms}
              style={{ width: "100%", padding: 16, background: activeRole.accent, border: "none", borderRadius: 12, color: "#fff", fontSize: 16, fontWeight: 700, cursor: (loading || progress < 100 || !terms) ? "not-allowed" : "pointer", opacity: (progress === 100 && terms) ? 1 : 0.5, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, transition: "all 0.3s" }}
            >
              {loading ? "Creating Account..." : <>Create Account <ArrowRight size={20} /></>}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 32, fontSize: 14, color: "#9ca3af" }}>
            Already have an account? <Link to="/login" style={{ color: activeRole.accent, textDecoration: "none", fontWeight: 700 }}>Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
