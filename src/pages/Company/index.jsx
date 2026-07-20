import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip, HoverCard, RecruiterValidationSection, InteractiveCard, QuoteSection } from "../../components/ui/Shared";

export default function Company() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  const team = [
    { name: "Rahul Kushwaha", role: "CEO & Chief Designer", img: "/team/Rahul Kushwaha.jpeg" },
    { name: "Devesh Singh", role: "Head of Research and Development", img: "/team/Devesh SIngh.jpeg" },
    { name: "Ayush Yadav", role: "Chief Engineer & Developer", img: "/team/Ayush yadav.jpg" },
    { name: "Prabhat Pandey", role: "Chief Technical Head", img: "/team/Prabhat Pandey.jpg", objectPosition: "top center" }
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1531496730074-83b638c0a7ac?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
    // 16 images above, add a few more for the "load more"
    "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1521737711867-e3cb66cb3cb6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
  ];

  const [visibleGalleryCount, setVisibleGalleryCount] = useState(16);

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      {/* 1. Hero Section */}
      <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: "center", maxWidth: 1200, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <motion.div {...fadeInUp}>
          <Chip bg="#f0f0ff" border="#d8d4ff" color="#6c63ff">▸ AN INDIAN ED-TECH STARTUP</Chip>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1, margin: "24px 0" }}>
            Born in Prayagraj.<br /><span style={{ color: "#6c63ff" }}>Built for the World.</span>
          </h1>
          <p style={{ fontSize: 20, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto 48px", lineHeight: 1.7 }}>
            PathEd is a deeply technical, hyper-focused startup engineered in the heart of India with a vision to redefine global engineering education.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <HoverCard style={{ width: "100%", height: 500, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(108,99,255,0.15)", border: "1px solid var(--border-light)", position: "relative" }}>
            <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80" alt="Tech Workspace" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(26,26,46,0.9), transparent)" }} />
          </HoverCard>
        </motion.div>
      </section>

      {/* 2. The Core Team */}
      <section style={{ padding: "100px 32px", background: "var(--bg-inverse)", color: "var(--text-inverse)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <motion.div {...fadeInUp}>
              <Chip bg="rgba(108,99,255,0.2)" border="rgba(108,99,255,0.4)" color="#b2aeff">▸ LEADERSHIP</Chip>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "24px 0" }}>
                The architects behind<br />the platform.
              </h2>
            </motion.div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 30, justifyContent: "center" }}>
            {team.map((member, i) => (
              <InteractiveCard key={member.name} delay={i * 0.1} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 30, width: 280, textAlign: "center" }}>
                <div style={{ width: 140, height: 140, borderRadius: "50%", overflow: "hidden", margin: "0 auto 24px", border: "4px solid rgba(108,99,255,0.5)" }}>
                  <img src={member.img} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: member.objectPosition || "center", filter: "grayscale(20%) contrast(1.1)" }} />
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{member.name}</h3>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#b2aeff", letterSpacing: 1 }}>{member.role.toUpperCase()}</div>
              </InteractiveCard>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Ethos */}
      <section style={{ padding: "120px 32px", background: "var(--bg-card)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#e8faf5" border="#b2eed9" color="#00a67e">▸ ENGINEERING EXCELLENCE</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              Built by engineers,<br />for engineers.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
              We aren't just building another ed-tech tool. We are fundamentally re-architecting the educational journey to map directly to real-world career demands.
            </p>
          </motion.div>

          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,201,167,0.15)" }}>
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" alt="Engineers collaborating" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </HoverCard>
          </motion.div>

        </div>
      </section>

      {/* 4. Our Origin Story */}
      <section style={{ padding: "100px 32px", background: "#f8f9ff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap-reverse" }}>
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", border: "1px solid var(--border-light)" }}>
              <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80" alt="Origin Story" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </HoverCard>
          </motion.div>
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#e6f4ff" border="var(--border-strong)" color="#1677ff">▸ THE PRAYAGRAJ ROOTS</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              Our Origin Story.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
              PathEd wasn't born in Silicon Valley. It was built in Prayagraj by engineers who experienced the friction of traditional tech education firsthand.
            </p>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8 }}>
              We realized that if we wanted a system that actually cared about careers, we had to build it ourselves. What started as a local experiment is now scaling to redefine how engineers prepare for the workforce globally.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. Core Engineering Values */}
      <section style={{ padding: "100px 32px", background: "var(--bg-card)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ PRINCIPLES</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              Core Engineering Values.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              Our product philosophy is simple: cut the noise, build for performance, and optimize for actual student outcomes.
            </p>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 30 }}>
            {[
              { icon: "⚡", title: "Ship Fast", desc: "Iterate rapidly based on student feedback and market demands." },
              { icon: "🛡️", title: "Uncompromising Quality", desc: "No broken links. No buggy code editors. Just smooth experiences." },
              { icon: "🧠", title: "Data-Driven Decisions", desc: "We rely on metrics, not intuition, to guide our product roadmap." }
            ].map((item, i) => (
              <InteractiveCard key={i} delay={i * 0.1} style={{ background: "var(--bg-main)", padding: "40px 30px", borderRadius: 20, border: "1.5px solid var(--border-light)", textAlign: "left" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>{item.title}</h3>
                <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.desc}</p>
              </InteractiveCard>
            ))}
          </div>
        </div>
      </section>

      {/* PathEd Company Gallery */}
      <section style={{ padding: "100px 32px", background: "var(--bg-inverse)", color: "var(--text-inverse)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="rgba(108,99,255,0.2)" border="rgba(108,99,255,0.4)" color="#b2aeff">▸ BEHIND THE SCENES</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "24px 0" }}>
              PathEd Company Gallery.
            </h2>
            <p style={{ fontSize: 18, color: "#bbb", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              A glimpse into our workspaces, hackathons, and the people building the future of education.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
            {galleryImages.slice(0, visibleGalleryCount).map((imgUrl, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: (i % 4) * 0.1 }}>
                <InteractiveCard style={{ height: 250, borderRadius: 16, overflow: "hidden", border: "1px solid #333" }}>
                  <img src={imgUrl} alt={`Gallery ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </InteractiveCard>
              </motion.div>
            ))}
          </div>
          
          {visibleGalleryCount < galleryImages.length && (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(108,99,255,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVisibleGalleryCount(prev => prev + 16)}
              style={{
                background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
                color: "var(--text-inverse)",
                border: "none",
                padding: "16px 40px",
                borderRadius: 30,
                fontFamily: "'Outfit', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 30px rgba(108,99,255,0.2)"
              }}
            >
              Load More
            </motion.button>
          )}
        </div>
      </section>

      <QuoteSection 
        quote="Built in Prayagraj. Scaled for the world. We are engineers building for engineers."
        author="Rahul Kushwaha"
        role="CEO & Chief Designer"
      />

      <RecruiterValidationSection 
        tag="▸ CORPORATE PARTNERSHIPS"
        title={<>Backed by Companies<br />that Matter.</>}
        desc1="Our company operates at the intersection of education and employment. Top global tech firms partner directly with PathEd because they believe in our robust technical evaluation standards."
        desc2="They recruit straight from our platform, trusting our transparent data over traditional academic credentials."
        img="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80"
      />

      {/* Contact Section */}
      <section id="contact" style={{ padding: "100px 32px", background: "#f8f9fa", borderTop: "1px solid var(--border-light)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", marginBottom: 24 }}>
              Get in Touch
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 48 }}>
              Whether you're a student looking to accelerate your career, or a company looking to hire vetted engineering talent, we'd love to hear from you.
            </p>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
              <InteractiveCard style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", padding: 32, borderRadius: 16, minWidth: 280 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text-main)", marginBottom: 12 }}>General Inquiries</h3>
                <a href="mailto:hello@pathed.in" style={{ color: "#1677ff", fontSize: 18, textDecoration: "none", fontWeight: 600 }}>hello@pathed.in</a>
              </InteractiveCard>
              <InteractiveCard style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", padding: 32, borderRadius: 16, minWidth: 280 }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text-main)", marginBottom: 12 }}>Corporate Partnerships</h3>
                <a href="mailto:partners@pathed.in" style={{ color: "#00c9a7", fontSize: 18, textDecoration: "none", fontWeight: 600 }}>partners@pathed.in</a>
              </InteractiveCard>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
