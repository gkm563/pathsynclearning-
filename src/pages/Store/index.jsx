import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingBag, ArrowLeft, Lock, Sparkles, Check, ShieldCheck, 
  Coins, ArrowRightLeft, CreditCard, BookmarkCheck, CheckCircle, 
  HelpCircle, RefreshCw, Layers, Award, Terminal, Compass, Briefcase, 
  BookOpen, FileText, Zap, Laptop, Info, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Categorized Store Products
const STORE_CATALOG = [
  // 1. Roadmaps
  {
    id: "rm_aktu",
    title: "AKTU B.Tech Semester Roadmap",
    category: "Career & Academic Roadmaps",
    price: 1500,
    icon: "🎓",
    desc: "Complete semester-wise course layouts, syllabus breakdowns, and exam prep trackers tailored for AKTU.",
    meta: "Academic Roadmap"
  },
  {
    id: "rm_iitb",
    title: "IIT Bombay Self-Learning Path",
    category: "Career & Academic Roadmaps",
    price: 1800,
    icon: "🏛️",
    desc: "Curated lectures, rigorous assignments, and projects matching standard IIT Bombay CSE syllabus.",
    meta: "Academic Roadmap"
  },
  {
    id: "rm_fullstack",
    title: "Full Stack SDE Career Track",
    category: "Career & Academic Roadmaps",
    price: 1500,
    icon: "💻",
    desc: "End-to-end guide: frontend frameworks, backend microservices, DB scaling, systems and cloud deployment.",
    meta: "Career Roadmap"
  },
  {
    id: "rm_ai",
    title: "AI & ML Engineer Career Track",
    category: "Career & Academic Roadmaps",
    price: 2000,
    icon: "🧠",
    desc: "Mathematics, model building, neural networks, PyTorch, LLM fine-tuning, and model hosting.",
    meta: "Career Roadmap"
  },
  {
    id: "rm_google",
    title: "Google SDE Placement Path",
    category: "Career & Academic Roadmaps",
    price: 2000,
    icon: "🎯",
    desc: "Targeted calendar mapping DSA topics, high-concurrency designs, and Google mock interview checkpoints.",
    meta: "Placement Roadmap"
  },

  // 2. Project Blueprints
  {
    id: "pb_attendance",
    title: "AI Smart Attendance System",
    category: "Project Blueprints",
    price: 1200,
    icon: "📊",
    desc: "Blueprints containing complete system documentation, UI prototypes, ER diagrams, template source code, and PPT.",
    meta: "Project Blueprint"
  },
  {
    id: "pb_blockchain",
    title: "Web3 Blockchain Storefront",
    category: "Project Blueprints",
    price: 1300,
    icon: "⛓️",
    desc: "Smart contracts, React frontend templates, testing scripts, and system flow architectures.",
    meta: "Project Blueprint"
  },

  // 3. Study Planner Packs
  {
    id: "sp_dsa30",
    title: "30-Day Intensive DSA Sprint",
    category: "Study Planner Packs",
    price: 800,
    icon: "⏱️",
    desc: "Day-by-day practice tracker targeting top 100 interview questions on arrays, trees, graphs, and DP.",
    meta: "Planner Pack"
  },
  {
    id: "sp_react60",
    title: "60-Day React Mastery Plan",
    category: "Study Planner Packs",
    price: 900,
    icon: "⚛️",
    desc: "Syllabus checkpoints, micro-tasks, portfolio projects timeline, and state management coverage guide.",
    meta: "Planner Pack"
  },

  // 4. Resume Templates
  {
    id: "rt_ai_ats",
    title: "ATS-Optimized AI Engineer Resume",
    category: "Resume Templates",
    price: 400,
    icon: "📄",
    desc: "High-scoring layout optimized for ML terms, parameters, datasets, and GitHub project metrics.",
    meta: "ATS Resume"
  },
  {
    id: "rt_fs_ats",
    title: "ATS-Optimized Full Stack SDE",
    category: "Resume Templates",
    price: 400,
    icon: "💼",
    desc: "Clean layout prioritizing deployment stats, tech stacks, and team scaling results.",
    meta: "ATS Resume"
  },

  // 5. Interview Prep Packs
  {
    id: "ip_google",
    title: "Google Interview Prep Kit",
    category: "Interview Packs",
    price: 1000,
    icon: "🔍",
    desc: "Pre-filled DSA patterns, leadership questions, resume tips, and real mock interview experience sheets.",
    meta: "Interview Pack"
  },
  {
    id: "ip_msft",
    title: "Microsoft Interview Prep Kit",
    category: "Interview Packs",
    price: 1000,
    icon: "🖥️",
    desc: "Emphasis on object-oriented designs, SQL query sets, and system architecture fundamentals.",
    meta: "Interview Pack"
  },

  // 6. Hackathon Kits
  {
    id: "hk_winner",
    title: "Hackathon Champion Pitch Deck",
    category: "Hackathon Kits",
    price: 900,
    icon: "🏆",
    desc: "Pitch templates, interactive prototype UI kits, system layout shapes, and slides checklist.",
    meta: "Hackathon Kit"
  },

  // 7. Advanced Features (Original prefilled items)
  {
    id: "adv_mentor",
    title: "Industry Mentorship Pass",
    category: "Advanced Features",
    price: 1500,
    icon: "🤝",
    desc: "Unlock 1-on-1 monthly sessions with senior engineers from Tier-1 tech firms.",
    meta: "Premium Unlocks"
  },
  {
    id: "adv_hacksquad",
    title: "Hack Squad Leader Badge",
    category: "Advanced Features",
    price: 2000,
    icon: "⚔️",
    desc: "Form and lead your own hackathon team with priority recruitment matching.",
    meta: "Premium Unlocks"
  },
  {
    id: "adv_alumni",
    title: "Alumni Network VIP Access",
    category: "Advanced Features",
    price: 2500,
    icon: "🌐",
    desc: "Direct referral channel to 500+ placed alumni across global MNCs.",
    meta: "Premium Unlocks"
  },
  {
    id: "adv_streak",
    title: "Streak Shield x 3",
    category: "Advanced Features",
    price: 500,
    icon: "🛡️",
    desc: "Protect your daily XP streak from resetting when you miss a daily challenge.",
    meta: "Premium Unlocks"
  },

  // 8. AI Marketplace Modules (Plugins)
  {
    id: "mod_gate",
    title: "GATE 2027 Prep Module Plugin",
    category: "AI Marketplace Modules",
    price: 2500,
    icon: "🎒",
    desc: "Auto-calibrates dashboard: daily GATE questions, syllabus checkpoints, and mock test schedules.",
    meta: "AI Plugin Module"
  },
  {
    id: "mod_google_sde",
    title: "Google SDE Module Plugin",
    category: "AI Marketplace Modules",
    price: 2500,
    icon: "🤖",
    desc: "Swaps dashboard themes, challenges, and mock interview setups to target Google expectations.",
    meta: "AI Plugin Module"
  },
  {
    id: "mod_iitb",
    title: "IIT Bombay Learning Module Plugin",
    category: "AI Marketplace Modules",
    price: 2500,
    icon: "🎓",
    desc: "Syncs IIT Bombay assignments, peer projects, grading systems, and CS semester tasks.",
    meta: "AI Plugin Module"
  },
  {
    id: "mod_research",
    title: "AI Research Module Plugin",
    category: "AI Marketplace Modules",
    price: 2500,
    icon: "🔬",
    desc: "Unlocks IEEE layout modules, literature review trackers, and paper publication timelines.",
    meta: "AI Plugin Module"
  }
];

