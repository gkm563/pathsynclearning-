import React, { useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import HeroRegion from "./sections/HeroRegion";
import VisualFeatures from "./sections/VisualFeatures";
import WhyPathEd from "./sections/WhyPathEd";
import PreFooterCTA from "./sections/PreFooterCTA";
import PlatformOverview from "./sections/PlatformOverview";
import FAQ from "./sections/FAQ";
import Reviews from "./sections/Reviews";

export default function StudentLanding() {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      {/* Background Animated Blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", left: "-10%", top: "-10%", width: "500px", height: "500px", background: "linear-gradient(135deg, #c5c0ff, #a8f0e8)", opacity: 0.4, animation: "blobMove 12s ease-in-out infinite", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", right: "-5%", top: "20%", width: "400px", height: "400px", background: "linear-gradient(135deg, #ffe0b2, #fce4ec)", opacity: 0.35, animation: "blobMove 16s ease-in-out infinite reverse", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", left: "30%", bottom: "10%", width: "600px", height: "600px", background: "linear-gradient(135deg, #b2f0e8, #d4b3ff)", opacity: 0.3, animation: "blobMove 14s ease-in-out infinite 2s", filter: "blur(40px)" }} />
        {/* Grid pattern overlay */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundSize: "40px 40px", backgroundImage: "linear-gradient(to right, #6c63ff 1px, transparent 1px), linear-gradient(to bottom, #6c63ff 1px, transparent 1px)" }}></div>
      </div>

      <Header />
      
      <main style={{ position: "relative", zIndex: 1 }}>
        <HeroRegion />
        <WhyPathEd />
        <VisualFeatures />
        <PlatformOverview />
        <FAQ />
        <Reviews />
        <PreFooterCTA />
      </main>

      <Footer />
    </div>
  );
}
