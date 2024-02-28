import React, { useEffect, useState } from "react";
import "./App.css";
import { clearAuthData, getAuthData, setAuthData } from "./util/auth";
import Login from "./Login";
import AuthComponent from "./AuthComponent";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is already authenticated on app load
  useEffect(() => {
    const authData = getAuthData();
    if (authData) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setAuthData(user); // Store user data in localStorage
  };

  const handleLogout = () => {
    clearAuthData();
    setIsLoggedIn(false); // Update isLoggedIn in App to display login screen
  };

  return (
    <div className="container">
      <div className="content">
        {isLoggedIn ? (
          <AuthComponent isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </div>
  );
}

export default App;