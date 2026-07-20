import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Lock, Sparkles, Check, ShieldCheck } from "lucide-react";

export default function Store() {
  const navigate = useNavigate();

  const storeItems = [
    { title: "Industry Mentorship Pass", category: "Community Pass", price: "1,500 Coins", icon: "🤝", desc: "Unlock 1-on-1 monthly sessions with senior engineers from Tier-1 tech firms." },
    { title: "Hack Squad Leader Badge", category: "Competitive Unlocks", price: "2,000 Coins", icon: "⚔️", desc: "Form and lead your own hackathon team with priority recruitment matching." },
    { title: "Alumni Network VIP Access", category: "Placement Network", price: "2,500 Coins", icon: "🌐", desc: "Direct referral channel to 500+ placed alumni across global MNCs." },
    { title: "Streak Shield x 3", category: "XP Booster", price: "500 Coins", icon: "🛡️", desc: "Protect your daily XP streak from resetting when you miss a daily challenge." }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif" }}>
      {/* Top Store Header */}
      <header style={{ padding: "20px 40px", borderBottom: "1.5px solid var(--border-light)", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/platform")} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "8px 14px", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800 }}>
            Path<span style={{ color: "#6c63ff" }}>Ed Store</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ padding: "6px 14px", borderRadius: 20, background: "rgba(247,151,30,0.15)", border: "1px solid #f7971e40", color: "#f7971e", fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 700 }}>
            🪙 2,480 COINS AVAILABLE
          </div>
        </div>
      </header>

      {/* Main Store Content */}
      <main style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", padding: "6px 16px", borderRadius: 20, marginBottom: 16, color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700 }}>
            <Sparkles size={14} /> PREMIUM FEATURE MARKETPLACE
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 42, fontWeight: 800, margin: "0 0 12px" }}>
            Redeem Coins & Unlock Premium Modules
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto" }}>
            Use the coins earned through daily challenges, coding streaks, and roadmap checkpoints to unlock exclusive features.
          </p>
        </div>

        {/* Store Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
          {storeItems.map((item, idx) => (
            <div key={idx} style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
              <div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#6c63ff", letterSpacing: 1, marginBottom: 4 }}>
                  {item.category}
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 8, color: "var(--text-main)" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
                  {item.desc}
                </p>
              </div>

              <button
                onClick={() => alert(`Purchased ${item.title}! Feature unlocked.`)}
                style={{
                  width: "100%", padding: "12px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 6px 20px rgba(108,99,255,0.25)"
                }}
              >
                <ShoppingBag size={16} /> Unlock for {item.price}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
