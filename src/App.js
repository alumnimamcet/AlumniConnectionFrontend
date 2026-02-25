// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout Components
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';

// Page Components
import HomeScreen from './pages/Home/HomeScreen';
import AlumniDashboard from './pages/Alumni/AlumniDashboard';
import AboutUs from './pages/Static/AboutUs';
import ContactUs from './pages/Static/ContactUs';
import ResponseSubmitted from './pages/Static/ResponseSubmitted';
// Add these imports at the top of src/App.js
import RoleSelection from './pages/Auth/RoleSelection';
import StudentSignUp from './pages/Auth/StudentSignUp';
// Step 1: Add these imports at the top
import AlumniSignUp from './pages/Auth/AlumniSignUp';
import AdminSignUp from './pages/Auth/AdminSignUp';
import LoginRoleSelection from './pages/Auth/LoginRoleSelection';
import StudentLogin from './pages/Auth/StudentLogin';
import AlumniLogin from './pages/Auth/AlumniLogin';
import AdminLogin from './pages/Auth/AdminLogin';
// Add Import
import JobPostings from './pages/Home/JobPostings';
// Add Imports
import CreateEvent from './pages/Admin/CreateEvent';
import Events from './pages/Home/Events';
import Messaging from './pages/Home/Messaging';
import AdminDashboard from './pages/Admin/AdminDashboardHome';
import Profile from './pages/Alumni/Profile';

// Inside <Routes>


// Inside <Routes>


// Step 2: Add these routes inside <Routes>


// Inside your <Routes> block

// Global Styles
import { storage } from './utils/storage';
import './styles/Global.css';
import './styles/Dashboard.css';

// Initialize persistent storage
storage.init();

/**
 * Main Application Component
 * Managing routes for Home, About, and Contact pages as per design requirements.
 */
function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 pb-lg-0 pb-5 mb-3 mb-lg-0">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/success" element={<ResponseSubmitted />} />
            <Route path="/register" element={<RoleSelection />} />
            <Route path="/signup/student" element={<StudentSignUp />} />
            <Route path="/signup/alumni" element={<AlumniSignUp />} />
            <Route path="/signup/admin" element={<AdminSignUp />} />
            <Route path="/login" element={<LoginRoleSelection />} />
            <Route path="/login/student" element={<StudentLogin />} />
            <Route path="/login/alumni" element={<AlumniLogin />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/alumni/home" element={<AlumniDashboard />} />
            <Route path="/alumni/profile" element={<Profile />} />
            <Route path="/jobs" element={<JobPostings />} />
            <Route path="/admin/create-event" element={<CreateEvent />} />
            <Route path="/events" element={<Events />} />
            <Route path="/messaging" element={<Messaging />} />
            <Route path="/notifications" element={<div className="container py-5"><h4>Notifications coming soon...</h4></div>} />
            <Route path="/admin/create-event" element={<CreateEvent />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;