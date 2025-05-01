import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from "firebase/database";
import { Realtimedb } from "../util/firebase";
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Settings.css';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Add this line
  
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // This is just to check if we can connect to the database
        const adminRef = ref(Realtimedb, 'loggedInUsers/admin');
        onValue(adminRef, (snapshot) => {
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  const handleChangePassword = async () => {
    if (!adminPassword) {
      showMessage('Please enter your current password.');
      return;
    }
    
    if (!newPassword) {
      showMessage('Please enter a new password.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match.');
      return;
    }
    
    try {
      setLoading(true);
      
      // First verify the current password
      const adminRef = ref(Realtimedb, 'users/admin');
      onValue(adminRef, async (snapshot) => {
        const adminData = snapshot.val();
        
        if (adminData && adminData.password === adminPassword) {
          // Password is correct, update it
          await set(ref(Realtimedb, 'users/admin/password'), newPassword);
          showMessage('Password updated successfully!');
          setAdminPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          showMessage('Current password is incorrect.');
        }
        
        setLoading(false);
      }, {
        onlyOnce: true
      });
    } catch (error) {
      console.error("Error changing password:", error);
      showMessage('Error changing password.');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading settings..." />;
  }

  return (
    <div className="settings-container">
      <h1 className="page-title">Settings</h1>
      
      {message && <div className="message-container show">{message}</div>}
      
      <div className="settings-card">
        <h2>Change Admin Password</h2>
        
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <div className="password-input-group">
            <input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter current password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <button 
              type="button" 
              className="toggle-password-btn"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <div className="password-input-group">
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button 
              type="button" 
              className="toggle-password-btn"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <div className="password-input-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        
        <button 
          className="btn-primary" 
          onClick={handleChangePassword}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
      
      <div className="settings-card">
        <h2>System Information</h2>
        
        <div className="info-group">
          <div className="info-item">
            <span className="info-label">Application Version:</span>
            <span className="info-value">1.0.0</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Last Updated:</span>
            <span className="info-value">{new Date().toLocaleDateString()}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Database Connection:</span>
            <span className="info-value success">Connected</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Environment:</span>
            <span className="info-value">{process.env.NODE_ENV || 'development'}</span>
          </div>
        </div>
      </div>
      
      <div className="settings-card">
        <h2>Help & Support</h2>
        
        <div className="support-content">
          <p>If you need assistance with the Broadcast Relay Admin Portal, please contact the system administrator.</p>
          
          <div className="support-links">
            <a href="mailto:support@example.com" className="support-link">
              <i className="fas fa-envelope"></i>
              Email Support
            </a>
            
            <a href="tel:+1234567890" className="support-link">
              <i className="fas fa-phone"></i>
              Call Support
            </a>
            
            <a href="#" className="support-link" onClick={(e) => { e.preventDefault(); window.open('/docs', '_blank'); }}>
              <i className="fas fa-book"></i>
              Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;