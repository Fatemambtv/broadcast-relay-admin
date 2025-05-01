import React, { useState, useEffect } from 'react';
import { User, Lock } from 'lucide-react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ref, set, onValue } from "firebase/database";
import { auth, db, Realtimedb } from "../util/firebase";
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Login.css';  // Updated to use the styles directory version

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);

  // Check if user is already logged in elsewhere
  useEffect(() => {
    if (username) {
      const loggedInUserRef = ref(Realtimedb, `loggedInUsers/${username}`);
      onValue(loggedInUserRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.login_status) {
          setIsAlreadyLoggedIn(true);
        } else {
          setIsAlreadyLoggedIn(false);
        }
      });
    }
  }, [username]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    // Check if user is already logged in elsewhere
    if (isAlreadyLoggedIn) {
      setError('Only 1 login allowed per user. Please logout from other device and refresh.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        `${username}@broadcastrelay.com`, 
        password
      );
      
      // Get additional user data from Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Update login status in Realtime Database
        await set(ref(Realtimedb, `loggedInUsers/${username}`), {
          login_status: true,
          last_login: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          name: userData.name
        });
        
        // Call the onLogin callback with user data
        onLogin({ 
          username, 
          name: userData.name,
          uid: userCredential.user.uid
        });
      } else {
        setError('User data not found');
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