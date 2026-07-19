import React, { useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "#fcfdff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      <main style={{ paddingTop: 180, paddingBottom: 100, maxWidth: 800, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, color: "#1a1a2e", marginBottom: 16 }}>Privacy Policy</h1>
        <p style={{ color: "#666", marginBottom: 48 }}>Last updated: July 20, 2026</p>

        <section style={{ color: "#444", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>1. Information We Collect</h3>
            <p>At PathEd, we collect information that you provide directly to us when you create an account, update your profile, complete skill challenges, or communicate with our support team. This includes your name, email address, academic history, and code submissions.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>2. How We Use Your Information</h3>
            <p>We use the information we collect to calculate your Career Readiness Index (CRI), provide personalized AI mentorship, and with your explicit consent, showcase your verified skills to our corporate hiring partners.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>3. Data Sharing with Recruiters</h3>
            <p>Your privacy is our priority. We never sell your personal data. Your profile and CRI score are only visible to verified corporate partners if you explicitly opt-in to the PathEd Hiring Network.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>4. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@pathed.in.</p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
