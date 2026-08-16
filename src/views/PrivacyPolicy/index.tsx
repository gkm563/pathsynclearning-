"use client";

import React, { useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      <main style={{ paddingTop: 180, paddingBottom: 100, maxWidth: 800, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, color: "var(--text-main)", marginBottom: 16 }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 48 }}>Last updated: July 20, 2026</p>

        <section style={{ color: "#444", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>1. Introduction</h3>
            <p>Welcome to PathEd. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>2. The Data We Collect About You</h3>
            <p style={{ marginBottom: 16 }}>Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier, and title.</li>
              <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
              <li><strong>Profile Data:</strong> includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
              <li><strong>Academic Data:</strong> includes your university, major, graduation year, and GPA.</li>
              <li><strong>Performance Data:</strong> includes your Career Readiness Index (CRI), code submissions, challenge results, and skill tree progress.</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>3. How Is Your Personal Data Collected?</h3>
            <p style={{ marginBottom: 16 }}>We use different methods to collect data from and about you including through:</p>
            <ul style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong>Direct interactions.</strong> You may give us your Identity, Contact, Profile, and Academic Data by filling in forms or by corresponding with us by post, phone, email or otherwise.</li>
              <li><strong>Automated technologies or interactions.</strong> As you interact with our website, we will automatically collect Technical Data about your equipment, browsing actions and patterns.</li>
              <li><strong>Platform usage.</strong> We automatically collect Performance Data as you solve coding challenges, interact with the AI mentor, and progress through skill trees.</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>4. How We Use Your Personal Data</h3>
            <p style={{ marginBottom: 16 }}>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., providing access to the platform).</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests (e.g., calculating your CRI score).</li>
              <li>Where we need to comply with a legal obligation.</li>
              <li>To share your Profile and Performance Data with verified corporate recruiters, <strong>only if you have explicitly opted-in</strong> to the PathEd Hiring Network.</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>5. Data Security</h3>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>6. Your Legal Rights</h3>
            <p style={{ marginBottom: 16 }}>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
            <ul style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
              <li>Request transfer of your personal data.</li>
              <li>Right to withdraw consent.</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>7. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@pathed.in.</p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
