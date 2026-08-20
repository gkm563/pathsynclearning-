"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Coins, CreditCard, ArrowRightLeft, Sparkles, Plus, 
  DollarSign, Landmark, CheckCircle, RefreshCw, FileText, Info, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiSend } from "@/lib/api";

const COIN_PACKS = [
  { id: "pack_starter", name: "SDE Starter Refill", coins: 500, cost: 4.99, popular: false, badge: "Starter" },
  { id: "pack_pro", name: "Pro Developer Bundle", coins: 1500, cost: 12.99, popular: true, badge: "Most Popular" },
  { id: "pack_elite", name: "Elite Builder Pack", coins: 3500, cost: 24.99, popular: false, badge: "Best Value" },
  { id: "pack_mega", name: "Mega Vault Refill", coins: 8000, cost: 49.99, popular: false, badge: "Ultimate" }
];

const CASH_OUT_OPTIONS = [
  { coins: 1000, value: 5.00, desc: "Standard Cashout" },
  { coins: 2000, value: 10.00, desc: "Developer Cashout" },
  { coins: 5000, value: 25.00, desc: "Executive Cashout" }
];

const DEFAULT_TRANSACTIONS = [
  { id: "t_init", type: "system", title: "Welcome Bonus", value: "+500 Coins", date: "Jul 21, 2026", details: "Initial platform bonus" },
  { id: "t_init_cash", type: "deposit", title: "Account Pre-load", value: "+$45.00", date: "Jul 22, 2026", details: "Dummy balance seed" }
];

function mapWalletTx(tx: {
  id?: string;
  kind?: string;
  amount_coins?: number;
  amount_cash?: number | string;
  meta?: Record<string, unknown>;
  created_at?: string;
}) {
  const coins = Number(tx.amount_coins) || 0;
  const cash = Number(tx.amount_cash) || 0;
  let value = "—";
  if (coins !== 0) value = coins > 0 ? `+${coins} Coins` : `${coins} Coins`;
  else if (cash !== 0) value = cash > 0 ? `+$${cash.toFixed(2)}` : `-$${Math.abs(cash).toFixed(2)}`;

  const date = tx.created_at
    ? new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  const title =
    (typeof tx.meta?.title === "string" && tx.meta.title) ||
    (tx.kind ? tx.kind.replace(/_/g, " ") : "Transaction");

  const details =
    (typeof tx.meta?.details === "string" && tx.meta.details) ||
    (tx.meta && Object.keys(tx.meta).length ? JSON.stringify(tx.meta) : "");

  return {
    id: tx.id || `tx_${Date.now()}`,
    type: tx.kind || "system",
    title,
    value,
    date,
    details,
  };
}

