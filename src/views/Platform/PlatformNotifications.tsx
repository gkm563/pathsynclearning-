"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { 
  Bell, ArrowLeft, Trash2, CheckCircle2, AlertCircle, Sparkles, 
  MessageSquare, UserPlus, Trophy, Calendar, RefreshCw, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiSend } from "@/lib/api";

const DEFAULT_NOTIFICATIONS = [
  {
    id: "n1",
    type: "challenge",
    title: "Daily SDE Challenge Dropped",
    desc: "Solve 'Subarray Sum Equals K' using Prefix Sum before midnight to preserve your 7-day streak!",
    time: "20m ago",
    read: false,
    icon: "⚡",
    color: "#6c63ff",
    bg: "rgba(108,99,255,0.08)",
    bdr: "rgba(108,99,255,0.25)"
  },
  {
    id: "n2",
    type: "invite",
    title: "HackSquad Invitation Received",
    desc: "Siddharth (IIT-K) invited you to join team 'CodeBlox' for HackAttack '26.",
    time: "2h ago",
    read: false,
    icon: "⚔️",
    color: "#e040fb",
    bg: "rgba(224,64,251,0.08)",
    bdr: "rgba(224,64,251,0.25)",
    actionable: true,
    teamName: "CodeBlox"
  },
  {
    id: "n3",
    type: "mentor",
    title: "Code Review Comments",
    desc: "Aarav Mehta (SDE 2 @ Google) left 3 suggestions on your Distributed Chat App socket connector logic.",
    time: "4h ago",
    read: true,
    icon: "🧑‍🏫",
    color: "#00c9a7",
    bg: "rgba(0,201,167,0.08)",
    bdr: "rgba(0,201,167,0.25)"
  },
  {
    id: "n4",
    type: "event",
    title: "RSVP Confirmed: System Design Masterclass",
    desc: "Your session with Sophia Vance on high-concurrency database partitioned scale starts tomorrow at 6 PM.",
    time: "1d ago",
    read: true,
    icon: "📅",
    color: "#f7971e",
    bg: "rgba(247,151,30,0.08)",
    bdr: "rgba(247,151,30,0.25)"
  },
  {
    id: "n5",
    type: "system",
    title: "Profile Milestone Achieved",
    desc: "You completed your Professional DNA Profile calibration and unlocked 250 platform Coins!",
    time: "3d ago",
    read: true,
    icon: "🏆",
    color: "#1677ff",
    bg: "rgba(22,119,255,0.08)",
    bdr: "rgba(22,119,255,0.25)"
  }
];