export default function Store() {
  const navigate = useNavigate();

  // Active Main Tab: 'browse' | 'purchased'
  const [activeTab, setActiveTab] = useState("browse");

  // Selected category in browse store
  const [selectedCategory, setSelectedCategory] = useState("All");

  // User Local Storage States
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem("pathed_user_coins");
    return saved ? parseInt(saved, 10) : 3480;
  });

  const [purchasedIds, setPurchasedIds] = useState(() => {
    const saved = localStorage.getItem("pathed_purchased_items");
    return saved ? JSON.parse(saved) : ["adv_streak"]; // Starts with streak shield purchased
  });

  const [activePlugin, setActivePlugin] = useState(() => {
    return localStorage.getItem("pathed_active_plugin") || "None";
  });

  // Simulated cash wallet balance
  const [cashWallet, setCashWallet] = useState(() => {
    const saved = localStorage.getItem("pathed_cash_wallet");
    return saved ? parseFloat(saved) : 45.00;
  });

  // Modal / Toast Notification States
  const [applyModalItem, setApplyModalItem] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Sync state values to Local Storage
  useEffect(() => {
    localStorage.setItem("pathed_user_coins", coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem("pathed_purchased_items", JSON.stringify(purchasedIds));
  }, [purchasedIds]);

  useEffect(() => {
    localStorage.setItem("pathed_cash_wallet", cashWallet.toFixed(2));
  }, [cashWallet]);

  // Show Toast Alert helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Buy item action handler
  const handlePurchaseItem = (item) => {
    if (purchasedIds.includes(item.id)) {
      triggerToast("You already own this item.");
      return;
    }
    if (coins < item.price) {
      triggerToast("❌ Insufficient coins! Buy more coins or complete daily challenges.");
      return;
    }

    setCoins(prev => prev - item.price);
    setPurchasedIds(prev => [...prev, item.id]);
    triggerToast(`🎉 Purchased "${item.title}" successfully! Check Purchased tab.`);
  };

  // Let's Apply action handler
  const handleApplyClick = (item) => {
    setApplyModalItem(item);
  };

  // Confirm Apply Module/Item
  const handleConfirmApply = () => {
    if (!applyModalItem) return;

    if (applyModalItem.category === "AI Marketplace Modules") {
      localStorage.setItem("pathed_active_plugin", applyModalItem.title);
      setActivePlugin(applyModalItem.title);
    }
    
    triggerToast(`⚡ Applied "${applyModalItem.title}" to your student profile!`);
    setApplyModalItem(null);
  };

  // Exchange System: Cash to Coins
  const buyCoinsPack = (amount, cost) => {
    if (cashWallet < cost) {
      triggerToast("❌ Insufficient cash balance! Please add funds first.");
      return;
    }
    setCashWallet(prev => prev - cost);
    setCoins(prev => prev + amount);
    triggerToast(`🪙 Added ${amount.toLocaleString()} Coins to your account!`);
  };

  // Exchange System: Coins to Cash
  const cashOutCoins = (coinsAmount, cashValue) => {
    if (coins < coinsAmount) {
      triggerToast("❌ Insufficient coins to cash out.");
      return;
    }
    setCoins(prev => prev - coinsAmount);
    setCashWallet(prev => prev + cashValue);
    triggerToast(`💸 Exchanged ${coinsAmount.toLocaleString()} Coins for $${cashValue} Cash Credits!`);
  };

  // Reset module settings helper
  const handleClearPlugin = () => {
    localStorage.removeItem("pathed_active_plugin");
    setActivePlugin("None");
    triggerToast("System profile reset to default configuration.");
  };

  // Categories list filter
  const categories = ["All", ...new Set(STORE_CATALOG.map(item => item.category))];

  // Filter items in browse tab
  const getFilteredItems = () => {
    if (selectedCategory === "All") return STORE_CATALOG;
    return STORE_CATALOG.filter(item => item.category === selectedCategory);
  };

  // Get purchased items objects
  const getPurchasedItems = () => {
    return STORE_CATALOG.filter(item => purchasedIds.includes(item.id));
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif" }}>
      
      {/* ==================== STORE HEADER ==================== */}
      <header style={{ 
        padding: "20px 40px", 
        borderBottom: "1.5px solid var(--border-light)", 
        background: "var(--bg-card)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button 
            onClick={() => navigate("/platform")} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              background: "var(--bg-alt)", 
              border: "1px solid var(--border-light)", 
              borderRadius: 12, 
              padding: "8px 14px", 
              color: "var(--text-main)", 
              fontFamily: "'Outfit', sans-serif", 
              fontSize: 13, 
              fontWeight: 700, 
              cursor: "pointer" 
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 900 }}>
            Path<span style={{ color: "#6c63ff" }}>Ed Store</span>
          </div>
        </div>

        {/* User Balance Indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {activePlugin !== "None" && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 6,
              padding: "6px 12px", 
              borderRadius: 20, 
              background: "rgba(108,99,255,0.12)", 
              border: "1px solid rgba(108,99,255,0.3)", 
              color: "#6c63ff", 
              fontFamily: "'Fira Code', monospace", 
              fontSize: 12, 
              fontWeight: 700 
            }}>
              <Zap size={14} /> ACTIVE MODULE: {activePlugin.replace(" Plugin", "")}
              <button 
                onClick={handleClearPlugin}
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: "#ff6b6b", 
                  cursor: "pointer", 
                  padding: "0 2px",
                  fontSize: 12,
                  fontWeight: 950
                }}
                title="Disable active module"
              >
                ×
              </button>
            </div>
          )}

          <div style={{ 
            padding: "6px 14px", 
            borderRadius: 20, 
            background: "rgba(247,151,30,0.12)", 
            border: "1px solid rgba(247,151,30,0.3)", 
            color: "#f7971e", 
            fontFamily: "'Fira Code', monospace", 
            fontSize: 13, 
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}>
            <Coins size={16} />
            <span>{coins.toLocaleString()} COINS</span>
          </div>

          <div style={{ 
            padding: "6px 14px", 
            borderRadius: 20, 
            background: "rgba(0,201,167,0.12)", 
            border: "1px solid rgba(0,201,167,0.3)", 
            color: "#00c9a7", 
            fontFamily: "'Fira Code', monospace", 
            fontSize: 13, 
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}>
            <CreditCard size={16} />
            <span>${cashWallet.toFixed(2)} CASH</span>
          </div>
        </div>
      </header>

      {/* ==================== TOAST ALERT ==================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: "fixed", top: 24, left: "50%", x: "-50%",
              background: "rgba(15, 23, 42, 0.95)", border: "1.5px solid rgba(108,99,255,0.4)",
              borderRadius: 16, padding: "12px 24px", zIndex: 1400, color: "#fff",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 10,
              fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14.5
            }}
          >
            <Sparkles size={16} color="#6c63ff" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MAIN SECTION ==================== */}
      <main style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px 60px" }}>
        
        {/* Banner Section */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", padding: "6px 16px", borderRadius: 20, marginBottom: 16, color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700 }}>
            <Sparkles size={14} /> PREMIUM ACADEMIC & CAREER MODULES
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 44, fontWeight: 900, margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            The PathEd Resource Store
          </h1>
          <p style={{ fontSize: 16.5, color: "var(--text-muted)", maxWidth: 650, margin: "0 auto", lineHeight: 1.5 }}>
            Redeem coins earned from challenges and roadmap milestones to unlock blueprints, planners, modules, and VIP platform upgrades.
          </p>
        </div>

        {/* ==================== INTERFACE TABS SWITCHER ==================== */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          marginBottom: 36,
          background: "var(--bg-alt)", 
          border: "1.5px solid var(--border-light)", 
          padding: 6, 
          borderRadius: 20,
          width: "max-content",
          margin: "0 auto 36px"
        }}>
          <button
            onClick={() => setActiveTab("browse")}
            style={{
              padding: "10px 28px", borderRadius: 14, border: "none", cursor: "pointer",
              fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, transition: "all 0.2s",
              background: activeTab === "browse" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
              color: activeTab === "browse" ? "#ffffff" : "var(--text-muted)",
              display: "flex", alignItems: "center", gap: 8
            }}
          >
            <Compass size={16} />
            <span>Browse Store</span>
          </button>
          <button
            onClick={() => setActiveTab("purchased")}
            style={{
              padding: "10px 28px", borderRadius: 14, border: "none", cursor: "pointer",
              fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, transition: "all 0.2s",
              background: activeTab === "purchased" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
              color: activeTab === "purchased" ? "#ffffff" : "var(--text-muted)",
              display: "flex", alignItems: "center", gap: 8
            }}
          >
            <BookmarkCheck size={16} />
            <span>Purchased Packs ({purchasedIds.length})</span>
          </button>
        </div>

        {/* ==================== BROWSE STORE TABS ==================== */}
        {activeTab === "browse" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            
            {/* Category Selector Buttons */}
            <div style={{ 
              display: "flex", 
              gap: 8, 
              overflowX: "auto", 
              paddingBottom: 8,
              borderBottom: "1px solid var(--border-light)"
            }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 12,
                    border: selectedCategory === cat ? "1.5px solid #6c63ff" : "1.5px solid var(--border-light)",
                    background: selectedCategory === cat ? "rgba(108,99,255,0.08)" : "var(--bg-card)",
                    color: selectedCategory === cat ? "#6c63ff" : "var(--text-main)",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
              {getFilteredItems().map((item) => {
                const isOwned = purchasedIds.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    style={{ 
                      background: "var(--bg-card)", 
                      border: isOwned ? "1.5px solid rgba(0,201,167,0.3)" : "1.5px solid var(--border-light)", 
                      borderRadius: 22, 
                      padding: 24, 
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "space-between", 
                      boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
                      position: "relative",
                      transition: "transform 0.2s"
                    }}
                  >
                    {isOwned && (
                      <span style={{ 
                        position: "absolute", top: 18, right: 18,
                        background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)",
                        color: "#00c9a7", padding: "3px 8px", borderRadius: 8,
                        fontSize: 10, fontFamily: "'Fira Code', monospace", fontWeight: 800
                      }}>
                        OWNED
                      </span>
                    )}

                    <div>
                      <div style={{ fontSize: 36, marginBottom: 14 }}>{item.icon}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9.5, fontWeight: 800, color: "#6c63ff", letterSpacing: 0.5 }}>
                          {item.category.toUpperCase()}
                        </span>
                        <span style={{ color: "var(--text-light)", fontSize: 10 }}>•</span>
                        <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>{item.meta}</span>
                      </div>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 850, color: "var(--text-main)", margin: "0 0 8px" }}>
                        {item.title}
                      </h3>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 20px" }}>
                        {item.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePurchaseItem(item)}
                      disabled={isOwned}
                      style={{
                        width: "100%", padding: "11px", borderRadius: 12, border: "none",
                        background: isOwned 
                          ? "var(--bg-alt)" 
                          : "linear-gradient(135deg, #6c63ff, #00c9a7)", 
                        color: isOwned ? "var(--text-muted)" : "#ffffff",
                        fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800,
                        cursor: isOwned ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        boxShadow: isOwned ? "none" : "0 6px 18px rgba(108,99,255,0.18)"
                      }}
                    >
                      {isOwned ? (
                        <>
                          <CheckCircle size={15} color="#00c9a7" />
                          <span>Unlocked & Owned</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={15} />
                          <span>Unlock for {item.price.toLocaleString()} Coins</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ==================== PURCHASED PACKS INTERFACE ==================== */}
        {activeTab === "purchased" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {getPurchasedItems().length === 0 ? (
              <div style={{ 
                padding: "80px 20px", textAlign: "center", 
                background: "var(--bg-card)", border: "1.5px dashed var(--border-light)", 
                borderRadius: 24 
              }}>
                <span style={{ fontSize: 36 }}>🧭</span>
                <h3 style={{ margin: "12px 0 6px", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
                  No Purchases Yet
                </h3>
                <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-muted)", fontWeight: 500 }}>
                  Unlock modules, planners, and templates in the Browse tab using your student coins.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                {getPurchasedItems().map((item) => {
                  const isActive = activePlugin === item.title;
                  return (
                    <div 
                      key={item.id} 
                      style={{ 
                        background: "var(--bg-card)", 
                        border: isActive ? "1.5px solid #6c63ff" : "1.5px solid var(--border-light)", 
                        borderRadius: 22, 
                        padding: 24, 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "space-between", 
                        boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
                        position: "relative"
                      }}
                    >
                      {isActive && (
                        <span style={{ 
                          position: "absolute", top: 18, right: 18,
                          background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.3)",
                          color: "#6c63ff", padding: "3px 8px", borderRadius: 8,
                          fontSize: 10, fontFamily: "'Fira Code', monospace", fontWeight: 800
                        }}>
                          ACTIVE
                        </span>
                      )}

                      <div>
                        <div style={{ fontSize: 36, marginBottom: 14 }}>{item.icon}</div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9.5, fontWeight: 800, color: "#6c63ff", letterSpacing: 0.5 }}>
                            {item.category.toUpperCase()}
                          </span>
                          <span style={{ color: "var(--text-light)", fontSize: 10 }}>•</span>
                          <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>{item.meta}</span>
                        </div>
                        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 850, color: "var(--text-main)", margin: "0 0 8px" }}>
                          {item.title}
                        </h3>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 20px" }}>
                          {item.desc}
                        </p>
                      </div>

                      <button
                        onClick={() => handleApplyClick(item)}
                        style={{
                          width: "100%", padding: "11px", borderRadius: 12,
                          background: isActive 
                            ? "rgba(108,99,255,0.08)"
                            : "linear-gradient(135deg, #6c63ff, #00c9a7)", 
                          color: isActive ? "#6c63ff" : "#ffffff",
                          border: isActive ? "1.5px solid #6c63ff" : "none",
                          fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          boxShadow: isActive ? "none" : "0 6px 18px rgba(108,99,255,0.18)"
                        }}
                      >
                        <Zap size={14} />
                        <span>{isActive ? "Re-apply to profile" : "Let's Apply"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== COIN EXCHANGE DASHBOARD REGION ==================== */}
        <div style={{ 
          marginTop: 56, 
          background: "linear-gradient(135deg, rgba(247,151,30,0.05) 0%, rgba(0,201,167,0.05) 100%)",
          border: "1.5px solid var(--border-light)",
          borderRadius: 24,
          padding: 32,
          boxShadow: "0 10px 40px rgba(0,0,0,0.01)"
        }}>
          
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 24 }}>
            <div style={{ background: "rgba(247,151,30,0.15)", borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowRightLeft size={20} color="#f7971e" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                Coin Exchange & Refills
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--text-muted)", fontWeight: 500 }}>
                Replenish coin banks with Cash credits, or cash out extra coins to standard account currency values.
              </p>
            </div>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: 24 
          }}>
            
            {/* Purchase Coins (Cash -> Coins) */}
            <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 20 }}>
              <h4 style={{ margin: "0 0 14px", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "#f7971e", letterSpacing: 0.5 }}>
                BUY COINS PACKAGE
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { name: "SDE Starter Refill", coins: 500, cost: 4.99 },
                  { name: "Pro Pack Refill", coins: 1500, cost: 12.99 },
                  { name: "Elite Vault Refill", coins: 3500, cost: 24.99 }
                ].map((pack, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg-alt)", borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)" }}>{pack.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>+{pack.coins.toLocaleString()} Coins</div>
                    </div>
                    <button
                      onClick={() => buyCoinsPack(pack.coins, pack.cost)}
                      style={{
                        padding: "6px 12px", borderRadius: 8, border: "none",
                        background: "#00c9a7", color: "#fff", cursor: "pointer",
                        fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 800
                      }}
                    >
                      ${pack.cost} Cash
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exchange Coins (Coins -> Cash) */}
            <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 20 }}>
              <h4 style={{ margin: "0 0 14px", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "#00c9a7", letterSpacing: 0.5 }}>
                EXCHANGE / CASH OUT COINS
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Convert 1,000 Coins", coins: 1000, value: 5.00 },
                  { label: "Convert 2,000 Coins", coins: 2000, value: 10.00 },
                  { label: "Convert 5,000 Coins", coins: 5000, value: 25.00 }
                ].map((exch, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg-alt)", borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)" }}>{exch.label}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Value: ${exch.value.toFixed(2)} Cash</div>
                    </div>
                    <button
                      onClick={() => cashOutCoins(exch.coins, exch.value)}
                      style={{
                        padding: "6px 12px", borderRadius: 8, border: "1.5px solid var(--border-light)",
                        background: "var(--bg-card)", color: "#f7971e", cursor: "pointer",
                        fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 800
                      }}
                    >
                      Cash Out
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulate Wallet Top-Up */}
            <div style={{ 
              background: "var(--bg-card)", border: "1.5px solid var(--border-light)", 
              borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", 
              justifyContent: "space-between" 
            }}>
              <div>
                <h4 style={{ margin: "0 0 6px", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "#6c63ff", letterSpacing: 0.5 }}>
                  SIMULATE USD FUNDS
                </h4>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Add simulated USD funds to your simulated Cash Wallet for dummy transaction exchanges.
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                  onClick={() => {
                    setCashWallet(prev => prev + 10);
                    triggerToast("Simulated Cash: Added +$10.00 to Cash Wallet.");
                  }}
                  style={{
                    flex: 1, padding: "8px", borderRadius: 8, border: "1px solid rgba(108,99,255,0.3)",
                    background: "rgba(108,99,255,0.06)", color: "#6c63ff", fontFamily: "'Outfit', sans-serif",
                    fontSize: 12, fontWeight: 800, cursor: "pointer"
                  }}
                >
                  +$10 Cash
                </button>
                <button
                  onClick={() => {
                    setCashWallet(prev => prev + 50);
                    triggerToast("Simulated Cash: Added +$50.00 to Cash Wallet.");
                  }}
                  style={{
                    flex: 1, padding: "8px", borderRadius: 8, border: "1px solid rgba(108,99,255,0.3)",
                    background: "rgba(108,99,255,0.06)", color: "#6c63ff", fontFamily: "'Outfit', sans-serif",
                    fontSize: 12, fontWeight: 800, cursor: "pointer"
                  }}
                >
                  +$50 Cash
                </button>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* ==================== GLOBAL MODAL: APPLY MODULE TO PROFILE ==================== */}
      <AnimatePresence>
        {applyModalItem && (
          <div 
            onClick={e => { if (e.target === e.currentTarget) setApplyModalItem(null); }}
            style={{
              position: "fixed", inset: 0, zIndex: 1300,
              background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 24
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                background: "var(--bg-card)", borderRadius: 24, maxWidth: 500, width: "100%",
                border: "1.5px solid rgba(108,99,255,0.3)", boxShadow: "0 30px 80px rgba(108,99,255,0.15)",
                overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
              }}
            >
              
              <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
                  ⚡ Apply Resource to Profile
                </h4>
                <button onClick={() => setApplyModalItem(null)} style={{ background: "var(--bg-alt)", border: "none", cursor: "pointer", color: "var(--text-main)", fontSize: 20 }}>
                  ×
                </button>
              </div>

              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 12, padding: 14, borderRadius: 12, background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.1)" }}>
                  <Sparkles size={18} color="#6c63ff" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13.5, color: "#6c63ff", fontWeight: 700, lineHeight: 1.45 }}>
                    You are applying <strong>{applyModalItem.title}</strong> to your account path context.
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  This will calibrate your active profile roadmap recommendations, daily challenge constraints, and dashboard widgets to target the {applyModalItem.meta} features natively.
                </p>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button 
                    type="button"
                    onClick={() => setApplyModalItem(null)}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmApply}
                    style={{ flex: 1.5, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900, cursor: "pointer" }}
                  >
                    Confirm & Apply Module
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
