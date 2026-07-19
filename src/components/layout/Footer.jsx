import React from "react";
import { Link } from "react-router-dom";
import { Globe, Users, Code, Mail } from "lucide-react";

export default function Footer() {
  const sections = [
    { title: "Platform", links: [
      { label: "Features", to: "/platform#features" },
      { label: "Roadmaps", to: "/platform" },
      { label: "Challenges", to: "/platform#challenges" },
      { label: "Skill Trees", to: "/platform#skill-trees" },
      { label: "Pricing", to: "/pricing" }
    ]},
    { title: "Resources", links: [
      { label: "Blog", to: "/blog" },
      { label: "Guides", to: "/guides" },
      { label: "Documentation", to: "/documentation" },
      { label: "API Reference", to: "/api-reference" },
      { label: "Community", to: "/community" }
    ]},
    { title: "Company", links: [
      { label: "About Us", to: "/company" },
      { label: "Careers", to: "/company" },
      { label: "Mission", to: "/mission" },
      { label: "Contact", to: "/company#contact" },
      { label: "Partners", to: "/company" }
    ]},
    { title: "Legal", links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms of Service", to: "/terms-of-service" },
      { label: "Cookie Policy", to: "/cookie-policy" },
      { label: "Accessibility", to: "/accessibility" }
    ]}
  ];

  return (
    <footer style={{
      background: "#1a1a2e",
      color: "#fff",
      padding: "80px 32px 40px",
      marginTop: "auto",
      position: "relative",
      zIndex: 2
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "48px", marginBottom: "64px" }}>
          
          <div style={{ maxWidth: "320px" }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "12px",
                background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "18px",
                color: "#fff"
              }}>P</div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "28px", color: "#fff" }}>
                Path<span style={{ color: "#6c63ff" }}>Ed</span>
              </span>
            </Link>
            <p style={{ color: "#9ca3af", lineHeight: 1.6, fontSize: "15px", marginBottom: "24px", fontFamily: "'Inter', sans-serif" }}>
              The ultimate career readiness platform bridging the gap between academic theory and industry demands.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              {[Globe, Users, Code, Mail].map((Icon, idx) => (
                <a key={idx} href="#" style={{
                  width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#6c63ff"; e.currentTarget.style.color = "#fff" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#9ca3af" }}>
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {sections.map((section, idx) => (
            <div key={idx}>
              <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "16px", marginBottom: "24px", color: "#fff" }}>
                {section.title}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link to={link.to} style={{ color: "#9ca3af", fontSize: "14px", transition: "color 0.2s", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}
                       onMouseEnter={(e) => e.currentTarget.style.color = "#00c9a7"}
                       onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "32px",
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "24px"
        }}>
          <div style={{ color: "#6b7280", fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
            © {new Date().getFullYear()} PathEd. All rights reserved.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00c9a7", boxShadow: "0 0 10px #00c9a7" }}></div>
            <span style={{ color: "#9ca3af", fontSize: "13px", fontFamily: "'Fira Code', monospace" }}>ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
