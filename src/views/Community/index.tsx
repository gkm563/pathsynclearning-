"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip, HoverCard, RecruiterValidationSection, InteractiveCard, QuoteSection } from "../../components/ui/Shared";

export default function Community() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      {/* 1. Hero Section */}
      <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: "center", maxWidth: 1200, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <motion.div {...fadeInUp}>
          <Chip bg="#e8faf5" border="#b2eed9" color="#00a67e">▸ PEER-TO-PEER ECOSYSTEM</Chip>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1, margin: "24px 0" }}>
            You are not learning <span style={{ color: "#00c9a7" }}>alone.</span>
          </h1>
          <p style={{ fontSize: 20, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto 48px", lineHeight: 1.7 }}>
            PathEd is built on the belief that engineering is a collaborative discipline. Our community is designed to foster professional growth, technical debates, and peer-driven success.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <HoverCard style={{ width: "100%", height: 500, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,201,167,0.15)", border: "1px solid #e8faf5", position: "relative" }}>
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80" alt="Students coding together" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(26,26,46,0.9), transparent)" }} />
          </HoverCard>
        </motion.div>
      </section>

      {/* 2. HackAttack Engine */}
      <section style={{ padding: "100px 32px", background: "var(--bg-card)", borderTop: "1px solid #f0f2ff", borderBottom: "1px solid #f0f2ff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ COMPETITIVE LEARNING</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              The HackAttack<br />Engine.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
              Put your skills to the test in real-time. Join weekly global hackathons and daily algorithmic challenges directly mapped to your CRI.
            </p>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8 }}>
              Compete on professional, constrained leaderboards where quality of code matters just as much as speed of execution.
            </p>
          </motion.div>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px", position: "relative" }}>
            <HoverCard style={{ background: "linear-gradient(135deg, #f0f0ff, #fdf0ff)", padding: 40, borderRadius: 24, border: "2px solid #e8b3ff" }}>
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80" alt="Hackathon" style={{ width: "100%", borderRadius: 16, boxShadow: "0 10px 40px rgba(156,39,176,0.15)" }} />
            </HoverCard>
          </motion.div>
          
        </div>
      </section>

      {/* 3. Global Peer Review */}
      <section style={{ padding: "120px 32px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#f0f0ff" border="#d8d4ff" color="#6c63ff">▸ COLLABORATION</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              Global Peer Review.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              Your code doesn't exist in a vacuum. PathEd automatically routes your project submissions to peers for blind code reviews, fostering a culture of constructive criticism and collective improvement.
            </p>
          </motion.div>

          <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.div {...fadeInUp} style={{ width: "100%", maxWidth: 800 }}>
              <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
                <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80" alt="Code Review" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(108,99,255,0.2)" }} />
              </HoverCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Teacher Connect */}
      <section style={{ padding: "100px 32px", background: "var(--bg-inverse)", color: "var(--text-inverse)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap-reverse" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
              <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" alt="Teacher guidance" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </HoverCard>
          </motion.div>

          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="rgba(247,151,30,0.2)" border="rgba(247,151,30,0.4)" color="#f7971e">▸ MENTORSHIP</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "24px 0" }}>
              Teacher Connect.
            </h2>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8, marginBottom: 24 }}>
              When you hit a plateau, you aren't stuck. Teachers are provided with aggregated views of your progress and readiness trends.
            </p>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8 }}>
              This allows for early identification of struggles, enabling faculty to provide informed, data-driven guidance exactly when you need it most.
            </p>
          </motion.div>

        </div>
      </section>

      {/* 5. Weekend Hackathons */}
      <section style={{ padding: "100px 32px", background: "var(--bg-card)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#e8faf5" border="#b2eed9" color="#00a67e">▸ BUILDING IN PUBLIC</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              Weekend Hackathons.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
              Learning in isolation is slow. Every weekend, the PathEd community rallies together to build projects from scratch within 48 hours.
            </p>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8 }}>
              This rapid iteration cycle forces you out of your comfort zone, teaching you how to collaborate under pressure, manage Git workflows, and ship real products—skills that recruiters specifically look for.
            </p>
          </motion.div>
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,166,126,0.15)", border: "1.5px solid #b2eed9" }}>
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80" alt="Hackathon" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </HoverCard>
          </motion.div>
        </div>
      </section>

      {/* 6. Collaborative Open Source */}
      <section style={{ padding: "100px 32px", background: "var(--bg-alt)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#e6f4ff" border="var(--border-strong)" color="#1677ff">▸ OPEN ECOSYSTEM</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              Collaborative Open Source.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              Contribute to real-world projects directly from the PathEd platform. Our open-source integration tracks your pull requests and commits, adding verified open-source experience to your CRI profile.
            </p>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 30 }}>
            {[
              { icon: "🌍", title: "Global Impact", desc: "Write code that hundreds of thousands of people use." },
              { icon: "🤝", title: "Team Dynamics", desc: "Learn to navigate complex codebases and coordinate with maintainers." },
              { icon: "📈", title: "Verified Commits", desc: "All your open-source activity boosts your overall employability index." }
            ].map((item, i) => (
              <InteractiveCard key={i} delay={i * 0.1} style={{ background: "var(--bg-card)", padding: "40px 30px", borderRadius: 20, border: "1.5px solid var(--border-light)", textAlign: "left" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>{item.title}</h3>
                <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.desc}</p>
              </InteractiveCard>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Industry Mentors */}
      <section style={{ padding: "100px 32px", background: "var(--bg-inverse)", color: "var(--text-inverse)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap-reverse" }}>
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: "1px solid #333" }}>
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80" alt="Industry Mentors" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </HoverCard>
          </motion.div>
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="rgba(108,99,255,0.2)" border="rgba(108,99,255,0.4)" color="#b2aeff">▸ EXPERT GUIDANCE</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "24px 0" }}>
              Direct access to<br /><span style={{ color: "#6c63ff" }}>industry veterans.</span>
            </h2>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8, marginBottom: 24 }}>
              The PathEd community isn't just students. We've brought in active senior engineers and hiring managers from top tier companies to act as mentors.
            </p>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8 }}>
              Get your resume reviewed, participate in mock interviews, and receive candid career advice from the exact people who will eventually be hiring you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 8. Local Chapters */}
      <section style={{ padding: "120px 32px", background: "linear-gradient(135deg, #fff9ee, #fff)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#fff3cd" border="#ffe08a" color="#c68a00">▸ OFFLINE PRESENCE</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              PathEd Local Chapters.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto", lineHeight: 1.8 }}>
              Digital connection is great, but offline collaboration is unmatched. Starting from our roots in Prayagraj, PathEd Local Chapters are expanding across campuses nationwide. Attend local meetups, host technical workshops, and build lifelong professional relationships in person.
            </p>
          </motion.div>
        </div>
      </section>

      <QuoteSection 
        quote="A great engineer is never built in isolation. It takes a community, a mentor, and a shared mission."
        author="Rahul Kushwaha"
        role="CEO & Chief Designer"
      />

      <RecruiterValidationSection 
        tag="▸ VETTED TALENT POOL"
        title={<>A Community of<br />Proven Builders.</>}
        desc1="Recruiters don't just look at individual profiles; they observe how you interact within the ecosystem. Your contributions to peer reviews, open source, and hackathons are all logged and validated."
        desc2="This creates a comprehensive, 360-degree view of your technical and soft skills, making it easier for recruiters to identify natural leaders and team players."
        img="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
      />
      <Footer />
    </div>
  );
}
