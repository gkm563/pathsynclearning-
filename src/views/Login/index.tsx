"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { GraduationCap, Briefcase, BookOpen, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

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
    tag: "Access Your AI Roadmap & Skill Graph",
    accent: "#6c63ff",
    bg: "rgba(108,99,255,0.12)",
    features: [
      { title: "Skill Decay Protection", sub: "98% KNOWLEDGE RETENTION" },
      { title: "AI-Calibrated Skill Graph", sub: "GOOGLE & MICROSOFT READY" },
      { title: "CRI Readiness Tracker", sub: "REAL-TIME SCORING" },
    ]
  },
  {
    id: "teacher", 
    icon: <BookOpen size={24} />, 
    name: "Educator", 
    tag: "Enter Educator Command Center",
    accent: "#f7971e",
    bg: "rgba(247,151,30,0.12)",
    features: [
      { title: "12,000+ Classrooms Connected", sub: "ACTIVE ACADEMICS" },
      { title: "Automated AI Evaluator", sub: "SUBMISSION ANALYTICS" },
      { title: "Real-Time Student Heatmap", sub: "SKILL GAP MONITORING" },
    ]
  },
  {
    id: "recruiter", 
    icon: <Briefcase size={24} />, 
    name: "Recruiter", 
    tag: "Access Verified Talent Portal",
    accent: "#00c9a7",
    bg: "rgba(0,201,167,0.12)",
    features: [
      { title: "500+ Hiring Partners", sub: "VERIFIED SKILL RESUMES" },
      { title: "Zero-Resume Friction", sub: "DIRECT CRI SCORED CANDIDATES" },
      { title: "Pipeline Intelligence", sub: "REAL-TIME MATCHING" },
    ]
  }
];

const getEyeIconColor = (pwd) => {
  if (!pwd) return "var(--text-muted)";
  if (pwd.length < 6) return "#ef4444"; // Less secure (Red)
  const hasLetters = /[a-zA-Z]/.test(pwd);
  const hasNumbers = /[0-9]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  if (pwd.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
    return "#10b981"; // Highly secure (Green)
  }
  if (pwd.length >= 6 && ((hasLetters && hasNumbers) || (hasLetters && hasSpecial) || (hasNumbers && hasSpecial))) {
    return "#eab308"; // More secure (Yellow)
  }
  return "#ef4444"; // Weak (Red)
};

