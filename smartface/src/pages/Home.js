import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // Import CSS

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">📸 Welcome to <span>SmartFace</span></h1>
      <p className="home-subtitle">AI-based Face Recognition Attendance System</p>

      {/* ✅ Buttons for Navigation */}
      <div className="button-group">
        <button className="enroll-btn" onClick={() => navigate("/attendance-tracker")}>
          📷 Enroll Face
        </button>
        <button className="attendance-btn" onClick={() => navigate("/report")}>
          📝 Mark Attendance
        </button>
        <button className="attendance-btn" onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default Home;
