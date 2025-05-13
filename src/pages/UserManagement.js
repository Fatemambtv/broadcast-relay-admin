import React, { useState, useEffect } from 'react';
import { HiOutlineRefresh } from 'react-icons/hi';
import { CgLogOut } from 'react-icons/cg';
import { RiDeleteBinLine, RiRefreshLine, RiKeyLine } from 'react-icons/ri';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { doc, setDoc, collection, getDocs, deleteDoc, getDoc } from "firebase/firestore";
import { ref, set, onValue, get } from "firebase/database";
import { db, Realtimedb } from "../util/firebase";
import UserIcon from '../assets/icons/UserIcon';
import '../styles/index.css';

const UserManagement = () => {
  const [its, setITS] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminITS, setAdminITS] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  
  // Define inactivity timeout (in milliseconds) - 30 minutes
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

  useEffect(() => {
    // Fetch online status for each user from the Realtime Database
    const fetchOnlineStatusForUsers = async () => {
      try {
        setLoading(true);
        const onlineStatusRef = ref(Realtimedb, 'loggedInUsers');
        onValue(onlineStatusRef, (snapshot) => {
          const data = snapshot.val();
          // Set online status for each user
          setOnlineStatus(data || {});
          setLoading(false);
          
          // Check for inactive users
          checkInactiveUsers(data || {});
        });
      } catch (err) {
        console.error("Error fetching online status:", err);
        setLoading(false);
      }
    };

    fetchOnlineStatusForUsers();
    
    // Set up interval to check for inactive users every 5 minutes
    const inactivityInterval = setInterval(() => {
      const onlineStatusRef = ref(Realtimedb, 'loggedInUsers');
      get(onlineStatusRef).then((snapshot) => {
        const data = snapshot.val();
        checkInactiveUsers(data || {});
      });
    }, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(inactivityInterval);
  }, []);
  
  // Function to check for inactive users and log them out
  const checkInactiveUsers = (usersData) => {
    const currentTime = new Date().getTime();
    
    Object.entries(usersData).forEach(([userId, userData]) => {
      // Skip admin user
      if (userId === 'admin') return;
      
      // Check if user is logged in
      if (userData.login_status) {
        // Get last activity time
        const lastActivity = userData.last_activity ? new Date(userData.last_activity).getTime() : null;
        
        // If last_activity exists and user has been inactive for longer than the timeout
        if (lastActivity && (currentTime - lastActivity > INACTIVITY_TIMEOUT)) {
          console.log(`User ${userId} inactive for too long. Logging out.`);
          handleSignOut(userId);
        }
      }
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs
        .filter(doc => !doc.data().isAdmin)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          showPassword: false // Add showPassword flag
        }));
      setUsers(usersData);
      setLoading(false);
    } catch (err) {
      showNotification(err.message, 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const generatePassword = (name, its) => {
    if (name && name.length > 0 && its && its.length > 0) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
      let randomPassword = '';
      
      randomPassword += name.charAt(0).toLowerCase();
      
      if (its.length >= 4) {
        randomPassword += its.slice(-4);
      }
      
      while (randomPassword.length < 8) {
        randomPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      setPassword(randomPassword);
    } else {
      setPassword('');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.includes(searchTerm)
  );

  const handleSignUp = async (its, password, name) => {
    if (!its || !name || !password) {
      showNotification("Please fill all the fields.", 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      // Store user directly in Firestore (no Firebase Auth)
      await setDoc(doc(db, "users", its), {
        name,
        its,
        password, // Store password directly (consider hashing in production)
        role: 'user',
        createdAt: new Date().toISOString(),
        userType: 'regular',
        isAdmin: false
      });
      
      showNotification("User created successfully!", 'success');
      setITS('');
      setName('');
      setPassword('');
      fetchUsers();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSignUp = async (its, password, name) => {
    if (!its || !name || !password) {
      showNotification("Please fill all the admin fields.", 'error');
      return;
    }

    try {
      setLoading(true);

      // Store admin user directly in Firestore
      await setDoc(doc(db, "users", its), {
        name,
        its,
        password, // Store password directly (consider hashing in production)
        role: 'admin',
        createdAt: new Date().toISOString(),
        userType: 'admin',
        isAdmin: true
      });

      showNotification("Admin user created successfully!", 'success');
      setAdminITS('');
      setAdminName('');
      setAdminPassword('');
      fetchUsers();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (window.confirm(`Are you sure you want to delete user ${uid}?`)) {
      try {
        setLoading(true);
        
        // Get the user document from Firestore
        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.data();
        
        // No Firebase Auth deletion needed
        
        // Delete from Firestore
        await deleteDoc(doc(db, "users", uid));
        
        // Delete from Realtime Database
        if (userData && userData.its) {
          await set(ref(Realtimedb, `loggedInUsers/${userData.its}`), null);
        }
        
        showNotification("User deleted successfully!", 'success');
        fetchUsers();
      } catch (err) {
        showNotification(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignOut = async (its) => {
    try {
      setLoading(true);
      await set(ref(Realtimedb, `/loggedInUsers/${its}/login_status`), false);
      showNotification(`User ${its} signed out successfully!`, 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (userId) => {
    const newPassword = prompt("Enter new password for user:");
    if (!newPassword) {
      showNotification("Password change cancelled.", 'error');
      return;
    }
    
    try {
      setLoading(true);
      // Update password in Firestore
      await setDoc(doc(db, "users", userId), { password: newPassword }, { merge: true });
      showNotification(`Password changed successfully.`, 'success');
      fetchUsers();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    generatePassword(newName, its);
  };

  const handleITSChange = (e) => {
    const newITS = e.target.value;
    setITS(newITS);
    generatePassword(name, newITS);
  };

  const handleTogglePassword = (its) => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === its) {
          return { ...user, showPassword: !user.showPassword };
        }
        return user;
      });
    });
  };

  // Show notification popup
  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2500);
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
      
      <h1 className="title">User Management</h1>

      {/* Admin User Section */}
      <div className="section">
        <h2 className="subtitle">Add Admin User</h2>
        <div className="form-group">
          <div className="form-field">
            <label htmlFor="admin-name" className="form-label">Full Name</label>
            <input
              className="input"
              type="text"
              id="admin-name"
              placeholder="Enter admin's full name"
              value={adminName}
              onChange={e => setAdminName(e.target.value)}
              aria-label="Admin full name"
            />
          </div>
          <div className="form-field">
            <label htmlFor="admin-its" className="form-label">Admin ID</label>
            <input
              className="input"
              type="text"
              id="admin-its"
              placeholder="Enter admin ID"
              value={adminITS}
              onChange={e => setAdminITS(e.target.value)}
              maxLength={8}
              aria-label="Admin ID"
            />
          </div>
          <div className="form-field">
            <label htmlFor="admin-password" className="form-label">Password</label>
            <input
              className="input"
              type="text"
              id="admin-password"
              placeholder="Enter password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              aria-label="Admin password"
            />
          </div>
          <button
            className="button button-primary form-button"
            onClick={() => handleAdminSignUp(adminITS, adminPassword, adminName)}
            disabled={loading}
          >
            {loading ? <div className="spinner spinner-small spinner-primary" /> : 'Add Admin'}
          </button>
        </div>
      </div>
      
      <div className="section">
        <h2 className="subtitle">Add New User</h2>
        <div className="form-group">
          <div className="form-field">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              className="input"
              type="text"
              id="name"
              placeholder="Enter user's full name"
              value={name}
              onChange={handleNameChange}
              aria-label="Full name"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="its" className="form-label">User ID</label>
            <input
              className="input"
              type="text"
              id="its"
              placeholder="Enter user ID"
              value={its}
              onChange={handleITSChange}
              maxLength={8}
              aria-label="User ID"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <input
                className="input input-with-button"
                type="text"
                id="password"
                placeholder="Password will be generated"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
              />
              <button 
                className="flat-button"
                onClick={() => generatePassword(name, its)}
                title="Generate Password"
                aria-label="Generate password"
              >
                <RiRefreshLine size={16} />
              </button>
            </div>
          </div>
          
          <button 
            className="button button-primary form-button"
            onClick={() => handleSignUp(its, password, name)}
            disabled={loading}
          >
            {loading ? <div className="spinner spinner-small spinner-primary" /> : 'Add User'}
          </button>
        </div>
      </div>
      
      <div className="section-header">
        <h2 className="subtitle">Registered Users</h2>
        <div className="section-controls">
          <input
            className="input search-input"
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={handleSearch}
            aria-label="Search users"
          />
          <button 
            className="flat-button"
            onClick={fetchUsers}
            title="Refresh user list"
            aria-label="Refresh user list"
          >
            <HiOutlineRefresh size={18} />
          </button>
        </div>
      </div>
        
      {loading ? (
        <div className="text-center" aria-live="polite">
          <div className="spinner spinner-medium spinner-primary" />
          <p className="mt-2">Loading users...</p>
        </div>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <p className="text-center">No users found.</p>
          ) : (
            <div className="user-list">
              {filteredUsers.map(user => (
                <div key={user.id} className="user-row">
                  <div className="user-info">
                    <UserIcon className="user-icon" aria-label="User" />
                    <span className="user-name">{user.name}</span>
                    <span className="user-id">ID: {user.id}</span>
                    {user.isAdmin && (
                      <span className="admin-badge" style={{
                        background: '#ffe082',
                        color: '#795548',
                        borderRadius: 4,
                        padding: '2px 8px',
                        marginLeft: 8,
                        fontSize: 12,
                        fontWeight: 600
                      }}>Admin</span>
                    )}
                    <span 
                      className="status-dot"
                      style={{ 
                        backgroundColor: onlineStatus[user.id]?.login_status ? 'var(--success)' : 'var(--danger)'
                      }}
                      title={onlineStatus[user.id]?.login_status ? 'Online' : 'Offline'}
                      aria-label={onlineStatus[user.id]?.login_status ? 'User online' : 'User offline'}
                    />
                  </div>
                  <div className="row-actions">
                    <span className="password-text">{user.showPassword ? user.password : '••••••••'}</span>
                    <button 
                      className="flat-button"
                      onClick={() => handleTogglePassword(user.id)}
                      title={user.showPassword ? "Hide password" : "Show password"}
                      aria-label={user.showPassword ? "Hide password" : "Show password"}
                    >
                      {user.showPassword ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                    </button>
                    <button 
                      className="flat-button"
                      onClick={() => handleChangePassword(user.id)}
                      title="Change password"
                      aria-label="Change password"
                    >
                      <RiKeyLine size={16} />
                    </button>
                    {onlineStatus[user.id]?.login_status && (
                      <button 
                        className="flat-button warning-icon"
                        onClick={() => handleSignOut(user.id)}
                        title="Sign out user"
                        aria-label="Sign out user"
                      >
                        <CgLogOut size={16} />
                      </button>
                    )}
                    <button 
                      className="flat-button danger-icon"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete user"
                      aria-label="Delete user"
                    >
                      <RiDeleteBinLine size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserManagement;