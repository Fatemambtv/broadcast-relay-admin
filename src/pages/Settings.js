import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../util/firebase";
import SettingsIcon from '../assets/icons/SettingsIcon';
import { RiUserLine, RiLockLine } from 'react-icons/ri';
import { getAuthData, setAuthData } from '../util/auth';
import '../styles/index.css';

const Settings = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Show notification popup
  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2500);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authData = getAuthData();
        if (authData && authData.uid) {
          const userRef = doc(db, 'users', authData.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setName(userSnap.data().name || authData.username);
            setUsername(authData.uid);
          }
        }
      } catch (err) {
        showNotification('Failed to load user data: ' + err.message, 'error');
      }
    };
    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name || !username) {
      showNotification('Please enter a name and username', 'error');
      return;
    }
    try {
      setLoading(true);
      const authData = getAuthData();
      if (authData && authData.uid) {
        // If username is changed, move document
        if (username !== authData.uid) {
          const oldRef = doc(db, 'users', authData.uid);
          const oldSnap = await getDoc(oldRef);
          if (!oldSnap.exists()) {
            showNotification('User not found', 'error');
            setLoading(false);
            return;
          }
          const userData = oldSnap.data();
          // Check if new username already exists
          const newRef = doc(db, 'users', username);
          const newSnap = await getDoc(newRef);
          if (newSnap.exists()) {
            showNotification('Username already taken', 'error');
            setLoading(false);
            return;
          }
          // Create new doc and delete old
          await setDoc(newRef, { ...userData, name, its: username });
          await deleteDoc(oldRef);
          setAuthData({ ...authData, uid: username, username });
        } else {
          // Only update name
          await setDoc(doc(db, 'users', username), { name }, { merge: true });
        }
        showNotification('Profile updated successfully!', 'success');
      }
    } catch (err) {
      showNotification('Failed to update profile: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showNotification('Please enter both current and new passwords', 'error');
      return;
    }
    try {
      setLoading(true);
      const authData = getAuthData();
      if (authData && authData.uid) {
        const userRef = doc(db, 'users', authData.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          showNotification('User not found', 'error');
          setLoading(false);
          return;
        }
        const userData = userSnap.data();
        if (userData.password !== currentPassword) {
          showNotification('Current password is incorrect', 'error');
          setLoading(false);
          return;
        }
        await setDoc(userRef, { password: newPassword }, { merge: true });
        showNotification('Password updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      showNotification('Failed to update password: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      {/* Notification Popup */}
      {notification && (
        <div
          className={`popup-message ${notification.type === 'error' ? 'popup-error' : 'popup-success'}`}
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            minWidth: 220,
            background: notification.type === 'error' ? '#ffebee' : '#e8f5e9',
            color: notification.type === 'error' ? '#c62828' : '#2e7d32',
            border: `1px solid ${notification.type === 'error' ? '#c62828' : '#2e7d32'}`,
            borderRadius: 8,
            padding: '14px 24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            fontWeight: 500,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.2s'
          }}
          role="alert"
          aria-live="assertive"
        >
          <span style={{ flex: 1 }}>{notification.msg}</span>
          <button
            onClick={() => setNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontSize: 18,
              cursor: 'pointer',
              marginLeft: 8,
              lineHeight: 1
            }}
            aria-label="Close notification"
            tabIndex={0}
          >
            ×
          </button>
        </div>
      )}
      
      <h1 className="title">Settings</h1>

      <div className="card mb-3">
        <h2 className="subtitle">Update Profile</h2>
        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* <div style={{ position: 'relative' }}>
            <RiUserLine style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              className="input"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              aria-label="Name"
              style={{ paddingLeft: '40px' }}
            />
          </div> */}
          <div style={{ position: 'relative' }}>
            <RiUserLine style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              className="input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              aria-label="Username"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button 
            type="submit" 
            className="button button-primary"
            disabled={loading}
          >
            {loading ? <div className="spinner spinner-small spinner-primary" /> : 'Update Profile'}
          </button>
        </form>
      </div>
      
      <div className="card">
        <h2 className="subtitle">Change Password</h2>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <RiLockLine style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              className="input"
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              aria-label="Current password"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <RiLockLine style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              className="input"
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              aria-label="New password"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button 
            type="submit" 
            className="button button-primary"
            disabled={loading}
          >
            {loading ? <div className="spinner spinner-small spinner-primary" /> : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;