export default function WalletExchange() {
  const router = useRouter();

  const [coins, setCoins] = useState(3480);
  const [cashWallet, setCashWallet] = useState(45.00);
  const [transactions, setTransactions] = useState(DEFAULT_TRANSACTIONS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{
          wallet?: { coins?: number; cash_balance?: number | string };
          transactions?: unknown[];
        }>("/api/me/wallet");
        if (cancelled) return;
        if (data.wallet) {
          setCoins(Number(data.wallet.coins) || 0);
          setCashWallet(Number(data.wallet.cash_balance) || 0);
        }
        if (Array.isArray(data.transactions) && data.transactions.length > 0) {
          setTransactions(data.transactions.map((tx) => mapWalletTx(tx as Parameters<typeof mapWalletTx>[0])));
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Modal / Input States
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("20");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const addTransaction = (type, title, value, details) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const newTx = {
      id: `tx_${Date.now()}`,
      type,
      title,
      value,
      date: formattedDate,
      details
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Add Money (Deposit) Action
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) {
      triggerToast("❌ Invalid deposit amount.");
      return;
    }

    try {
      const result = await apiSend<{
        wallet: { coins: number; cash_balance: string | number };
      }>("/api/me/wallet", "POST", {
        action: "deposit",
        amountCash: val,
      });
      setCashWallet(Number(result.wallet.cash_balance));
      addTransaction("deposit", "Deposited Funds", `+$${val.toFixed(2)}`, "Simulated Card Transaction");
      triggerToast(`💳 Deposited $${val.toFixed(2)} to Cash Wallet successfully!`);
      setShowDepositModal(false);
    } catch {
      triggerToast("Could not complete deposit.");
    }
  };

  // Buy Coins Action
  const handleBuyCoins = async (pack) => {
    if (cashWallet < pack.cost) {
      triggerToast("❌ Insufficient Cash Balance! Please deposit simulated funds first.");
      return;
    }

    try {
      const result = await apiSend<{
        wallet: { coins: number; cash_balance: string | number };
      }>("/api/me/wallet", "POST", {
        action: "buy_coins",
        packId: pack.id,
      });
      setCashWallet(Number(result.wallet.cash_balance));
      setCoins(Number(result.wallet.coins));
      addTransaction(
        "coin_buy",
        `Purchased ${pack.coins} Coins`,
        `-${pack.cost} Cash`,
        `Exchanged Cash to Coins (${pack.name})`
      );
      triggerToast(`🪙 Successfully purchased ${pack.coins.toLocaleString()} Coins!`);
    } catch {
      triggerToast("Could not purchase coin pack.");
    }
  };

  // Cash Out Coins Action
  const handleCashOut = async (exch) => {
    if (coins < exch.coins) {
      triggerToast("❌ Insufficient Coins to convert.");
      return;
    }

    try {
      const exchangeId =
        exch.coins === 1000 ? "out_1000" : exch.coins === 2000 ? "out_2000" : "out_5000";
      const result = await apiSend<{
        wallet: { coins: number; cash_balance: string | number };
      }>("/api/me/wallet", "POST", {
        action: "cash_out",
        exchangeId,
      });
      setCoins(Number(result.wallet.coins));
      setCashWallet(Number(result.wallet.cash_balance));
      addTransaction(
        "cashout",
        "Exchanged Coins to Cash",
        `+$${exch.value.toFixed(2)}`,
        `Converted ${exch.coins.toLocaleString()} Coins`
      );
      triggerToast(`💸 Successfully cashed out ${exch.coins.toLocaleString()} Coins for $${exch.value.toFixed(2)}!`);
    } catch {
      triggerToast("Could not cash out coins.");
    }
  };

  const clearHistory = () => {
    setTransactions([]);
    triggerToast("Transaction history cleared.");
  };

  return (
    <>
      
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
        
        {/* Wallet Overview Panel */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
          gap: 24, 
          marginBottom: 40 
        }}>
          
          {/* Card 1: Cash Balance */}
          <div style={{
            background: "linear-gradient(135deg, rgba(0,201,167,0.1) 0%, rgba(108,99,255,0.05) 100%)",
            border: "1.5px solid rgba(0,201,167,0.3)", borderRadius: 24, padding: 30,
            display: "flex", flexDirection: "column", justify: "space-between", gap: 20
          }}>
            <div>
              <div style={{ display: "flex", justify: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", fontWeight: 800, color: "#00c9a7" }}>
                  USD CASH WALLET
                </span>
                <Landmark size={20} color="#00c9a7" />
              </div>
              <h2 style={{ fontSize: 40, fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: "var(--text-main)", margin: "14px 0 4px" }}>
                ${cashWallet.toFixed(2)}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                Used to buy PathEd developer coins.
              </p>
            </div>
            
            <button
              onClick={() => setShowDepositModal(true)}
              style={{
                width: "100%", padding: "12px", borderRadius: 14, border: "none",
                background: "#00c9a7", color: "#fff", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: "0 6px 18px rgba(0,201,167,0.25)"
              }}
            >
              <Plus size={16} />
              <span>Add Cash Funds</span>
            </button>
          </div>

          {/* Card 2: Coins Balance */}
          <div style={{
            background: "linear-gradient(135deg, rgba(247,151,30,0.1) 0%, rgba(108,99,255,0.05) 100%)",
            border: "1.5px solid rgba(247,151,30,0.3)", borderRadius: 24, padding: 30,
            display: "flex", flexDirection: "column", justify: "space-between", gap: 20
          }}>
            <div>
              <div style={{ display: "flex", justify: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", fontWeight: 800, color: "#f7971e" }}>
                  COINS BANK
                </span>
                <Coins size={20} color="#f7971e" />
              </div>
              <h2 style={{ fontSize: 40, fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: "var(--text-main)", margin: "14px 0 4px" }}>
                {coins.toLocaleString()}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                Redeemable for premium roadmaps, packs & templates.
              </p>
            </div>

            <div style={{ fontSize: 13.5, color: "#f7971e", fontWeight: 700, textAlign: "center", padding: "10px", border: "1.5px dashed rgba(247,151,30,0.3)", borderRadius: 14 }}>
              Complete challenges daily to earn more!
            </div>
          </div>

        </div>

        {/* Exchange Options Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", lgLayout: "unset", gap: 32 }} className="wallet-grid">
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 1024px) {
              .wallet-grid {
                grid-template-columns: 1.6fr 1fr !important;
              }
            }
          `}} />

          {/* Left Column: Purchase Coin Packs */}
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)", margin: "0 0 20px" }}>
              🛒 Buy Coins (Spend Money → Receive Coins)
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
              {COIN_PACKS.map(pack => (
                <div 
                  key={pack.id} 
                  style={{
                    background: "var(--bg-card)", border: pack.popular ? "2px solid #6c63ff" : "1.5px solid var(--border-light)",
                    borderRadius: 20, padding: 22, display: "flex", flexDirection: "column", 
                    justifyContent: "space-between", gap: 16, position: "relative"
                  }}
                >
                  {pack.popular && (
                    <span style={{
                      position: "absolute", top: -12, right: 18, background: "#6c63ff", color: "#fff",
                      fontSize: 10.5, fontWeight: 900, fontFamily: "'Fira Code', monospace", padding: "4px 10px", borderRadius: 8
                    }}>
                      POPULAR
                    </span>
                  )}
                  
                  <div>
                    <div style={{ display: "flex", justify: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: 32 }}>🪙</span>
                      <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", fontWeight: 800, color: "var(--text-muted)" }}>
                        {pack.badge}
                      </span>
                    </div>

                    <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 850, margin: "10px 0 6px" }}>
                      {pack.coins.toLocaleString()} Coins
                    </h4>
                    <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4 }}>
                      Get {pack.coins.toLocaleString()} developer coins credited instantly to your bank.
                    </p>
                  </div>

                  <button
                    onClick={() => handleBuyCoins(pack)}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                      fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900, cursor: "pointer",
                      display: "flex", justify: "space-between", alignItems: "center"
                    }}
                  >
                    <span>Get Pack</span>
                    <span>${pack.cost} USD</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Convert back to Cash */}
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)", margin: "40px 0 20px" }}>
              💸 Exchange Coins (Convert Coins → Cash Credits)
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CASH_OUT_OPTIONS.map((exch, idx) => (
                <div 
                  key={idx} 
                  style={{
                    display: "flex", justify: "space-between", alignItems: "center",
                    background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                    borderRadius: 16, padding: "16px 20px"
                  }}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ fontSize: 24 }}>🔄</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 850, color: "var(--text-main)" }}>
                        Convert {exch.coins.toLocaleString()} Coins
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{exch.desc}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <strong style={{ color: "#00c9a7", fontSize: 16 }}>+${exch.value.toFixed(2)} USD</strong>
                    <button
                      onClick={() => handleCashOut(exch)}
                      style={{
                        padding: "8px 16px", borderRadius: 10, border: "1.5px solid var(--border-light)",
                        background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif",
                        fontSize: 13, fontWeight: 800, cursor: "pointer"
                      }}
                    >
                      Cash Out
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Transaction Logs */}
          <div style={{
            background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
            borderRadius: 24, padding: 26, display: "flex", flexDirection: "column", gap: 20
          }}>
            <div style={{ display: "flex", justify: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <FileText size={18} color="#6c63ff" />
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                  Transaction History
                </h3>
              </div>
              
              {transactions.length > 0 && (
                <button 
                  onClick={clearHistory}
                  style={{ background: "transparent", border: "none", color: "#ff6b6b", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700 }}
                >
                  <Trash2 size={13} /> Clear
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: "60vh" }} className="hide-scrollbar">
              {transactions.length === 0 ? (
                <div style={{ padding: "40px 10px", textAlign: "center", border: "1.5px dashed var(--border-light)", borderRadius: 16 }}>
                  <span style={{ fontSize: 24 }}>📭</span>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-muted)" }}>No transaction history found.</p>
                </div>
              ) : (
                transactions.map(tx => (
                  <div 
                    key={tx.id} 
                    style={{
                      background: "var(--bg-alt)", border: "1px solid var(--border-light)",
                      borderRadius: 14, padding: 12, display: "flex", justify: "space-between", alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)" }}>{tx.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{tx.details} · {tx.date}</div>
                    </div>
                    
                    <span style={{ 
                      fontSize: 13, fontFamily: "'Fira Code', monospace", fontWeight: 800,
                      color: tx.value.startsWith("+") ? "#00c9a7" : "#ff6b6b"
                    }}>
                      {tx.value}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>


      {/* ==================== GLOBAL MODAL: DEPOSIT FUNDS FORM ==================== */}
      <AnimatePresence>
        {showDepositModal && (
          <div 
            onClick={e => { if (e.target === e.currentTarget) setShowDepositModal(false); }}
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
                background: "var(--bg-card)", borderRadius: 24, maxWidth: 460, width: "100%",
                border: "1.5px solid var(--border-light)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                overflow: "hidden"
              }}
            >
              <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
                  💳 Deposit USD Cash Credits
                </h4>
                <button 
                  onClick={() => setShowDepositModal(false)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-main)", fontSize: 20 }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                
                <div style={{ display: "flex", gap: 10, padding: 12, borderRadius: 12, background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.1)", fontSize: 12.5, color: "#00c9a7", lineHeight: 1.4 }}>
                  <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>This is a simulated checkout gateway. No real money will be charged to your card.</span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>DEPOSIT AMOUNT ($ USD)</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="1000"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>CARD NUMBER</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}
                  />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>EXPIRY DATE</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>CVV / CVC</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button 
                    type="button"
                    onClick={() => setShowDepositModal(false)}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{ flex: 1.5, padding: "10px", borderRadius: 10, border: "none", background: "#00c9a7", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900, cursor: "pointer" }}
                  >
                    Authorize Deposit
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence></>
  );
}
