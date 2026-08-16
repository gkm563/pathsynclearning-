"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, ArrowLeft, Lock, Sparkles, Check, ShieldCheck, 
  Coins, ArrowRightLeft, CreditCard, BookmarkCheck, CheckCircle, 
  HelpCircle, RefreshCw, Layers, Award, Terminal, Compass, Briefcase, 
  BookOpen, FileText, Zap, Laptop, Info, Plus, Star, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { STORE_CATALOG, type StoreProductSeed } from "@/data/store-catalog";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { apiGet, apiSend } from "@/lib/api";

type StoreProduct = StoreProductSeed;

// Slidable Row component mimicking Netflix horizontal rows in Mentorship
function SlidableStoreRow({ title, items, purchasedIds, activePlugin, onPurchaseClick, onApplyClick, onDetailsClick }) {
  const scrollRef = React.useRef<any>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -330, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 330, behavior: "smooth" });
    }
  };

  if (items.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative", marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
          {title}
        </h3>
        
        {/* Carousel Navigation Arrows */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={scrollLeft}
            style={{
              width: 32, height: 32, borderRadius: 10, border: "1.5px solid var(--border-light)",
              background: "var(--bg-card)", color: "var(--text-main)", cursor: "pointer",
              display: "flex", alignItems: "center", justify: "center"
            }}
          >
            ‹
          </button>
          <button
            onClick={scrollRight}
            style={{
              width: 32, height: 32, borderRadius: 10, border: "1.5px solid var(--border-light)",
              background: "var(--bg-card)", color: "var(--text-main)", cursor: "pointer",
              display: "flex", alignItems: "center", justify: "center"
            }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Slidable Row Wrapper */}
      <div 
        ref={scrollRef}
        style={{
          display: "flex", gap: 20, overflowX: "auto", padding: "8px 0",
          scrollbarWidth: "none", msOverflowStyle: "none"
        }}
        className="hide-scrollbar"
      >
        {items.map((item) => {
          const isOwned = purchasedIds.includes(item.id);
          const isActive = activePlugin === item.title;
          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -6, boxShadow: `0 10px 24px ${item.col}18` }}
              style={{
                width: 310, flexShrink: 0, background: "var(--bg-card)",
                border: "1.5px solid var(--border-light)", borderTop: `5px solid ${item.col}`,
                borderRadius: 22, overflow: "hidden", display: "flex", flexDirection: "column",
                boxShadow: "0 6px 18px rgba(0,0,0,0.02)"
              }}
            >
              {/* Portrait Cover */}
              <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
                <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }} />
                
                {/* Logo layered properly over cover image */}
                <div style={{
                  position: "absolute", top: 12, left: 12, width: 36, height: 36, borderRadius: 10,
                  background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justify: "center",
                  fontSize: 20
                }}>
                  {item.icon}
                </div>

                {/* Rating / Meta Badge */}
                <div style={{
                  position: "absolute", top: 12, right: 12, padding: "4px 10px", borderRadius: 8,
                  background: "rgba(0,0,0,0.7)", color: "#fff", display: "flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontFamily: "'Outfit', sans-serif", fontWeight: 800
                }}>
                  <Star size={11} fill="#f59e0b" color="#f59e0b" />
                  <span>4.9</span>
                </div>

                <div style={{ position: "absolute", bottom: 12, left: 16, right: 16, color: "#fff" }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17.5, fontWeight: 900, lineHeight: 1.3 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4, fontFamily: "'Fira Code', monospace" }}>
                    {item.meta}
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, minHeight: 40 }}>
                  {item.desc}
                </p>

                {/* Dual Button Layout (Pre-purchase / Post-purchase specs) */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => onDetailsClick(item)}
                    style={{
                      flex: 1, padding: "10px 12px", borderRadius: 12, border: "1.5px solid var(--border-light)",
                      background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif",
                      fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--border-light)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-alt)"; }}
                  >
                    Details
                  </button>

                  {isOwned ? (
                    <button
                      onClick={() => onApplyClick(item)}
                      style={{
                        flex: 2, padding: "10px 12px", borderRadius: 12,
                        background: isActive 
                          ? "rgba(108,99,255,0.08)"
                          : "linear-gradient(135deg, #6c63ff, #00c9a7)", 
                        color: isActive ? "#6c63ff" : "#ffffff",
                        border: isActive ? "1.5px solid #6c63ff" : "none",
                        fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 900,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "all 0.2s"
                      }}
                    >
                      <Zap size={14} />
                      <span>{isActive ? "Applied" : "Let's Apply"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onPurchaseClick(item)}
                      style={{
                        flex: 2, padding: "10px 12px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                        fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 900,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        boxShadow: "0 6px 18px rgba(108,99,255,0.18)", transition: "all 0.2s"
                      }}
                    >
                      <ShoppingBag size={14} />
                      <span>Unlock</span>
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function Store() {
  const router = useRouter();

  // Active Tab switcher: 'browse' | 'purchased'
  const [activeTab, setActiveTab] = useState("browse");

  // Selected Category filter
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [catalog, setCatalog] = useState<StoreProduct[]>(STORE_CATALOG);
  const [, setLoadingCatalog] = useState(true);
  const [coins, setCoins] = useState(3480);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [activePlugin, setActivePlugin] = useState("None");
  const [cashWallet, setCashWallet] = useState(0);

  // Modals & Messages states
  const [purchasingItem, setPurchasingItem] = useState<any>(null);
  const [applyingItem, setApplyingItem] = useState<any>(null);
  const [viewingDetailItem, setViewingDetailItem] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [store, wallet] = await Promise.all([
          apiGet<{
            products: StoreProduct[];
            purchasedIds: string[];
            activePlugin: string | null;
          }>("/api/store/products"),
          apiGet<{
            wallet: { coins: number; cash_balance: string | number };
          }>("/api/me/wallet").catch(() => null),
        ]);
        if (cancelled) return;
        if (store.products?.length) setCatalog(store.products);
        setPurchasedIds(store.purchasedIds || []);
        setActivePlugin(store.activePlugin || "None");
        if (wallet?.wallet) {
          setCoins(Number(wallet.wallet.coins) || 0);
          setCashWallet(Number(wallet.wallet.cash_balance) || 0);
        }
      } catch {
        if (!cancelled) setCatalog(STORE_CATALOG);
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Click handler to open purchase confirmation dialog
  const handlePurchaseClick = (item) => {
    if (purchasedIds.includes(item.id)) {
      triggerToast("You already own this item.");
      return;
    }
    setPurchasingItem(item);
  };

  // Confirm Purchase action
  const handleConfirmPurchase = async () => {
    if (!purchasingItem) return;

    if (coins < purchasingItem.price) {
      triggerToast("❌ Insufficient coins! Refill coins below or complete challenges.");
      setPurchasingItem(null);
      return;
    }

    try {
      const result = await apiSend<{ ok: boolean; coins: number }>(
        "/api/store/products",
        "POST",
        { productId: purchasingItem.id },
      );
      setCoins(Number(result.coins));
      setPurchasedIds((prev) =>
        prev.includes(purchasingItem.id) ? prev : [...prev, purchasingItem.id],
      );
      triggerToast(`🎉 Purchased "${purchasingItem.title}" successfully! Check Purchased tab.`);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : "Purchase failed.");
    }
    setPurchasingItem(null);
  };

  // Click Apply pack
  const handleApplyClick = (item) => {
    setApplyingItem(item);
  };

  // Confirm Apply
  const handleConfirmApply = async () => {
    if (!applyingItem) return;

    if (applyingItem.category === "AI Marketplace Modules") {
      try {
        await apiSend("/api/me/settings", "PUT", {
          activePlugin: applyingItem.title,
        });
        setActivePlugin(applyingItem.title);
      } catch {
        setActivePlugin(applyingItem.title);
      }
    }
    
    triggerToast(`⚡ Applied "${applyingItem.title}" to your student profile!`);
    setApplyingItem(null);
  };

  // USD to Coins Pack buy
  const buyCoinsPack = async (amount, cost) => {
    if (cashWallet < cost) {
      triggerToast("❌ Insufficient cash balance! Add funds first.");
      return;
    }
    const nextCash = cashWallet - cost;
    const nextCoins = coins + amount;
    try {
      await apiSend("/api/me/wallet", "PUT", {
        coins: nextCoins,
        cashBalance: nextCash,
        transaction: {
          kind: "coin_pack",
          amountCoins: amount,
          amountCash: -cost,
          meta: { pack: amount },
        },
      });
      setCashWallet(nextCash);
      setCoins(nextCoins);
      triggerToast(`🪙 Added ${amount.toLocaleString()} Coins to your account!`);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : "Could not buy coins.");
    }
  };

  // Coins exchange cash out
  const cashOutCoins = async (coinsAmount, cashValue) => {
    if (coins < coinsAmount) {
      triggerToast("❌ Insufficient coins to cash out.");
      return;
    }
    const nextCoins = coins - coinsAmount;
    const nextCash = cashWallet + cashValue;
    try {
      await apiSend("/api/me/wallet", "PUT", {
        coins: nextCoins,
        cashBalance: nextCash,
        transaction: {
          kind: "cash_out",
          amountCoins: -coinsAmount,
          amountCash: cashValue,
        },
      });
      setCoins(nextCoins);
      setCashWallet(nextCash);
      triggerToast(`💸 Exchanged ${coinsAmount.toLocaleString()} Coins for $${cashValue} Cash Credits!`);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : "Cash out failed.");
    }
  };

  const handleClearPlugin = async () => {
    try {
      await apiSend("/api/me/settings", "PUT", { activePlugin: null });
    } catch {
      // keep UI responsive
    }
    setActivePlugin("None");
    triggerToast("System profile reset to default configuration.");
  };

  // Categories list
  const categories = ["All", ...new Set(catalog.map(item => item.category))];

  // Get filtered categories based on active selector
  const getCategoriesToShow = () => {
    if (selectedCategory === "All") return categories.filter(c => c !== "All");
    return [selectedCategory];
  };

  // Filter items in purchased tab
  const getPurchasedItems = () => {
    return catalog.filter(item => purchasedIds.includes(item.id));
  };

  return (
    <DashboardLayout activeTab="store" setActiveTab={() => {}}>
      {/* CSS hide scrollbars support */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

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
        
        {/* 1. Header Section */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, padding: "20px 24px",
          background: "var(--bg-card)", borderRadius: 24,
          border: "1.5px solid var(--border-light)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          marginBottom: 32
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 900, color: "var(--text-main)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <ShoppingBag size={26} color="#6c63ff" />
                Resource <span style={{ color: "#6c63ff" }}>Store</span>
              </h1>
              <span style={{
                padding: "4px 12px", borderRadius: 14,
                background: "rgba(108, 99, 255, 0.12)", border: "1px solid #6c63ff50",
                color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900
              }}>
                ✦ RESOURCE MODULES &amp; UPGRADES
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 16, color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
              Redeem coins earned from challenges and roadmap milestones to unlock blueprints, planners, modules, and VIP platform upgrades.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div 
              onClick={() => router.push("/store/wallet")}
              style={{ 
                padding: "8px 16px", 
                borderRadius: 16, 
                background: "rgba(247,151,30,0.08)", 
                border: "1.5px solid rgba(247,151,30,0.2)", 
                color: "#f7971e", 
                fontFamily: "'Fira Code', monospace", 
                fontSize: 13, 
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer"
              }}
              title="Add coins"
            >
              <Coins size={16} />
              <span>{coins.toLocaleString()} Coins</span>
              <span style={{ padding: "1px 6px", borderRadius: 8, background: "#f7971e", color: "#fff", fontSize: 10, fontWeight: 900, marginLeft: 2 }}>+</span>
            </div>

            <div 
              onClick={() => router.push("/store/wallet")}
              style={{ 
                padding: "8px 16px", 
                borderRadius: 16, 
                background: "rgba(0,201,167,0.08)", 
                border: "1.5px solid rgba(0,201,167,0.2)", 
                color: "#00c9a7", 
                fontFamily: "'Fira Code', monospace", 
                fontSize: 13, 
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer"
              }}
              title="View wallet"
            >
              <CreditCard size={16} />
              <span>${cashWallet.toFixed(2)} Cash</span>
            </div>
          </div>
        </div>

        {/* Interface Switch Tabs */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
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

        {/* ==================== BROWSE STORE INTERFACE ==================== */}
        {activeTab === "browse" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Category Selector Tabs */}
            <div style={{ 
              display: "flex", 
              gap: 8, 
              overflowX: "auto", 
              paddingBottom: 8,
              borderBottom: "1px solid var(--border-light)",
              marginBottom: 16
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

            {/* Netflix slidable horizontal rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {getCategoriesToShow().map((categoryName) => {
                const categoryItems = catalog.filter(item => item.category === categoryName);
                return (
                  <SlidableStoreRow
                    key={categoryName}
                    title={`🎬 ${categoryName}`}
                    items={categoryItems}
                    purchasedIds={purchasedIds}
                    activePlugin={activePlugin}
                    onPurchaseClick={handlePurchaseClick}
                    onApplyClick={handleApplyClick}
                    onDetailsClick={setViewingDetailItem}
                  />
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
              <div>
                <SlidableStoreRow
                  title="💼 My Purchased Packs"
                  items={getPurchasedItems()}
                  purchasedIds={purchasedIds}
                  activePlugin={activePlugin}
                  onPurchaseClick={handlePurchaseClick}
                  onApplyClick={handleApplyClick}
                  onDetailsClick={setViewingDetailItem}
                />
              </div>
            )}
          </div>
        )}

      {/* ==================== GLOBAL MODAL: CONFIRM COIN PURCHASE ==================== */}
      <AnimatePresence>
        {purchasingItem && (
          <div 
            onClick={e => { if (e.target === e.currentTarget) setPurchasingItem(null); }}
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
                  🪙 Confirm Unlock Premium Pack
                </h4>
                <button onClick={() => setPurchasingItem(null)} style={{ background: "var(--bg-alt)", border: "none", cursor: "pointer", color: "var(--text-main)", fontSize: 20 }}>
                  ×
                </button>
              </div>

              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 12, padding: 14, borderRadius: 12, background: "rgba(247,151,30,0.06)", border: "1px solid rgba(247,151,30,0.1)" }}>
                  <Coins size={18} color="#f7971e" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13.5, color: "#f7971e", fontWeight: 700, lineHeight: 1.45 }}>
                    Are you sure you want to unlock <strong>{purchasingItem.title}</strong>?
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--bg-alt)", padding: 16, borderRadius: 14, border: "1px solid var(--border-light)", fontSize: 13.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Current Balance:</span>
                    <strong style={{ color: "var(--text-main)" }}>{coins.toLocaleString()} Coins</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Pack Price:</span>
                    <strong style={{ color: "#ff6b6b" }}>-{purchasingItem.price.toLocaleString()} Coins</strong>
                  </div>
                  <div style={{ height: "1px", background: "var(--border-light)", margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Remaining Balance:</span>
                    <strong style={{ color: coins >= purchasingItem.price ? "#00c9a7" : "#ff6b6b" }}>
                      {(coins - purchasingItem.price).toLocaleString()} Coins
                    </strong>
                  </div>
                </div>

                {coins < purchasingItem.price && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#ff6b6b", fontSize: 12.5, fontWeight: 700 }}>
                    <Info size={14} />
                    <span>Insufficient coins. Exchange USD to Coins below before unlocking.</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button 
                    type="button"
                    onClick={() => setPurchasingItem(null)}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmPurchase}
                    disabled={coins < purchasingItem.price}
                    style={{ flex: 1.5, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900, cursor: coins < purchasingItem.price ? "default" : "pointer", opacity: coins < purchasingItem.price ? 0.5 : 1 }}
                  >
                    Confirm Unlock
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== GLOBAL MODAL: APPLY RESOURCE TO PROFILE ==================== */}
      <AnimatePresence>
        {applyingItem && (
          <div 
            onClick={e => { if (e.target === e.currentTarget) setApplyingItem(null); }}
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
                <button onClick={() => setApplyingItem(null)} style={{ background: "var(--bg-alt)", border: "none", cursor: "pointer", color: "var(--text-main)", fontSize: 20 }}>
                  ×
                </button>
              </div>

              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 12, padding: 14, borderRadius: 12, background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.1)" }}>
                  <Sparkles size={18} color="#6c63ff" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13.5, color: "#6c63ff", fontWeight: 700, lineHeight: 1.45 }}>
                    You are applying <strong>{applyingItem.title}</strong> to your account path context.
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  This will calibrate your active profile roadmap recommendations, daily challenge constraints, and dashboard widgets to target the {applyingItem.meta} features natively.
                </p>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button 
                    type="button"
                    onClick={() => setApplyingItem(null)}
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

      {/* ==================== GLOBAL MODAL: DESCRIPTION DETAILS POPUP ==================== */}
      <AnimatePresence>
        {viewingDetailItem && (
          <div 
            onClick={e => { if (e.target === e.currentTarget) setViewingDetailItem(null); }}
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
                background: "var(--bg-card)", borderRadius: 24, maxWidth: 540, width: "100%",
                border: `1.5px solid ${viewingDetailItem.col}`, boxShadow: `0 30px 80px ${viewingDetailItem.col}22`,
                overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
              }}
            >
              {/* Header */}
              <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{viewingDetailItem.icon}</span>
                  <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
                    Pack Specifications
                  </h4>
                </div>
                <button 
                  onClick={() => setViewingDetailItem(null)} 
                  style={{ background: "var(--bg-alt)", border: "none", borderRadius: 50, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Cover mini banner */}
              <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
                <img src={viewingDetailItem.image} alt={viewingDetailItem.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }} />
                <div style={{ position: "absolute", bottom: 12, left: 20, color: "#fff" }}>
                  <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900 }}>{viewingDetailItem.title}</h3>
                  <span style={{ fontSize: 12, opacity: 0.85, fontFamily: "'Fira Code', monospace" }}>{viewingDetailItem.meta}</span>
                </div>
              </div>

              {/* Scrollable details */}
              <div style={{ padding: 24, overflowY: "auto", maxHeight: "40vh", display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <h5 style={{ margin: "0 0 6px", fontSize: 12, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", letterSpacing: 0.5 }}>DESCRIPTION</h5>
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-main)", lineHeight: 1.6, fontWeight: 500 }}>
                    {viewingDetailItem.desc}
                  </p>
                </div>

                <div>
                  <h5 style={{ margin: "0 0 10px", fontSize: 12, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", letterSpacing: 0.5 }}>WHAT'S INCLUDED</h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {viewingDetailItem.included && viewingDetailItem.included.map((inc, index) => (
                      <div key={index} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13.5, color: "var(--text-muted)" }}>
                        <span style={{ color: viewingDetailItem.col, fontWeight: 900, marginTop: 1 }}>✓</span>
                        <span style={{ fontWeight: 500 }}>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer action buttons */}
              <div style={{ padding: "16px 24px", borderTop: "1.5px solid var(--border-light)", background: "var(--bg-alt)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button 
                  onClick={() => setViewingDetailItem(null)}
                  style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid var(--border-light)", background: "var(--bg-card)", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800 }}
                >
                  Close
                </button>

                {purchasedIds.includes(viewingDetailItem.id) ? (
                  <button 
                    onClick={() => {
                      setViewingDetailItem(null);
                      handleApplyClick(viewingDetailItem);
                    }}
                    style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900 }}
                  >
                    Apply to Profile
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setViewingDetailItem(null);
                      handlePurchaseClick(viewingDetailItem);
                    }}
                    style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900 }}
                  >
                    Unlock for {viewingDetailItem.price} Coins
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
