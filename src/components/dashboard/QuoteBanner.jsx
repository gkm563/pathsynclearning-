import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote, Sparkles, RefreshCw } from "lucide-react";
import quotesData from "../../data/quotes_dataset.json";

export default function QuoteBanner({ userLevel = 1, userStreak = 7 }) {
  const [quote, setQuote] = useState({ text: "The secret of getting ahead is getting started.", author: "Mark Twain", phase: "motivation" });
  const [loading, setLoading] = useState(false);

  // Determine user experience phase
  const getPhase = () => {
    if (userLevel <= 2) return "motivation"; // Beginner
    if (userLevel <= 5) return "pushing";    // Intermediate
    return "determination";                  // Advanced
  };

  const currentPhase = getPhase();

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY") {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Generate a single short inspirational coding quote for a software engineering student in the ${currentPhase} phase. Return JSON: {"text": "quote text", "author": "Author Name"}`
                }]
              }]
            })
          }
        );
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
          if (parsed.text && parsed.author) {
            setQuote({ text: parsed.text, author: parsed.author, phase: currentPhase });
            setLoading(false);
            return;
          }
        }
      }
    } catch (e) {
      // Fallback to local dataset
    }

    // Local Dataset Fallback: 180-day non-repeat algorithm
    const phaseQuotes = quotesData.filter(q => q.phase === currentPhase);
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const quoteIndex = dayOfYear % phaseQuotes.length;

    setQuote(phaseQuotes[quoteIndex] || phaseQuotes[0]);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuote();
  }, [userLevel]);

  const getPhaseTitle = () => {
    if (currentPhase === "motivation") return "PHASE 1 · DAILY MOTIVATION";
    if (currentPhase === "pushing") return "PHASE 2 · DAILY PUSH";
    return "PHASE 3 · DETERMINATION & MASTERY";
  };

  const getPhaseColor = () => {
    if (currentPhase === "motivation") return "#6c63ff";
    if (currentPhase === "pushing") return "#f7971e";
    return "#00c9a7";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: `linear-gradient(135deg, ${getPhaseColor()}12, var(--bg-card))`,
        border: `1.5px solid ${getPhaseColor()}35`,
        borderRadius: 22, padding: "26px 32px", marginBottom: 32,
        position: "relative", overflow: "hidden",
        boxShadow: `0 8px 30px ${getPhaseColor()}10`
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={18} color={getPhaseColor()} />
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800, color: getPhaseColor(), letterSpacing: 1.5 }}>
            {getPhaseTitle()}
          </span>
        </div>

        <button
          onClick={fetchQuote}
          disabled={loading}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, opacity: loading ? 0.5 : 1 }}
          title="Refresh Daily AI Quote"
        >
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          <span>New Quote</span>
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
        <Quote size={36} color={getPhaseColor()} style={{ opacity: 0.6, flexShrink: 0, marginTop: 4 }} />
        <div>
          {/* Increased Quote Text Size to 24px Bold as Requested */}
          <blockquote style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", lineHeight: 1.4, margin: "0 0 10px" }}>
            "{quote.text}"
          </blockquote>
          <cite style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-muted)", fontStyle: "normal" }}>
            — {quote.author}
          </cite>
        </div>
      </div>
    </motion.div>
  );
}
