import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../util/firebase";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import SettingsIcon from '../assets/icons/SettingsIcon';
import { RiUserLine, RiLockLine } from 'react-icons/ri';
import { getAuthData } from '../util/auth';
import '../styles/index.css';

const Settings = () => {
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authData = getAuthData();
        if (authData && authData.uid) {
          const userRef = doc(db, 'users', authData.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setName(userSnap.data().name || authData.username);
          }
        }
      } catch (err) {
        setError('Failed to load user data: ' + err.message);
      }
    };
    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name) {
      setError('Please enter a name');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const authData = getAuthData();
      if (authData && authData.uid) {
        // Update Firestore
        await setDoc(doc(db, 'users', authData.uid), { name }, { merge: true });
        // Update Auth profile
        await updateProfile(auth.currentUser, { displayName: name });
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setError('Please enter both current and new passwords');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const authData = getAuthData();
      const credential = EmailAuthProvider.credential(
        `${authData.username}@broadcastrelay.com`,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError('Failed to update password: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="container">
      <div className="card">
        {/* <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <SettingsIcon style={{ width: 40, height: 40, color: 'var(--primary-color)' }} aria-label="Settings" />
          <h1 className="title">Settings</h1>
        </div> */}
        
        <h1 className="title">Settings</h1>

        {error && <div className="error-message" aria-live="polite">{error}</div>}
        {success && <div className="success-message" aria-live="polite">{success}</div>}
        
        <div className="card mb-3">
          <h2 className="subtitle">Update Profile</h2>
          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
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
    // </div>
  );
};

export default Settings;