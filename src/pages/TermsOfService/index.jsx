import React, { useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "#fcfdff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      <main style={{ paddingTop: 180, paddingBottom: 100, maxWidth: 800, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, color: "#1a1a2e", marginBottom: 16 }}>Terms of Service</h1>
        <p style={{ color: "#666", marginBottom: 48 }}>Last updated: July 20, 2026</p>

        <section style={{ color: "#444", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>1. Acceptance of Terms</h3>
            <p>By accessing and using PathEd, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>2. Academic Integrity</h3>
            <p>PathEd relies on the integrity of your code submissions. Plagiarism, exploiting the CRI algorithm, or sharing challenge solutions publicly will result in immediate account termination and a permanent ban from the PathEd Hiring Network.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>3. Subscription and Billing</h3>
            <p>Certain features, such as the AI Mentor and Direct Recruiter Visibility, require a paid subscription (Pro or Premium). Subscriptions are billed on a recurring monthly basis. You may cancel at any time.</p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
