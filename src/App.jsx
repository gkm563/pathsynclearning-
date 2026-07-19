import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentLanding from "./pages/StudentLanding";
import Platform from "./pages/Platform";
import Methodology from "./pages/Methodology";
import Mission from "./pages/Mission";
import Company from "./pages/Company";
import Blog from "./pages/Blog";
import Community from "./pages/Community";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<StudentLanding />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/company" element={<Company />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
