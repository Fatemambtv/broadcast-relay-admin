import React, { useState } from 'react';
import { User, Lock, UserPlus } from 'lucide-react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, Realtimedb } from "../util/firebase";
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import './Login.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [eventName, setEventName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedEventId, setGeneratedEventId] = useState('');
  const navigate = useNavigate();

  // Generate a unique event ID
  const generateEventId = () => {
    const timestamp = new Date().getTime().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomStr}`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!username || !password || !name || !confirmPassword || !eventName) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Check if the admin already exists
      const adminRef = doc(db, "admins", username);
      const adminSnap = await getDoc(adminRef);
      
      if (adminSnap.exists()) {
        setError('Admin with this username already exists. Please login instead.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }
      
      // Generate a unique event ID for this admin
      const eventId = generateEventId();
      setGeneratedEventId(eventId);
      
      // Create new admin in Firestore
      await setDoc(doc(db, "admins", username), {
        name: name,
        password: password,
        role: 'admin',
        eventId: eventId,
        eventName: eventName,
        created_at: new Date().toISOString()
      });
      
      // Create event entry in Realtime Database
      await set(ref(Realtimedb, `events/${eventId}`), {
        name: eventName,
        admin: username,
        created_at: new Date().toISOString(),
        active: true
      });
      
      setSuccess(`Registration successful! Your Event ID is: ${eventId}. Please save this ID as users will need it to log in to your event.`);
      
      // Don't redirect immediately so user can see the event ID
      setTimeout(() => {
        navigate('/login');
      }, 10000);
      
    } catch (error) {
      setError('Registration failed: ' + error.message);
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
          <p>Admin Registration</p>
        </div>
        
        <form className="login-form" onSubmit={handleRegister}>
          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">
              <p>{success}</p>
              {generatedEventId && (
                <div className="event-id-display">
                  <strong>Event ID:</strong> {generatedEventId}
                </div>
              )}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <UserPlus className="input-icon" size={18} />
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="eventName">Event Name</label>
            <div className="input-with-icon">
              <i className="fas fa-calendar-alt input-icon"></i>
              <input
                id="eventName"
                type="text"
                placeholder="Enter event name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
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
                placeholder="Create a password"
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="password-input"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" color="white" text="" /> : 'Register'}
          </button>
          
          <div className="register-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
        
        <div className="login-footer">
          <p>© {new Date().getFullYear()} Broadcast Relay. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;