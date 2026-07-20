import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { InteractiveCard } from "../../../components/ui/Shared";

const allReviews = [
  { id: 1, name: "Aryan Mehta", role: "SDE @ Microsoft", text: "PathEd's CRI tracker kept me laser-focused. I landed my dream role 6 months before graduation.", avatar: "AM" },
  { id: 2, name: "Priya Sharma", role: "ML Engineer @ Google", text: "The AI-fication feature literally remapped my roadmap to Google's exact skill stack.", avatar: "PS" },
  { id: 3, name: "Karan Singh", role: "DevOps @ Razorpay", text: "Balancing CGPA and career prep felt impossible until PathEd showed me exactly where to focus.", avatar: "KS" },
  { id: 4, name: "Neha Rao", role: "Full Stack @ Flipkart", text: "HackAttack gave me real projects with real deadlines. One project led directly to my offer letter.", avatar: "NR" },
  { id: 5, name: "Rohan Das", role: "Product Manager @ Zomato", text: "The product tracks are insane. Learned more here in 3 months than in 4 years of college.", avatar: "RD" },
  { id: 6, name: "Ananya Iyer", role: "Data Scientist @ Amazon", text: "Finally, a platform that doesn't just teach code, but teaches how to pass the actual interview.", avatar: "AI" },
  { id: 7, name: "Vikram Reddy", role: "SDE II @ Atlassian", text: "Used the community features to find a mock interview partner. Best decision ever.", avatar: "VR" },
  { id: 8, name: "Sneha Patil", role: "Cloud Architect @ AWS", text: "The cloud certification paths are perfectly structured. I got my AWS Solutions Architect cert in 4 weeks.", avatar: "SP" },
  { id: 9, name: "Rahul Verma", role: "Frontend Dev @ Swiggy", text: "My CRI score gave me the confidence to apply for senior roles straight out of college.", avatar: "RV" },
  { id: 10, name: "Diya Kapoor", role: "Security Analyst @ IBM", text: "The cybersecurity roadmap is top-tier. Real-world challenges that actually test your skills.", avatar: "DK" },
  { id: 11, name: "Arjun Nair", role: "Backend Eng @ Cred", text: "Nothing beats the gamified learning. The XP system kept me hooked on solving DSA daily.", avatar: "AN" },
  { id: 12, name: "Tanya Desai", role: "UI/UX Designer @ Canva", text: "Even for design, the portfolio building track was incredibly helpful for structuring my case studies.", avatar: "TD" }
];

export default function Reviews() {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(allReviews.length / 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, 6000);
    return () => clearInterval(timer);
  }, [totalPages]);

  const visibleReviews = allReviews.slice(page * 3, page * 3 + 3);

  return (
    <section style={{ padding: "80px 32px 120px", background: "var(--bg-alt)", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: "12px", fontWeight: 600, color: "#6c63ff", letterSpacing: "3px", marginBottom: "12px" }}>▸ STUDENT VOICES</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "var(--text-main)", marginBottom: "16px" }}>
            Those who walked <span style={{ color: "#6c63ff" }}>the path.</span>
          </h2>
        </div>

        <div style={{ minHeight: "260px", position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}
            >
              {visibleReviews.map((review) => (
                <InteractiveCard key={review.id} delay={0.1} style={{ 
                  background: "var(--bg-card)", borderRadius: "20px", padding: "32px", 
                  border: "1px solid var(--border-light)", boxShadow: "0 10px 30px rgba(108,99,255,0.05)",
                  display: "flex", flexDirection: "column", justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f7971e" color="#f7971e" />)}
                    </div>
                    <p style={{ color: "#555", fontSize: "15px", lineHeight: 1.7, fontStyle: "italic", fontFamily: "'Inter', sans-serif", marginBottom: "24px" }}>
                      "{review.text}"
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ 
                      width: "48px", height: "48px", borderRadius: "50%", 
                      background: "linear-gradient(135deg, #6c63ff, #00c9a7)", 
                      display: "flex", alignItems: "center", justifyContent: "center", 
                      fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "16px", color: "var(--text-inverse)" 
                    }}>
                      {review.avatar}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "16px", color: "var(--text-main)" }}>
                        {review.name}
                      </div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: "10px", color: "#6c63ff", marginTop: "4px" }}>
                        {review.role}
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "40px" }}>
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => setPage(i)}
              style={{ 
                width: i === page ? "24px" : "8px", 
                height: "8px", borderRadius: "4px", 
                background: i === page ? "#6c63ff" : "#d8d4ff",
                transition: "all 0.3s ease", padding: 0
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
