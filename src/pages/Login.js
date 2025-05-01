import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { doc, getDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, Realtimedb } from "../util/firebase";
import { Link } from 'react-router-dom'; // Add this import
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Check if the user exists in Firestore
      const userRef = doc(db, "users", username);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Check if password matches
        if (userData.password === password) {
          // Update login status in Realtime Database
          await set(ref(Realtimedb, `loggedInUsers/${username}`), {
            login_status: true,
            last_login: new Date().toISOString(),
            last_activity: new Date().toISOString() // Add last activity timestamp
          });
          
          // Call the onLogin callback with user data
          onLogin({ username, name: userData.name });
        } else {
          setError('Invalid password');
        }
      } else {
        setError('User not found');
      }
    } catch (error) {
      setError('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img 
            src="https://img.icons8.com/fluency/96/000000/broadcast.png" 
            alt="Broadcast Relay Logo" 
            className="login-logo"
          />
          <h1>Broadcast Relay</h1>
          <p>Admin Portal</p>
        </div>
        
        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password-input"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" color="white" text="" /> : 'Login'}
          </button>
          
          {/* Add registration link */}
          <div className="register-link">
            New admin? <Link to="/register">Register here</Link>
          </div>
        </form>
        
        <div className="login-footer">
          <p>© {new Date().getFullYear()} Broadcast Relay. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;