export default function Login() {
  const router = useRouter();
  const { signIn, errors } = useSignIn();
  const { isLoaded } = useAuth();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
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

  const validateLoginForm = (currentForm = form) => {
    if (!currentForm.identifier.trim()) {
      return "Email or username is required.";
    }
    if (currentForm.identifier.trim().length < 3) {
      return "Email or username must be at least 3 characters.";
    }
    if (!currentForm.password) {
      return "Password is required.";
    }
    if (currentForm.password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    return "";
  };

  const markLocalSession = async () => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userRegistered", "true");
    localStorage.setItem("pathEdRole", role);
    window.dispatchEvent(new Event("storage"));
    try {
      await fetch("/api/me", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    } catch {
      // DB sync is best-effort; auth still succeeds
    }
  };

  const navigateAfterAuth = async (decorateUrl: (path: string) => string, destination: string) => {
    await markLocalSession();
    const url = decorateUrl(destination);
    if (url.startsWith("http")) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };

  const clerkErrorMessage = (fallback = "Sign in failed. Please try again.") => {
    return (
      errors?.fields?.identifier?.message ||
      errors?.fields?.password?.message ||
      errors?.global?.[0]?.message ||
      fallback
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errorMsg = validateLoginForm();
    if (errorMsg) {
      setErrorMessage(errorMsg);
      return;
    }
    if (!isLoaded || !signIn) {
      setErrorMessage("Authentication is still loading. Please try again.");
      return;
    }

    setErrorMessage("");
    setLoading(true);
    setProgress(25);

    try {
      const { error } = await signIn.password({
        identifier: form.identifier.trim(),
        password: form.password,
      });
      setProgress(70);

      if (error) {
        setErrorMessage(error.message || clerkErrorMessage());
        setLoading(false);
        setProgress(0);
        return;
      }

      if (signIn.status === "complete") {
        setProgress(100);
        await signIn.finalize({
          navigate: async ({ decorateUrl }) => {
            await navigateAfterAuth(decorateUrl, role === "student" ? "/dashboard" : "/");
          },
        });
        return;
      }

      setErrorMessage(
        signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust"
          ? "Additional verification is required for this account."
          : clerkErrorMessage("Unable to complete sign in."),
      );
      setLoading(false);
      setProgress(0);
    } catch (err: any) {
      setErrorMessage(err?.errors?.[0]?.message || err?.message || clerkErrorMessage());
      setLoading(false);
      setProgress(0);
    }
  };

  const handleOAuth = async (strategy: "oauth_google" | "oauth_github" | "oauth_linkedin") => {
    if (!isLoaded || !signIn) {
      setErrorMessage("Authentication is still loading. Please try again.");
      return;
    }
    setErrorMessage("");
    setLoading(true);
    setProgress(40);
    sessionStorage.setItem("pathEdRole", role);
    sessionStorage.setItem("pathEdAuthIntent", "login");
    try {
      const { error } = await signIn.sso({
        strategy,
        redirectUrl: role === "student" ? "/dashboard" : "/",
        redirectCallbackUrl: "/sso-callback",
      });
      if (error) {
        setErrorMessage(error.message || `Could not start ${strategy.replace("oauth_", "")} sign-in.`);
        setLoading(false);
        setProgress(0);
      }
    } catch (err: any) {
      setErrorMessage(err?.errors?.[0]?.message || err?.message || "Social sign-in failed.");
      setLoading(false);
      setProgress(0);
    }
  };

  const handleInputChange = (field, value) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    if (errorMessage) {
      setErrorMessage(validateLoginForm(updatedForm));
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", display: "flex", fontFamily: "'Inter', sans-serif", color: "var(--text-main)", position: "relative", overflow: "hidden" }}>
      
      {/* Full-screen Loading Background Animation Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 999,
              background: `radial-gradient(circle at center, ${activeRole.accent}25 0%, var(--bg-main) 85%)`,
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
            }}
          >
            {/* Animated Expanding Radar Pulse Rings */}
            <motion.div
              animate={{ scale: [0.8, 1.8, 2.4], opacity: [0.6, 0.2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: `2px solid ${activeRole.accent}` }}
            />
            <motion.div
              animate={{ scale: [0.8, 1.8, 2.4], opacity: [0.6, 0.2, 0] }}
              transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: "easeOut" }}
              style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: `2px solid ${activeRole.accent}` }}
            />

            {/* Glowing Icon Container */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{
                width: 100, height: 100, borderRadius: 28,
                background: `linear-gradient(135deg, ${activeRole.accent}, ${activeRole.accent}88)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 50px ${activeRole.accent}88`, color: "#ffffff", marginBottom: 28
              }}
            >
              {activeRole.icon}
            </motion.div>

            {/* Authenticating Text */}
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>
              Authenticating {activeRole.name} Account...
            </h2>
            <p style={{ color: activeRole.accent, fontFamily: "'Fira Code', monospace", fontSize: 14, fontWeight: 700, letterSpacing: 1, marginBottom: 24 }}>
              SECURE ENCRYPTED HANDSHAKE
            </p>

            {/* Loading Progress Bar Container */}
            <div style={{ width: 300, height: 8, background: "var(--bg-alt)", borderRadius: 4, overflow: "hidden", border: "1px solid var(--border-light)", boxShadow: `0 0 20px ${activeRole.accent}30` }}>
              <motion.div
                style={{ height: "100%", background: activeRole.accent, width: `${progress}%`, borderRadius: 4, transition: "width 0.3s ease" }}
              />
            </div>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 700, color: "var(--text-main)", marginTop: 12 }}>
              {progress}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
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
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, 45, 0] }} 
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: "-5%", top: "-10%", width: "50vw", height: "50vw", background: `radial-gradient(ellipse, ${activeRole.accent} 0%, transparent 60%)`, filter: "blur(100px)", opacity: 0.18 }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15], x: [0, 80, 0], y: [0, -80, 0] }} 
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", right: "-10%", bottom: "-10%", width: "60vw", height: "60vw", background: `radial-gradient(ellipse, #00c9a7 0%, transparent 60%)`, filter: "blur(120px)", opacity: 0.12 }} 
        />
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(to right, var(--text-main) 1px, transparent 1px), linear-gradient(to bottom, var(--text-main) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Left Hero Column */}
      <div style={{ flex: "1 1 50%", display: "flex", flexDirection: "column", padding: "16px 60px 20px", position: "relative", zIndex: 1, justifyContent: "flex-start" }}>
        
        {/* Brand Header */}
        <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontSize: 46, fontWeight: 800, color: "var(--text-main)", textDecoration: "none", width: "fit-content", marginBottom: 14 }}>
          Path<span style={{ color: activeRole.accent }}>Ed</span>
        </Link>
        
        <div style={{ maxWidth: 500, margin: "0 0 16px" }}>
          <motion.div 
            key={activeRole.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: activeRole.bg, border: `1px solid ${activeRole.accent}40`, padding: "6px 14px", borderRadius: 20, marginBottom: 20 }}>
              <Sparkles size={14} color={activeRole.accent} />
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: activeRole.accent, letterSpacing: 1 }}>
                ROLE MODE ACTIVE
              </span>
            </div>

            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 3.8vw, 52px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16, color: "var(--text-main)" }}>
              Welcome back to your <span style={{ color: activeRole.accent }}>future.</span>
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 18, marginBottom: 36, lineHeight: 1.6 }}>{activeRole.tag}</p>

            {/* Role Features List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
              {activeRole.features.map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 6, transition: { type: "spring", stiffness: 300 } }}
                  style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--bg-card)", border: "1.5px solid var(--border-light)", padding: "14px 18px", borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.04)" }}
                >
                  <div style={{ background: activeRole.bg, color: activeRole.accent, width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {activeRole.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>{f.title}</div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, fontWeight: 600 }}>{f.sub}</div>
                  </div>
                </motion.div>
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
                  Career Readiness Index Score
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "var(--text-muted)" }}>
                  Real-time algorithmic skill evaluation
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* Footer Badge */}
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={16} color={activeRole.accent} /> 256-Bit Encrypted Platform Authentication
        </div>
      </div>

      {/* Right Form Column */}
      <div style={{ flex: "1 1 50%", display: "flex", alignItems: "center", justifyContent: "center", padding: "30px 40px", position: "relative", zIndex: 1 }}>
        <motion.div 
          animate={errorMessage ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", maxWidth: 460, background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: "40px", position: "relative", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.08)" }}
        >
          {/* Role Switcher */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32, background: "var(--bg-alt)", padding: 6, borderRadius: 16, border: "1px solid var(--border-light)" }}>
            {ROLES.map(r => (
              <button 
                key={r.id} 
                onClick={() => { setRole(r.id); setErrorMessage(""); }}
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

          {/* Persistent Field-Specific Error Message Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                style={{
                  background: "rgba(239,68,68,0.1)", border: "1.5px solid #ef4444", borderRadius: 12,
                  padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                  color: "#ef4444", fontSize: 13, fontWeight: 600, overflow: "hidden"
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, fontFamily: "'Fira Code', monospace", letterSpacing: 1 }}>EMAIL OR USERNAME</label>
              <input 
                type="text" 
                value={form.identifier}
                onChange={e => handleInputChange("identifier", e.target.value)}
                placeholder="you@pathed.org"
                style={{ width: "100%", padding: "14px 18px", background: "var(--bg-alt)", border: `1.5px solid ${errorMessage && (!form.identifier.trim() || form.identifier.trim().length < 3) ? "#ef4444" : "var(--border-light)"}`, borderRadius: 12, color: "var(--text-main)", fontSize: 15, outline: "none", transition: "all 0.3s" }}
                onFocus={(e) => { e.target.style.borderColor = activeRole.accent; e.target.style.boxShadow = `0 0 0 3px ${activeRole.accent}30`; }}
                onBlur={(e) => { e.target.style.borderColor = errorMessage && (!form.identifier.trim() || form.identifier.trim().length < 3) ? "#ef4444" : "var(--border-light)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace", letterSpacing: 1 }}>PASSWORD</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to your registered email."); }} style={{ fontSize: 12, color: activeRole.accent, textDecoration: "none", fontWeight: 600 }}>Forgot?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={form.password}
                  onChange={e => handleInputChange("password", e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "14px 48px 14px 18px", background: "var(--bg-alt)", border: `1.5px solid ${errorMessage && (!form.password || form.password.length < 6) ? "#ef4444" : "var(--border-light)"}`, borderRadius: 12, color: "var(--text-main)", fontSize: 15, outline: "none", transition: "all 0.3s" }}
                  onFocus={(e) => { e.target.style.borderColor = activeRole.accent; e.target.style.boxShadow = `0 0 0 3px ${activeRole.accent}30`; }}
                  onBlur={(e) => { e.target.style.borderColor = errorMessage && (!form.password || form.password.length < 6) ? "#ef4444" : "var(--border-light)"; e.target.style.boxShadow = "none"; }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: getEyeIconColor(form.password), cursor: "pointer", transition: "all 0.3s ease", filter: form.password ? `drop-shadow(0 0 6px ${getEyeIconColor(form.password)}88)` : "none" }}
                  title={!form.password ? "Enter password" : form.password.length < 6 ? "Weak Security (Red)" : getEyeIconColor(form.password) === "#10b981" ? "High Security (Green)" : "Medium Security (Yellow)"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "16px", background: activeRole.accent, border: "none", borderRadius: 12, color: "#ffffff", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, transition: "transform 0.2s, boxShadow 0.2s", boxShadow: `0 8px 24px ${activeRole.accent}40` }}
            >
              {loading ? "Authenticating..." : <>Sign In to {activeRole.name} <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Social Logins Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "28px 0", gap: 16 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 600 }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
          </div>

          {/* Social Login Buttons (Google, GitHub, LinkedIn) */}
          <div style={{ display: "flex", gap: 10 }}>
            <button 
              type="button"
              onClick={() => handleOAuth("oauth_google")}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 10px", borderRadius: 12, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#4285F4"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(66,133,244,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <GoogleIcon size={18} /> Google
            </button>
            
            <button 
              type="button"
              onClick={() => handleOAuth("oauth_github")}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 10px", borderRadius: 12, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-main)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <GithubIcon size={18} /> GitHub
            </button>

            <button 
              type="button"
              onClick={() => handleOAuth("oauth_linkedin")}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 10px", borderRadius: 12, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0a66c2"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(10,102,194,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <LinkedinIcon size={18} /> LinkedIn
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "var(--text-muted)" }}>
            Don't have an account? <Link href="/register" style={{ color: activeRole.accent, textDecoration: "none", fontWeight: 700 }}>Create one</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
