import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import StudentLanding from "./pages/StudentLanding";
import PlatformOverview from "./pages/Platform";
import PlatformDashboard from "./pages/Platform/PlatformDashboard";
import PlatformSkillRoadmap from "./pages/Platform/PlatformSkillRoadmap";
import Store from "./pages/Store";
import OnboardingStage1 from "./pages/Onboarding/OnboardingStage1";
import OnboardingStage2 from "./pages/Onboarding/OnboardingStage2";
import OnboardingStage3 from "./pages/Onboarding/OnboardingStage3";
import OnboardingStage4 from "./pages/Onboarding/OnboardingStage4";
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
import Login from "./pages/Login";
import Register from "./pages/Register";
import PlatformChallenges from "./pages/Platform/PlatformChallenges";
import PlatformMemoryLane from "./pages/Platform/PlatformMemoryLane";
import PlatformTechNews from "./pages/Platform/PlatformTechNews";
import PlatformProgress from "./pages/Platform/PlatformProgress";
import PlatformMentorship from "./pages/Platform/PlatformMentorship";
import PlatformLiveClass from "./pages/Platform/PlatformLiveClass";
import PlatformProjectCollab from "./pages/Platform/PlatformProjectCollab";
import PlatformAlumniNetwork from "./pages/Platform/PlatformAlumniNetwork";
import PlatformHackSquad from "./pages/Platform/PlatformHackSquad";
import PlatformEvents from "./pages/Platform/PlatformEvents";
import PlatformPlacementInbox from "./pages/Platform/PlatformPlacementInbox";
import PlatformPlacementInsights from "./pages/Platform/PlatformPlacementInsights";
import PlatformRecordsCerts from "./pages/Platform/PlatformRecordsCerts";
import PlatformOgOpportunities from "./pages/Platform/PlatformOgOpportunities";
import PlatformCommunity from "./pages/Platform/PlatformCommunity";
import WalletExchange from "./pages/Store/WalletExchange";



function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<StudentLanding />} />
          <Route path="/platform" element={<PlatformOverview />} />
          <Route path="/dashboard" element={<PlatformDashboard />} />
          <Route path="/roadmap" element={<PlatformSkillRoadmap />} />
          <Route path="/platform/roadmap" element={<PlatformSkillRoadmap />} />
          <Route path="/challenges" element={<PlatformChallenges />} />
          <Route path="/platform/challenges" element={<PlatformChallenges />} />
          <Route path="/memory-lane" element={<PlatformMemoryLane />} />
          <Route path="/platform/memory-lane" element={<PlatformMemoryLane />} />
          <Route path="/technews" element={<PlatformTechNews />} />
          <Route path="/platform/technews" element={<PlatformTechNews />} />
          <Route path="/progress" element={<PlatformProgress />} />
          <Route path="/platform/progress" element={<PlatformProgress />} />
          <Route path="/mentorship" element={<PlatformMentorship />} />
          <Route path="/platform/mentorship" element={<PlatformMentorship />} />
          <Route path="/live-class" element={<PlatformLiveClass />} />
          <Route path="/platform/live-class" element={<PlatformLiveClass />} />
          <Route path="/project-collab" element={<PlatformProjectCollab />} />
          <Route path="/platform/project-collab" element={<PlatformProjectCollab />} />
          <Route path="/alumni-network" element={<PlatformAlumniNetwork />} />
          <Route path="/platform/alumni-network" element={<PlatformAlumniNetwork />} />
           <Route path="/hacksquad" element={<PlatformHackSquad />} />
          <Route path="/platform/hacksquad" element={<PlatformHackSquad />} />
          <Route path="/events" element={<PlatformEvents />} />
          <Route path="/platform/events" element={<PlatformEvents />} />
          <Route path="/placement-inbox" element={<PlatformPlacementInbox />} />
          <Route path="/platform/placement-inbox" element={<PlatformPlacementInbox />} />
          <Route path="/placement-insights" element={<PlatformPlacementInsights />} />
          <Route path="/platform/placement-insights" element={<PlatformPlacementInsights />} />
          <Route path="/records-certs" element={<PlatformRecordsCerts />} />
          <Route path="/platform/records-certs" element={<PlatformRecordsCerts />} />
          <Route path="/og-opportunities" element={<PlatformOgOpportunities />} />
          <Route path="/platform/og-opportunities" element={<PlatformOgOpportunities />} />
          <Route path="/platform/community" element={<PlatformCommunity />} />
          <Route path="/store" element={<Store />} />
          <Route path="/store/wallet" element={<WalletExchange />} />
          <Route path="/platform/wallet" element={<WalletExchange />} />
          
          <Route path="/onboarding/stage1" element={<OnboardingStage1 />} />
          <Route path="/onboarding/stage2" element={<OnboardingStage2 />} />
          <Route path="/onboarding/stage3" element={<OnboardingStage3 />} />
          <Route path="/onboarding/stage4" element={<OnboardingStage4 />} />
          
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/company" element={<Company />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/community" element={<Community />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
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
