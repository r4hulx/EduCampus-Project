import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FindRoomsPage from './pages/FindRoomsPage';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage'; // Import this

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register/student" element={<RegisterPage role="student" />} />
        <Route path="/register/teacher" element={<RegisterPage role="teacher" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/find-rooms" element={<FindRoomsPage />} />
        <Route path="/profile" element={<ProfilePage />} /> {/* Add this route */}
      </Routes>
    </div>
  );
}

export default App;