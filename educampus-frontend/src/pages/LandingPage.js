import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <h1>Welcome to EduCampus</h1>
      <p>The modern digital campus solution.</p>
      <h2>I am a...</h2>
      <div className="role-selection">
        <Link to="/register/student" className="role-btn student">
          Student
        </Link>
        <Link to="/register/teacher" className="role-btn teacher">
          Teacher
        </Link>
      </div>
      <p className="login-link-landing">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
};

export default LandingPage;