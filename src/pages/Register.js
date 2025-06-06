import React, { useState } from 'react';
// Removed: import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, Realtimedb } from "../util/firebase";
import { Link, useNavigate } from 'react-router-dom';
import novaLogo from '../assets/images/green-logo.png';
import { RiUserLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import '../styles/index.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Check if admin user already exists
      const adminDoc = await getDoc(doc(db, "users", username));
      if (adminDoc.exists()) {
        setError('Admin user already exists with this username');
        setLoading(false);
        return;
      }

      // Store admin user directly in Firestore
      const userData = {
        name: username,
        its: username,
        password, // Store password directly (consider hashing in production)
        role: 'admin',
        userType: 'admin',
        isAdmin: true,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", username), userData);
      
      // Update login status in Realtime Database
      await set(ref(Realtimedb, `loggedInUsers/${username}`), {
        login_status: true,
        last_login: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        name: username
      });
      
      // Auto-login by navigating to dashboard
      navigate('/dashboard');
    } catch (error) {
      setError('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px' }}>
        <div className="text-center mb-3">
        <img src={novaLogo} alt="Nova Cast" className="nav-logo" aria-label="App logo" />
          {/* <h1 className="title">Broadcast Relay</h1> */}
          <p className="subtitle">Register Admin</p>
        </div>
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {error && <div className="error-message" aria-live="polite">{error}</div>}
          
          <div style={{ position: 'relative' }}>
            <RiUserLine style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              className="input"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              aria-label="Username"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <RiLockLine style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              aria-label="Password"
              style={{ paddingLeft: '40px', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--primary-color)',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
            </button>
          </div>
          
          <button 
            type="submit" 
            className="button button-primary"
            disabled={loading}
          >
            {loading ? <div className="spinner spinner-small spinner-primary" /> : 'Register'}
          </button>
          
          <p className="text-center mt-2">
            Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login here</Link>
          </p>
        </form>
        
        <p className="text-center mt-3" style={{ fontSize: '12px', color: 'var(--text-light)' }}>
          © {new Date().getFullYear()} Broadcast Relay. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;