export default function PlatformNotifications() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>(DEFAULT_NOTIFICATIONS);
  const [filter, setFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await apiGet<{ notifications: any[] }>("/api/me/notifications");
        if (!cancelled && data.notifications?.length) {
          setNotifications(data.notifications);
        }
      } catch {
        if (!cancelled) setNotifications(DEFAULT_NOTIFICATIONS);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await apiSend("/api/me/notifications", "PATCH", { markAllRead: true });
    } catch {
      // keep UI state
    }
    triggerToast("✅ Marked all notifications as read!");
  };

  const handleClearAll = () => {
    setNotifications([]);
    triggerToast("🗑️ Notifications cleared.");
  };

  const handleDeleteItem = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAcceptInvite = (id, teamName) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          actionable: false,
          desc: `You accepted Siddharth's invitation to join team '${teamName}'.`,
          read: true
        };
      }
      return n;
    }));
    triggerToast(`⚔️ Successfully joined team '${teamName}'!`);
  };

  const handleDeclineInvite = (id) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          actionable: false,
          desc: "You declined the team invitation.",
          read: true
        };
      }
      return n;
    }));
    triggerToast("Declined invitation.");
  };

  const filteredList = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "invites") return n.type === "invite";
    if (filter === "mentor") return n.type === "mentor";
    return true;
  });

  return (
    <>{/* ==================== TOAST ALERT ==================== */}
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

      <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60 }}>

        {/* ==================== HEADER CARD ==================== */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, padding: "20px 24px",
          background: "var(--bg-card)", borderRadius: 24,
          border: "1.5px solid var(--border-light)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 900, color: "var(--text-main)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <Bell size={26} color="#6c63ff" />
                Notification <span style={{ color: "#6c63ff" }}>Center</span>
              </h1>
              <span style={{
                padding: "4px 12px", borderRadius: 14,
                background: "rgba(108, 99, 255, 0.12)", border: "1px solid #6c63ff50",
                color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900
              }}>
                ✦ PLATFORM DISPATCHES
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 16, color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
              Review SDE challenges updates, hackathon team requests, and direct mentor codespace revisions.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleMarkAllRead}
              disabled={notifications.length === 0}
              style={{
                padding: "10px 16px", borderRadius: 12, border: "1.5px solid var(--border-light)",
                background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif",
                fontSize: 13.5, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                opacity: notifications.length === 0 ? 0.5 : 1
              }}
            >
              <CheckCircle2 size={14} color="#00c9a7" /> Mark all read
            </button>
            <button
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              style={{
                padding: "10px 16px", borderRadius: 12, border: "none",
                background: "rgba(255, 68, 68, 0.1)", color: "#ff6b6b", fontFamily: "'Outfit', sans-serif",
                fontSize: 13.5, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                opacity: notifications.length === 0 ? 0.5 : 1
              }}
            >
              <Trash2 size={14} /> Clear all
            </button>
          </div>
        </div>

        {/* ==================== FILTERS & LIST VIEW ==================== */}
        <div style={{ background: "var(--bg-card)", borderRadius: 24, border: "1.5px solid var(--border-light)", padding: 24 }}>
          
          {/* Sub Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 6 }} className="hide-scrollbar">
            {[
              { id: "all", label: "All Logs" },
              { id: "unread", label: `Unread (${notifications.filter(n=>!n.read).length})` },
              { id: "invites", label: "Collab Invites" },
              { id: "mentor", label: "Mentor Feedback" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
                  background: filter === f.id ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                  color: filter === f.id ? "#6c63ff" : "var(--text-muted)"
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <AnimatePresence initial={false}>
              {filteredList.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  style={{
                    padding: 20, borderRadius: 18, background: n.read ? "var(--bg-alt)" : "var(--bg-card)",
                    border: `1.5px solid ${n.read ? "var(--border-light)" : n.bdr}`,
                    display: "flex", gap: 16, alignItems: "flex-start", position: "relative"
                  }}
                >
                  {/* Read/Unread dot indicator */}
                  {!n.read && (
                    <span style={{ position: "absolute", top: 12, left: 12, width: 7, height: 7, borderRadius: "50%", background: "#6c63ff" }} />
                  )}

                  {/* Icon Frame */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: n.bg, border: `1px solid ${n.bdr}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0
                  }}>
                    {n.icon}
                  </div>

                  {/* Body Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justify: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 900, color: "var(--text-main)" }}>
                        {n.title}
                      </h4>
                      <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-light)" }}>{n.time}</span>
                    </div>

                    <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
                      {n.desc}
                    </p>

                    {/* Actionable buttons (HackSquad invite accept/decline) */}
                    {n.actionable && (
                      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <button
                          onClick={() => handleAcceptInvite(n.id, n.teamName)}
                          style={{
                            padding: "6px 14px", borderRadius: 8, border: "none",
                            background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                            fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 900, cursor: "pointer"
                          }}
                        >
                          Accept Invite
                        </button>
                        <button
                          onClick={() => handleDeclineInvite(n.id)}
                          style={{
                            padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border-light)",
                            background: "var(--bg-alt)", color: "var(--text-muted)",
                            fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer"
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Remove specific item */}
                  <button
                    onClick={() => handleDeleteItem(n.id)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-light)", padding: 4 }}
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>

                </motion.div>
              ))}

              {filteredList.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  <Bell size={32} color="var(--text-light)" style={{ margin: "0 auto 10px", opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: 14 }}>No notifications found matching filter.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div></>
  );
}
