"use client";

import React, { useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      <main style={{ paddingTop: 180, paddingBottom: 100, maxWidth: 800, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, color: "var(--text-main)", marginBottom: 16 }}>Terms of Service</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 48 }}>Last updated: July 20, 2026</p>

        <section style={{ color: "#444", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>1. Agreement to Terms</h3>
            <p>By accessing or using PathEd, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you are prohibited from using or accessing this site. The materials contained in this platform are protected by applicable copyright and trademark law.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>2. User License</h3>
            <p style={{ marginBottom: 16 }}>Permission is granted to temporarily download one copy of the materials (information or software) on PathEd's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>Attempt to decompile or reverse engineer any software contained on PathEd's website;</li>
              <li>Remove any copyright or other proprietary notations from the materials; or</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>3. Academic Integrity and Anti-Cheating</h3>
            <p style={{ marginBottom: 16 }}>PathEd's Career Readiness Index (CRI) relies on the authentic performance of its users. By using the platform, you agree to adhere to strict standards of academic integrity:</p>
            <ul style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>All code submissions must be your own original work unless explicitly stated in collaborative environments.</li>
              <li>You may not use automated bots, scripts, or unauthorized AI agents to solve challenges on your behalf.</li>
              <li>You may not share solutions to active challenges with other students.</li>
            </ul>
            <p style={{ marginTop: 16, background: "#f0f0ff", padding: 16, borderRadius: 8, borderLeft: "4px solid #6c63ff" }}><strong>Note:</strong> Violation of these integrity standards will result in the immediate resetting of your CRI score and potential permanent suspension from the PathEd platform and Hiring Network.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>4. Disclaimer</h3>
            <p>The materials on PathEd's website are provided on an 'as is' basis. PathEd makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>5. Limitations</h3>
            <p>In no event shall PathEd or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PathEd's website, even if PathEd or a PathEd authorized representative has been notified orally or in writing of the possibility of such damage.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>6. Modifications</h3>
            <p>PathEd may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
