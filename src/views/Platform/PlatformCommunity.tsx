"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, MessageSquare, Heart, Bookmark, Share2, Search, PlusCircle, 
  Send, Sparkles, Award, Calendar, Bell, ChevronRight, X, ArrowUpRight, 
  ShieldCheck, Terminal, Hash, MessageCircle, AlertCircle, PlayCircle
} from "lucide-react";

// Mock Database of Channels
const CHANNELS_POOL = [
  { id: "general-sde", label: "general-sde", icon: "💬", desc: "General software engineering, industry trends, and SDE advice." },
  { id: "dsa-questions", label: "dsa-questions", icon: "⚔️", desc: "Solving algorithms, optimization hacks, and LeetCode discussions." },
  { id: "system-design", label: "system-design", icon: "🏗️", desc: "Scalability, microservices architecture, caching, and DB partitioning." },
  { id: "referral-board", label: "referral-board", icon: "💼", desc: "Active hiring opportunities, referrals, and candidate profile lists." },
  { id: "project-partners", label: "project-partners", icon: "🤝", desc: "Find co-founders, team up for hackathons, and review repositories." },
  { id: "announcements", label: "announcements", icon: "📢", desc: "Official updates, leaderboard prizes, and weekly summits announcements." }
];

// Mock Database of Community Posts
const INITIAL_POSTS = [
  {
    id: "p1",
    channel: "general-sde",
    authorName: "Amit Shah",
    authorTitle: "Staff Engineer @ Uber",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    isMentor: true,
    time: "2 hours ago",
    content: "For SDE-2 interviews, companies are looking for deep concurrency knowledge. If you're designing a rate limiter, don't just say Token Bucket—explain race conditions in Redis Lua scripts and how to resolve them using sorted sets to prevent concurrency locks.",
    tags: ["concurrency", "redis", "ratelimiting"],
    upvotes: 245,
    userHasUpvoted: false,
    userHasBookmarked: false,
    comments: [
      { id: "c1_1", author: "Rahul Kushwaha", text: "This is gold! I struggled with Lua script transaction bounds in my last interview at Razorpay." },
      { id: "c1_2", author: "Priya S.", text: "Do you recommend reading the Redis official documentation or any specific SDE blog for this?" }
    ]
  },
  {
    id: "p2",
    channel: "dsa-questions",
    authorName: "Meera Nair",
    authorTitle: "LeetCode Elite (2100+)",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    isMentor: false,
    time: "4 hours ago",
    content: "Fascinating optimization on LeetCode 42 (Trapping Rain Water). You can solve it in O(N) time and O(1) space using the two-pointer approach, avoiding the prefix/suffix array allocations entirely! Here's a brief breakdown:",
    codeSnippet: `int trap(vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int leftMax = 0, rightMax = 0, ans = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            height[left] >= leftMax ? leftMax = height[left] : ans += leftMax - height[left];
            left++;
        } else {
            height[right] >= rightMax ? rightMax = height[right] : ans += rightMax - height[right];
            right--;
        }
    }
    return ans;
}`,
    tags: ["dsa", "leetcode", "vectors", "pointers"],
    upvotes: 188,
    userHasUpvoted: false,
    userHasBookmarked: true,
    comments: []
  },
  {
    id: "p3",
    channel: "referral-board",
    authorName: "Sarah Connor",
    authorTitle: "Recruiter @ Razorpay",
    authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
    isMentor: true,
    time: "6 hours ago",
    content: "We are hiring SDE-1 backend interns! Core requirements are strong database transaction knowledge and proficiency in Node.js or Go. Drop your PathEd Public Profile link below, prioritizing those with a CRI score of 70%+!",
    tags: ["hiring", "backend", "internship", "referrals"],
    upvotes: 312,
    userHasUpvoted: false,
    userHasBookmarked: false,
    comments: [
      { id: "c3_1", author: "Rahul Kushwaha", text: "Just applied! My profile: pathed.ai/p/rahul-kushwaha. CRI score is currently 62% but upgrading to 75% tonight." }
    ]
  },
  {
    id: "p4",
    channel: "system-design",
    authorName: "David Vance",
    authorTitle: "Principal Architect @ Stripe",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    isMentor: true,
    time: "1 day ago",
    content: "Stripe's idempotency key pattern is a must-know. When client retries occur, we log responses in a fast DB index using hash keys. This guarantees that double charges never happen under unstable client network links.",
    tags: ["systemdesign", "idempotency", "payments", "microservices"],
    upvotes: 402,
    userHasUpvoted: true,
    userHasBookmarked: false,
    comments: []
  }
];

