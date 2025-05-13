import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ref, set } from "firebase/database";
import { Realtimedb } from "./util/firebase";
import { clearAuthData, getAuthData, setAuthData } from "./util/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import ServerControl from "./pages/ServerControl";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import './styles/index.css';

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
    set(ref (Realtimedb, `loggedInUsers/${username}/last_activity`), new Date().toISOString());
  };

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setAuthData(user); // Store user data in localStorage
  };

  const handleLogout = () => {
    const authData = getAuthData();
    if (authData && authData.username) {
      // Clear user activity on logout
      set(ref(Realtimedb, `loggedInUsers/${authData.username}`), null);
    }
    clearAuthData();
    setIsLoggedIn(false); // Update isLoggedIn to display login screen
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card text-center" aria-live="polite">
          <div className="spinner spinner-medium spinner-primary" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="container">
        {isLoggedIn && <Navbar onLogout={handleLogout} />}
        <div className="card">
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
            {/* Add ChatMonitor route */}
            <Route
              path="/chats"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  {/** Lazy import if desired */}
                  {React.createElement(require('./pages/ChatMonitor').default)}
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