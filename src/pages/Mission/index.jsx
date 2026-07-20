import React from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Chip, HoverCard, RecruiterValidationSection, InteractiveCard, QuoteSection } from "../../components/ui/Shared";

export default function Mission() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Header />
      
      {/* 1. Hero Section */}
      <section style={{ paddingTop: 180, paddingBottom: 100, textAlign: "center", maxWidth: 1200, margin: "0 auto", paddingLeft: 32, paddingRight: 32 }}>
        <motion.div {...fadeInUp}>
          <Chip bg="#fff9e6" border="#ffe08a" color="#c68a00">▸ OUR MISSION</Chip>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.1, margin: "24px 0" }}>
            Bridging the gap between<br /><span style={{ color: "#f7971e" }}>academia and industry.</span>
          </h1>
          <p style={{ fontSize: 20, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto 48px", lineHeight: 1.7 }}>
            We exist to solve the structural disconnect in modern engineering education. We are translating academic investment into demonstrable economic value.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <HoverCard style={{ width: "100%", height: 500, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(247,151,30,0.15)", border: "1px solid #fff3cd", position: "relative" }}>
            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80" alt="Students bridging gap" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(26,26,46,0.9), transparent)" }} />
          </HoverCard>
        </motion.div>
      </section>

      {/* 2. The Core Problem */}
      <section style={{ padding: "100px 32px", background: "var(--bg-card)", borderTop: "1px solid #f0f2ff", borderBottom: "1px solid #f0f2ff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap-reverse" }}>
          
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {[
                { title: "Syllabi Misalignment", desc: "Organized by discipline, not by industry roles.", c: "#1677ff" },
                { title: "Lack of Clarity", desc: "No clear framework for identifying what to learn.", c: "#00c9a7" },
                { title: "Delayed Planning", desc: "Postponing preparation until the final year.", c: "#9c27b0" },
                { title: "Wasted Effort", desc: "Changing goals penalizes exploration.", c: "#6c63ff" }
              ].map((prob, i) => (
                <InteractiveCard key={i} delay={i * 0.1} hoverColor={prob.c} style={{ background: "var(--bg-main)", padding: 30, borderRadius: 16, border: "1.5px solid var(--border-light)" }}>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: "var(--text-main)", marginBottom: 12 }}>{prob.title}</h3>
                  <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.6 }}>{prob.desc}</p>
                </InteractiveCard>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ THE STRUCTURAL FAILURE</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              The traditional model<br />is broken.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
              The core strategic challenge facing undergraduate engineering education is a failure of design. Predefined subjects and rigid semesters create systemic friction.
            </p>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8 }}>
              Students are forced to navigate their degree without a clear understanding of how individual courses contribute to professional employability.
            </p>
          </motion.div>

        </div>
      </section>

      {/* 3. The Vision */}
      <section style={{ padding: "120px 32px", background: "var(--text-main)", color: "var(--bg-card)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="rgba(108,99,255,0.2)" border="rgba(108,99,255,0.4)" color="#b2aeff">▸ OUR VISION</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "24px 0" }}>
              Replacing proxy metrics with<br />true readiness signals.
            </h2>
            <p style={{ fontSize: 18, color: "#bbb", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              PathEd directly confronts systemic failures with integrated architectural solutions. We provide the clarity, structure, and accountability necessary to transform an academic degree into a measurable and purposeful career journey.
            </p>
          </motion.div>

          <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.div {...fadeInUp} style={{ width: "100%", maxWidth: 800 }}>
              <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Visionary teamwork" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(108,99,255,0.2)" }} />
              </HoverCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. The Ripple Effect */}
      <section style={{ padding: "100px 32px", background: "var(--bg-card)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="#e8faf5" border="#b2eed9" color="#00a67e">▸ SYSTEMIC IMPACT</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              The Ripple Effect.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
              When a single student unlocks their true potential, the impact doesn't stop at their first paycheck. It elevates their family, inspires their peers, and ultimately strengthens the global engineering ecosystem.
            </p>
            <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8 }}>
              Our mission is to trigger this ripple effect at an unprecedented scale, transforming India's vast engineering talent pool into the world's most capable technical workforce.
            </p>
          </motion.div>
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,166,126,0.15)", border: "1.5px solid #b2eed9" }}>
              <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80" alt="Ripple Effect" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </HoverCard>
          </motion.div>
        </div>
      </section>

      {/* 5. The Transparency Guarantee */}
      <section style={{ padding: "100px 32px", background: "#f8f9ff" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#e6f4ff" border="var(--border-strong)" color="#1677ff">▸ ZERO OBFUSCATION</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              The Transparency Guarantee.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto 60px", lineHeight: 1.8 }}>
              Education should not be a black box. You deserve to know exactly how your performance is measured, why you received a specific CRI score, and what specific steps you must take to improve.
            </p>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
            {[
              { title: "Open Algorithms", desc: "Our CRI scoring methodology is open and explained to every student." },
              { title: "No Hidden Agendas", desc: "We don't sell your data. We don't charge hidden fees." },
              { title: "Direct Feedback", desc: "Every assessment comes with granular, actionable feedback." }
            ].map((item, i) => (
              <InteractiveCard key={i} delay={i * 0.1} style={{ background: "var(--bg-card)", padding: "40px 30px", borderRadius: 20, border: "1.5px solid var(--border-light)" }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>{item.title}</h3>
                <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.desc}</p>
              </InteractiveCard>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Industry Alignment */}
      <section style={{ padding: "100px 32px", background: "var(--text-main)", color: "var(--bg-card)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap-reverse" }}>
          <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
            <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: "1px solid #333" }}>
              <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80" alt="Industry Alignment" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </HoverCard>
          </motion.div>
          <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
            <Chip bg="rgba(108,99,255,0.2)" border="rgba(108,99,255,0.4)" color="#b2aeff">▸ BRIDGING THE GAP</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, lineHeight: 1.15, margin: "24px 0" }}>
              Closing the gap between<br /><span style={{ color: "#6c63ff" }}>academia & corporate.</span>
            </h2>
            <p style={{ fontSize: 18, color: "#bbb", lineHeight: 1.8, marginBottom: 24 }}>
              For decades, universities and tech companies have operated in silos. PathEd acts as the definitive bridge, aligning academic curriculum directly with the evolving demands of the tech industry.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 7. The Long-Term Vision */}
      <section style={{ padding: "100px 32px", background: "linear-gradient(135deg, #fdf0ff, #fff)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", textAlign: "center" }}>
          <motion.div {...fadeInUp}>
            <Chip bg="#fdf0ff" border="#e8b3ff" color="#9c27b0">▸ THE 10-YEAR HORIZON</Chip>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
              Where we are going.
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 800, margin: "0 auto", lineHeight: 1.8 }}>
              Within the next decade, we envision a world where a student's potential is never bottlenecked by outdated college syllabi. We aim to establish the CRI as the global standard for engineering employability—rendering proxy metrics obsolete and ensuring that merit, validated by data, is the only currency that matters in hiring.
            </p>
          </motion.div>
        </div>
      </section>

      <QuoteSection 
        quote="Our mission is simple: to make sure no engineering student ever graduates wondering 'what now?'"
        author="Rahul Kushwaha"
        role="CEO & Chief Designer"
      />

      <RecruiterValidationSection 
        tag="▸ A SHARED MISSION"
        title={<>Recruiting Based<br />on Merit.</>}
        desc1="We've partnered with forward-thinking recruiters who share our mission of democratizing access to opportunity. They use PathEd because they care about what you can build, not just where you went to school."
        desc2="Our platform eliminates hiring bias by providing objective, skill-based evidence of your readiness."
        img="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80"
      />
      <Footer />
    </div>
  );
}
