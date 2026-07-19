import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentLanding from "./pages/StudentLanding";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<StudentLanding />} />
          {/* Dashboard and other routes will be added here later */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