// Mock Top Contributors
const CONTRIBUTORS = [
  { rank: 1, name: "Dr. Arpan Mukherjee", title: "Professor @ IIT Kanpur", points: "2,450", color: "#f59e0b" },
  { rank: 2, name: "David Vance", title: "Principal @ Stripe", points: "1,980", color: "#6c63ff" },
  { rank: 3, name: "Meera Nair", title: "Leetcode Elite", points: "1,540", color: "#00c9a7" },
  { rank: 4, name: "Rohan Verma", title: "SDE @ Google", points: "1,220", color: "#38bdf8" }
];

// Mock AMAs / Events
const UPCOMING_EVENTS = [
  { id: "e1", title: "Google SDE Concurrency Q&A", time: "Tonight at 8:00 PM", host: "Aarav Mehta (Google)" },
  { id: "e2", title: "System Design: Scaling Redis Caches", time: "Saturday @ 3:00 PM", host: "Dr. Mukherjee" }
];

export default function PlatformCommunity() {
  const router = useRouter();

  // Selected Channel ID
  const [selectedChannel, setSelectedChannel] = useState("general-sde");

  // Post Feed Database state
  const [posts, setPosts] = useState(INITIAL_POSTS);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Feed Filter type: 'trending' | 'latest' | 'bookmarked'
  const [feedFilter, setFeedFilter] = useState("trending");

  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [newPostChannel, setNewPostChannel] = useState("general-sde");
  const [newPostCode, setNewPostCode] = useState("");

  // Expand Comments state (holds post IDs)
  const [expandedComments, setExpandedComments] = useState<Record<string, any>>({});
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, any>>({});

  // Event reminders (reminded event IDs)
  const [remindedEvents, setRemindedEvents] = useState<any[]>([]);

  // Filter posts based on channel, search, and feedFilter
  const getFilteredPosts = () => {
    return posts.filter(post => {
      // 1. Channel match
      if (post.channel !== selectedChannel) return false;

      // 2. Search query match
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const contentMatch = post.content.toLowerCase().includes(q);
        const authorMatch = post.authorName.toLowerCase().includes(q);
        const tagMatch = post.tags.some(tag => tag.toLowerCase().includes(q));
        if (!contentMatch && !authorMatch && !tagMatch) return false;
      }

      // 3. Feed filter match
      if (feedFilter === "bookmarked" && !post.userHasBookmarked) return false;

      return true;
    }).sort((a, b) => {
      if (feedFilter === "trending") {
        return b.upvotes - a.upvotes;
      }
      // 'latest' or 'bookmarked' -> return by ID order (newest first)
      return b.id.localeCompare(a.id);
    });
  };

  // Upvote handler
  const handleUpvote = (postId) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const increment = post.userHasUpvoted ? -1 : 1;
        return {
          ...post,
          upvotes: post.upvotes + increment,
          userHasUpvoted: !post.userHasUpvoted
        };
      }
      return post;
    }));
  };

  // Bookmark handler
  const handleBookmark = (postId) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          userHasBookmarked: !post.userHasBookmarked
        };
      }
      return post;
    }));
  };

  // Add Comment handler
  const handleAddComment = (e, postId) => {
    e.preventDefault();
    const commentText = newCommentTexts[postId];
    if (!commentText || !commentText.trim()) return;

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `c_${postId}_${post.comments.length + 1}`,
              author: "Rahul Kushwaha",
              text: commentText.trim()
            }
          ]
        };
      }
      return post;
    }));

    setNewCommentTexts(prev => ({ ...prev, [postId]: "" }));
  };

  // Create Post Submit
  const handleCreatePostSubmit = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      alert("Post content cannot be empty.");
      return;
    }

    const tagsArray = newPostTags
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const newPost = {
      id: `p_user_${Date.now()}`,
      channel: newPostChannel,
      authorName: "Rahul Kushwaha",
      authorTitle: "IIT Kanpur · CRI 62%",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      isMentor: false,
      time: "Just now",
      content: newPostContent.trim(),
      codeSnippet: newPostCode.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : ["general"],
      upvotes: 1,
      userHasUpvoted: true,
      userHasBookmarked: false,
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
    setShowCreateModal(false);
    setSelectedChannel(newPostChannel); // Switch to the channel posted to
    setNewPostContent("");
    setNewPostTags("");
    setNewPostCode("");
  };

  // Toggle AMA Reminder
  const toggleReminder = (eventId, eventTitle) => {
    if (remindedEvents.includes(eventId)) {
      setRemindedEvents(prev => prev.filter(id => id !== eventId));
      alert(`🔔 Reminder removed for "${eventTitle}".`);
    } else {
      setRemindedEvents(prev => [...prev, eventId]);
      alert(`🔔 Reminder scheduled! We'll alert you 10 minutes before "${eventTitle}" starts.`);
    }
  };

  const activeChannelObj = CHANNELS_POOL.find(c => c.id === selectedChannel);

  return (
    <><div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 10px 40px" }}>
        
        {/* ==================== PAGE HEADER ==================== */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 34, fontWeight: 900, color: "var(--text-main)", margin: 0, letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={34} color="#6c63ff" />
              Developer Forum
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 16, color: "var(--text-muted)", fontWeight: 500 }}>
              Discuss system designs, debug codeblocks, and ask career questions to verified tech mentors.
            </p>
          </div>

          <button
            onClick={() => {
              setNewPostChannel(selectedChannel);
              setShowCreateModal(true);
            }}
            style={{
              padding: "12px 24px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
              fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 900,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 6px 20px rgba(108,99,255,0.25)"
            }}
          >
            <PlusCircle size={18} />
            <span>Create New Post</span>
          </button>
        </div>

        {/* ==================== MAIN SECTION GRID ==================== */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          lgLayout: "unset",
          gap: 28
        }} className="community-grid">
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 1024px) {
              .community-grid {
                grid-template-columns: 240px 1fr 300px !important;
              }
            }
          `}} />

          {/* ──── LEFT PANEL: CHANNELS SIDEBAR ──── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
              background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
              borderRadius: 22, padding: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.02)"
            }}>
              <h4 style={{ margin: "0 0 14px 0", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 0.5 }}>
                COMMUNITY SPACES
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {CHANNELS_POOL.map(chan => {
                  const isSelected = selectedChannel === chan.id;
                  return (
                    <button
                      key={chan.id}
                      onClick={() => {
                        setSelectedChannel(chan.id);
                        setFeedFilter("trending"); // Reset filters
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%",
                        padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                        background: isSelected ? "rgba(108,99,255,0.1)" : "transparent",
                        color: isSelected ? "#6c63ff" : "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: isSelected ? 800 : 500,
                        textAlign: "left", transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--bg-alt)"; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: 16 }}>{chan.icon}</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chan.label}</span>
                      {isSelected && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6c63ff" }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, rgba(108, 99, 255, 0.08) 0%, rgba(0, 201, 167, 0.08) 100%)",
              border: "1.5px solid rgba(108,99,255,0.2)", borderRadius: 22, padding: 20
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Sparkles size={16} color="#6c63ff" />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text-main)", fontFamily: "'Outfit', sans-serif" }}>Mentor Connect</span>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.45 }}>
                Mentors from Uber, Google, and Stripe answer threads marked with their tech-tags daily.
              </p>
            </div>
          </div>

          {/* ──── MIDDLE PANEL: FEED & DISCUSSIONS ──── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Channel Info Card */}
            {activeChannelObj && (
              <div style={{
                background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                borderRadius: 22, padding: "20px 24px", boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{activeChannelObj.icon}</span>
                    <h2 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 900, color: "var(--text-main)" }}>
                      #{activeChannelObj.label}
                    </h2>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 14.5, color: "var(--text-muted)", fontWeight: 500 }}>
                    {activeChannelObj.desc}
                  </p>
                </div>
                <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "6px 12px", textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#00c9a7", fontFamily: "'Fira Code', monospace" }}>● ONLINE</div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-main)" }}>142 online</div>
                </div>
              </div>
            )}

            {/* Filter & Search Bar Row */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
                <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search threads inside #${selectedChannel}...`}
                  style={{
                    width: "100%", padding: "11px 16px 11px 40px", borderRadius: 14,
                    background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                    color: "var(--text-main)", outline: "none", fontSize: 14.5,
                    fontFamily: "'Outfit', sans-serif", transition: "all 0.2s"
                  }}
                />
              </div>

              {/* Feed Filters switcher */}
              <div style={{ display: "flex", background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", padding: 4, borderRadius: 14, gap: 4 }}>
                {[
                  { id: "trending", label: "Trending" },
                  { id: "latest", label: "Latest" },
                  { id: "bookmarked", label: "Bookmarks" }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFeedFilter(f.id)}
                    style={{
                      padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                      fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, transition: "all 0.2s",
                      background: feedFilter === f.id ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                      color: feedFilter === f.id ? "#ffffff" : "var(--text-muted)"
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Post Fast Callout */}
            <div 
              onClick={() => {
                setNewPostChannel(selectedChannel);
                setShowCreateModal(true);
              }}
              style={{
                background: "var(--bg-card)", border: "1.5px dashed var(--border-light)",
                borderRadius: 22, padding: "18px 24px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyItems: "center", gap: 12,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6c63ff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; }}
            >
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" 
                alt="user avatar" 
                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} 
              />
              <span style={{ fontSize: 14.5, color: "var(--text-muted)", flex: 1, fontFamily: "'Outfit', sans-serif" }}>
                What technical insights or questions do you want to share inside #{selectedChannel}?
              </span>
              <PlusCircle size={20} color="#6c63ff" />
            </div>

            {/* Feed Posts listing */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {getFilteredPosts().length === 0 ? (
                <div style={{ padding: "80px 20px", textAlign: "center", background: "var(--bg-card)", border: "1.5px dashed var(--border-light)", borderRadius: 24 }}>
                  <span style={{ fontSize: 32 }}>🧭</span>
                  <h3 style={{ margin: "10px 0 4px", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
                    Empty Space
                  </h3>
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-muted)", fontWeight: 500 }}>
                    No posts matched the filters inside this channel. Create a new thread to start discussions!
                  </p>
                </div>
              ) : (
                getFilteredPosts().map(post => {
                  const isCommentsOpen = !!expandedComments[post.id];
                  const currentCommentText = newCommentTexts[post.id] || "";

                  return (
                    <div
                      key={post.id}
                      style={{
                        background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                        borderRadius: 22, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.01)",
                        display: "flex", flexDirection: "column", gap: 14
                      }}
                    >
                      {/* Post Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <img 
                            src={post.authorAvatar} 
                            alt={post.authorName} 
                            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: post.isMentor ? "2px solid #6c63ff" : "1px solid var(--border-light)" }} 
                          />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>{post.authorName}</span>
                              {post.isMentor && (
                                <span style={{
                                  padding: "2px 8px", borderRadius: 6, background: "rgba(108,99,255,0.12)",
                                  border: "1px solid #6c63ff50", color: "#6c63ff", fontSize: 9.5,
                                  fontWeight: 900, fontFamily: "'Fira Code', monospace"
                                }}>
                                  ✦ MENTOR
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>{post.authorTitle} · {post.time}</span>
                          </div>
                        </div>

                        {/* Bookmark Button */}
                        <button
                          onClick={() => handleBookmark(post.id)}
                          style={{
                            background: "transparent", border: "none", cursor: "pointer",
                            color: post.userHasBookmarked ? "#f7971e" : "var(--text-light)",
                            transition: "color 0.2s"
                          }}
                        >
                          <Bookmark size={18} fill={post.userHasBookmarked ? "#f7971e" : "transparent"} />
                        </button>
                      </div>

                      {/* Post Content */}
                      <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-main)", lineHeight: 1.6, fontWeight: 500, whiteSpace: "pre-line" }}>
                        {post.content}
                      </p>

                      {/* Code Snippet Box (if provided) */}
                      {post.codeSnippet && (
                        <div style={{
                          background: "#0f172a", borderRadius: 12, padding: 14,
                          border: "1px solid rgba(255,255,255,0.1)", overflowX: "auto"
                        }}>
                          <code style={{
                            fontFamily: "'Fira Code', monospace", fontSize: 12.5,
                            color: "#e2e8f0", whiteSpace: "pre", display: "block",
                            lineHeight: 1.5
                          }}>
                            {post.codeSnippet}
                          </code>
                        </div>
                      )}

                      {/* Post Tags */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 12, background: "var(--bg-alt)", border: "1px solid var(--border-light)",
                              color: "#6c63ff", padding: "3px 10px", borderRadius: 8, fontWeight: 800
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Post Footer Actions */}
                      <div style={{
                        display: "flex", gap: 18, borderTop: "1px solid var(--border-light)",
                        paddingTop: 12, marginTop: 4
                      }}>
                        {/* Upvote Action */}
                        <button
                          onClick={() => handleUpvote(post.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6, background: "transparent",
                            border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 800,
                            color: post.userHasUpvoted ? "#ec4899" : "var(--text-muted)",
                            transition: "all 0.2s"
                          }}
                        >
                          <Heart size={16} fill={post.userHasUpvoted ? "#ec4899" : "transparent"} />
                          <span>{post.upvotes} Upvotes</span>
                        </button>

                        {/* Comment Action */}
                        <button
                          onClick={() => {
                            setExpandedComments(prev => ({
                              ...prev,
                              [post.id]: !prev[post.id]
                            }));
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: 6, background: "transparent",
                            border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 800,
                            color: isCommentsOpen ? "#6c63ff" : "var(--text-muted)",
                            transition: "all 0.2s"
                          }}
                        >
                          <MessageSquare size={16} />
                          <span>{post.comments.length} Comments</span>
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`pathed.ai/community/post/${post.id}`);
                            alert("🔗 Direct link copied to clipboard!");
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: 6, background: "transparent",
                            border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 800,
                            color: "var(--text-muted)", transition: "all 0.2s"
                          }}
                        >
                          <Share2 size={15} />
                          <span>Share</span>
                        </button>
                      </div>

                      {/* Expandable Comments Drawer Area */}
                      <AnimatePresence>
                        {isCommentsOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                              overflow: "hidden", display: "flex", flexDirection: "column", gap: 12,
                              background: "var(--bg-alt)", borderRadius: 16, padding: 16,
                              border: "1px solid var(--border-light)", marginTop: 10
                            }}
                          >
                            <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
                              Thread Comments
                            </span>

                            {post.comments.length === 0 ? (
                              <p style={{ margin: 0, fontSize: 13, color: "var(--text-light)", fontStyle: "italic" }}>
                                No comments posted yet. Write one below to join the discussion.
                              </p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {post.comments.map(c => (
                                  <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "var(--bg-card)", padding: 10, borderRadius: 10, border: "1px solid var(--border-light)" }}>
                                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#6c63ff30", color: "#6c63ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>
                                      {c.author[0]}
                                    </span>
                                    <div>
                                      <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-main)", marginBottom: 2 }}>{c.author}</div>
                                      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4, fontWeight: 500 }}>{c.text}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Comment input */}
                            <form
                              onSubmit={(e) => handleAddComment(e, post.id)}
                              style={{ display: "flex", gap: 8, marginTop: 6 }}
                            >
                              <input 
                                type="text"
                                value={currentCommentText}
                                onChange={e => setNewCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                placeholder="Type your comment reply..."
                                style={{
                                  flex: 1, padding: "8px 12px", borderRadius: 8,
                                  background: "var(--bg-card)", border: "1px solid var(--border-light)",
                                  color: "var(--text-main)", fontSize: 13, outline: "none",
                                  fontFamily: "'Outfit', sans-serif"
                                }}
                              />
                              <button
                                type="submit"
                                style={{
                                  padding: "8px 14px", borderRadius: 8, border: "none",
                                  background: "#6c63ff", color: "#fff", cursor: "pointer",
                                  display: "flex", alignItems: "center", justifyItems: "center"
                                }}
                              >
                                <Send size={13} />
                              </button>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* ──── RIGHT PANEL: LEADERBOARD & LIVE EVENT WIDGETS ──── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Contributor Leaderboard */}
            <div style={{
              background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
              borderRadius: 22, padding: 22, boxShadow: "0 8px 24px rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <Award size={20} color="#f59e0b" />
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                  Weekly Contributors
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {CONTRIBUTORS.map(con => (
                  <div 
                    key={con.rank} 
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      paddingBottom: 10, borderBottom: con.rank === 4 ? "none" : "1px solid var(--border-light)"
                    }}
                  >
                    <span style={{ 
                      width: 24, height: 24, borderRadius: "50%", 
                      background: con.rank === 1 ? "rgba(245,158,11,0.15)" : con.rank === 2 ? "rgba(108,99,255,0.15)" : "var(--bg-alt)",
                      color: con.rank === 1 ? "#f59e0b" : con.rank === 2 ? "#6c63ff" : "var(--text-muted)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 900
                    }}>
                      {con.rank}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text-main)" }}>{con.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{con.title}</div>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 900, color: con.color }}>{con.points} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming AMAs & Live events */}
            <div style={{
              background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
              borderRadius: 22, padding: 22, boxShadow: "0 8px 24px rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <Calendar size={18} color="#6c63ff" />
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                  Upcoming Live AMAs
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {UPCOMING_EVENTS.map(ev => {
                  const isReminded = remindedEvents.includes(ev.id);
                  return (
                    <div 
                      key={ev.id} 
                      style={{
                        background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                        borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 8
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text-main)", lineHeight: 1.4 }}>{ev.title}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{ev.time} · Host: {ev.host}</div>
                      </div>

                      <button
                        onClick={() => toggleReminder(ev.id, ev.title)}
                        style={{
                          width: "100%", padding: "8px", borderRadius: 8,
                          border: isReminded ? "1.5px solid #00c9a7" : "1.5px solid var(--border-light)",
                          background: isReminded ? "rgba(0,201,167,0.06)" : "var(--bg-card)",
                          color: isReminded ? "#00c9a7" : "var(--text-main)",
                          fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 800,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          transition: "all 0.2s"
                        }}
                      >
                        <Bell size={12} color={isReminded ? "#00c9a7" : "var(--text-muted)"} fill={isReminded ? "#00c9a7" : "transparent"} />
                        <span>{isReminded ? "Reminder Set" : "Notify Me"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* ==================== CREATE POST MODAL ==================== */}
        <AnimatePresence>
          {showCreateModal && (
            <div 
              onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
              style={{
                position: "fixed", inset: 0, zIndex: 1300,
                background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 24 }}
                style={{
                  background: "var(--bg-card)", borderRadius: 24, maxWidth: 660, width: "100%",
                  border: "1.5px solid var(--border-light)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                  overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
                }}
              >
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)" }}>
                    🏗️ Create Community Thread
                  </h4>
                  <button onClick={() => setShowCreateModal(false)} style={{ position: "absolute", right: 20, top: 20, width: 32, height: 32, borderRadius: 10, border: "none", background: "var(--bg-alt)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)", fontSize: 20 }}>
                    ×
                  </button>
                </div>

                <form onSubmit={handleCreatePostSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  
                  {/* Select Channel */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>TARGET SPACE CHANNEL</label>
                    <select
                      value={newPostChannel}
                      onChange={e => setNewPostChannel(e.target.value)}
                      style={{
                        width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)",
                        border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none",
                        fontFamily: "'Outfit', sans-serif", fontSize: 13.5
                      }}
                    >
                      {CHANNELS_POOL.map(c => (
                        <option key={c.id} value={c.id}>#{c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Post Content */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>THREAD DESCRIPTION CONTENT</label>
                    <textarea
                      required
                      rows={5}
                      value={newPostContent}
                      onChange={e => setNewPostContent(e.target.value)}
                      placeholder="Write your technical explanation, bug report, or career advice queries here..."
                      style={{
                        width: "100%", borderRadius: 10, background: "var(--bg-alt)",
                        border: "1.5px solid var(--border-light)", color: "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14, padding: 12, outline: "none", resize: "none"
                      }}
                    />
                  </div>

                  {/* Optional Code Snippet */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>ATTACH CODE BLOCK (OPTIONAL)</label>
                    <textarea
                      rows={3}
                      value={newPostCode}
                      onChange={e => setNewPostCode(e.target.value)}
                      placeholder="Paste code blocks or execution outputs..."
                      style={{
                        width: "100%", borderRadius: 10, background: "var(--bg-alt)",
                        border: "1.5px solid var(--border-light)", color: "var(--text-main)",
                        fontFamily: "'Fira Code', monospace", fontSize: 12.5, padding: 12, outline: "none", resize: "none"
                      }}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>TOPIC TAGS (COMMA SEPARATED)</label>
                    <input
                      type="text"
                      value={newPostTags}
                      onChange={e => setNewPostTags(e.target.value)}
                      placeholder="e.g. systemdesign, redis, caching"
                      style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button 
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      style={{ flex: 1.5, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, cursor: "pointer" }}
                    >
                      Publish Thread Post
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div></>
  );
}
