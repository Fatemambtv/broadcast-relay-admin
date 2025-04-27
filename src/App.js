import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { clearAuthData, getAuthData, setAuthData } from "./util/auth";
import Login from "./pages/Login";
import Register from "./pages/Register"; // Import the new Register component
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import ServerControl from "./pages/ServerControl";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { ref, set } from "firebase/database";
import { Realtimedb } from "./util/firebase";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the user is already authenticated on app load
  useEffect(() => {
    const authData = getAuthData();
    if (authData) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  // Add activity tracking
  useEffect(() => {
    if (isLoggedIn) {
      const authData = getAuthData();
      if (authData && authData.username) {
        // Update last activity on initial load
        updateLastActivity(authData.username);
        
        // Set up event listeners for user activity
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        
        const activityHandler = () => {
          updateLastActivity(authData.username);
        };
        
        // Add event listeners
        activityEvents.forEach(event => {
          window.addEventListener(event, activityHandler);
        });
        
        // Clean up event listeners
        return () => {
          activityEvents.forEach(event => {
            window.removeEventListener(event, activityHandler);
          });
        };
      }
    }
  }, [isLoggedIn]);
  
  // Function to update last activity timestamp
  const updateLastActivity = (username) => {
    set(ref(Realtimedb, `loggedInUsers/${username}/last_activity`), new Date().toISOString());
  };

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setAuthData(user); // Store user data in localStorage
  };

  const handleLogout = () => {
    clearAuthData();
    setIsLoggedIn(false); // Update isLoggedIn in App to display login screen
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        {isLoggedIn && <Navbar onLogout={handleLogout} />}
        <div className="content-container">
          <Routes>
            <Route 
              path="/login" 
              element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/register" 
              element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />} 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/servers" 
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <ServerControl />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;