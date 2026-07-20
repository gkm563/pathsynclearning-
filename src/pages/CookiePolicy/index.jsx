import React, { useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function CookiePolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      <main style={{ paddingTop: 180, paddingBottom: 100, maxWidth: 800, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, color: "var(--text-main)", marginBottom: 16 }}>Cookie Policy</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 48 }}>Last updated: July 20, 2026</p>

        <section style={{ color: "#444", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>1. What Are Cookies</h3>
            <p>As is common practice with almost all professional websites, PathEd uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the site's functionality.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>2. How We Use Cookies</h3>
            <p style={{ marginBottom: 16 }}>We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.</p>
            <ul style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><strong>Account related cookies:</strong> If you create an account with us, then we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out, but in some cases, they may remain afterwards to remember your site preferences when logged out.</li>
              <li><strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.</li>
              <li><strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site, we provide the functionality to set your preferences for how this site runs when you use it (e.g., Dark Mode toggles).</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>3. Disabling Cookies</h3>
            <p>You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site (such as remaining logged in during coding challenges). Therefore it is recommended that you do not disable cookies.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>4. Third-Party Cookies</h3>
            <p>In some special cases, we also use cookies provided by trusted third parties. For example, PathEd uses analytics solutions to help us understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.</p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
