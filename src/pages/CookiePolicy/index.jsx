import React, { useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function CookiePolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "#fcfdff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      <main style={{ paddingTop: 180, paddingBottom: 100, maxWidth: 800, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, color: "#1a1a2e", marginBottom: 16 }}>Cookie Policy</h1>
        <p style={{ color: "#666", marginBottom: 48 }}>Last updated: July 20, 2026</p>

        <section style={{ color: "#444", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>What Are Cookies?</h3>
            <p>Cookies are small text files stored on your device that help us improve your experience on PathEd by remembering your preferences and session state.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>How We Use Cookies</h3>
            <p>We use essential cookies to keep you logged in while you work on skill challenges. We also use performance cookies to understand how students navigate our platform so we can optimize the UI and learning flows.</p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
