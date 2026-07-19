import React, { useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function Accessibility() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "#fcfdff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      <main style={{ paddingTop: 180, paddingBottom: 100, maxWidth: 800, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, color: "#1a1a2e", marginBottom: 16 }}>Accessibility Statement</h1>
        <p style={{ color: "#666", marginBottom: 48 }}>Last updated: July 20, 2026</p>

        <section style={{ color: "#444", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>Our Commitment</h3>
            <p>PathEd is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to our platform.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 }}>Conformance Status</h3>
            <p>We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA. These guidelines explain how to make web content more accessible for people with disabilities.</p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
