import React, { useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function Accessibility() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      <main style={{ paddingTop: 180, paddingBottom: 100, maxWidth: 800, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, color: "var(--text-main)", marginBottom: 16 }}>Accessibility Statement</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 48 }}>Last updated: July 20, 2026</p>

        <section style={{ color: "#444", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>1. Our Commitment</h3>
            <p>PathEd is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards to guarantee that our coding challenges, AI mentorship interfaces, and recruitment dashboards are usable by all.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>2. Conformance Status</h3>
            <p>The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. PathEd is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard, primarily due to the highly interactive nature of our embedded code editors, which we are actively working to improve.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>3. Core Accessibility Features</h3>
            <ul style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong>Keyboard Navigation:</strong> All core platform features, including the Skill Trees and CRI dashboards, can be navigated using only a keyboard.</li>
              <li><strong>Screen Reader Support:</strong> Semantic HTML and ARIA labels are implemented across our UI components.</li>
              <li><strong>Color Contrast:</strong> Our dark mode and light mode themes are designed to meet strict WCAG contrast ratios for text readability.</li>
              <li><strong>Adjustable UI:</strong> The embedded IDE allows users to increase font sizes and adjust contrast themes without breaking the layout.</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>4. Feedback</h3>
            <p>We welcome your feedback on the accessibility of PathEd. Please let us know if you encounter accessibility barriers on PathEd by contacting our support team at accessibility@pathed.in. We try to respond to feedback within 2 business days.</p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
