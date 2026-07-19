import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import StudentLanding from "./pages/StudentLanding";
import Platform from "./pages/Platform";
import Methodology from "./pages/Methodology";
import Mission from "./pages/Mission";
import Company from "./pages/Company";
import Blog from "./pages/Blog";
import Community from "./pages/Community";
import "./index.css";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

// Layout placeholders for new pages
import Pricing from "./pages/Pricing";
import Guides from "./pages/Guides";
import Documentation from "./pages/Documentation";
import ApiReference from "./pages/ApiReference";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Accessibility from "./pages/Accessibility";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<StudentLanding />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/company" element={<Company />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/community" element={<Community />} />
          
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/api-reference" element={<ApiReference />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/accessibility" element={<Accessibility />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
