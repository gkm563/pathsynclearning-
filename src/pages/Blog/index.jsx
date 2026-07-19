import React from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip } from "../../components/ui/Shared";

export default function Blog() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  const blogs = [
    {
      title: "Why 90% Mastery is the New Passing Grade",
      desc: "Scraping by with a 40% doesn't work in the real world. Discover why PathEd enforces a strict 90% mastery threshold before unlocking new skills.",
      img: "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&w=800&q=80",
      tag: "PEDAGOGY", color: "#6c63ff", bg: "#f0f0ff", border: "#d8d4ff"
    },
    {
      title: "The End of Syllabus Misalignment in B.Tech",
      desc: "University syllabi are organized by academic discipline, not by industry job roles. Here is how we are mapping degrees directly to career outcomes.",
      img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      tag: "INDUSTRY", color: "#00c9a7", bg: "#e8faf5", border: "#b2eed9"
    },
    {
      title: "How CRI is Replacing the Traditional CGPA",
      desc: "Beyond exam scores, there is no reliable metric to measure actual readiness. Enter the Career Readiness Index (CRI)—a holistic 0-100 score.",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      tag: "METRICS", color: "#f7971e", bg: "#fff9e6", border: "#ffe08a"
    },
    {
      title: "Understanding Career Fusion Logic",
      desc: "Changing your target career midway shouldn't mean starting over. Learn how our fusion logic maps previously mastered skills to new paths.",
      img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
      tag: "ARCHITECTURE", color: "#9c27b0", bg: "#fdf0ff", border: "#e8b3ff"
    },
    {
      title: "The Importance of Learning Memory in Engineering",
      desc: "Skills mastered in one semester are often forgotten. PathEd creates a persistent, chronological record of your academic life.",
      img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
      tag: "RETENTION", color: "#6c63ff", bg: "#f0f0ff", border: "#d8d4ff"
    },
    {
      title: "Building a Career-Centric Degree from Day One",
      desc: "Meaningful career planning is often postponed until the final year. We are shifting preparation to day one of your B.Tech journey.",
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
      tag: "VISION", color: "#00c9a7", bg: "#e8faf5", border: "#b2eed9"
    }
  ];

  return (
    <div style={{ background: "#fcfdff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      {/* 1. Hero Section */}
      <section style={{ paddingTop: 180, paddingBottom: 80, textAlign: "center", maxWidth: 1200, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <motion.div {...fadeInUp}>
          <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ PATHED INSIGHTS</Chip>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.1, margin: "24px 0" }}>
            Thoughts on the future of<br /><span style={{ color: "#9c27b0" }}>engineering education.</span>
          </h1>
        </motion.div>
      </section>

      {/* 2. Blog Grid */}
      <section style={{ padding: "0 32px 120px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 40 }}>
          {blogs.map((blog, i) => (
            <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1, duration: 0.6 }} 
              style={{ background: "#fff", borderRadius: 24, overflow: "hidden", border: "1.5px solid #eaecff", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", cursor: "pointer", display: "flex", flexDirection: "column" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}>
              
              <div style={{ height: 240, overflow: "hidden" }}>
                <img src={blog.img} alt={blog.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
              </div>
              
              <div style={{ padding: 30, display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ marginBottom: 16 }}>
                  <Chip bg={blog.bg} border={blog.border} color={blog.color}>{blog.tag}</Chip>
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3, marginBottom: 16 }}>{blog.title}</h3>
                <p style={{ fontSize: 16, color: "#666", lineHeight: 1.7, marginBottom: 24, flex: 1 }}>{blog.desc}</p>
                <div style={{ color: "#1a1a2e", fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  Read Article →
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
