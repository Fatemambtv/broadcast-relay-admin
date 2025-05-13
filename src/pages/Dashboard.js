import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../util/firebase";
import UserIcon from '../assets/icons/UserIcon';
import ServerIcon from '../assets/icons/ServerIcon';
import { RiUserFollowLine } from 'react-icons/ri';
import '../styles/index.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    activeServers: 0,
    totalServers: 3,
    eventName: ''
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const totalRegisteredUsers = usersSnapshot.docs
          .filter(doc => doc.data().role !== 'admin')
          .length;

        const loggedInUsersRef = doc(db, 'system', 'loggedInUsers');
        const loggedInUsersSnap = await getDoc(loggedInUsersRef);
        const loggedInUsers = loggedInUsersSnap.data() || {};
        const onlineUsers = Object.values(loggedInUsers).filter(user => user.login_status).length;

        const serversCollection = collection(db, 'servers');
        const serversSnapshot = await getDocs(serversCollection);
        const activeServers = serversSnapshot.docs.filter(doc => doc.data().status).length;

        const eventNameRef = doc(db, 'system', 'eventName');
        const eventNameSnap = await getDoc(eventNameRef);
        const eventName = eventNameSnap.data()?.name || 'No Event';

        setStats({
          totalUsers: totalRegisteredUsers,
          onlineUsers,
          activeServers,
          totalServers: 3,
          eventName
        });

        setLoading(false);
      } catch (error) {
        setNotification({ msg: "Error fetching dashboard data: " + error.message, type: "error" });
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center" aria-live="polite">
        <div className="spinner spinner-large spinner-primary" />
        <p className="mt-2">Loading dashboard data...</p>
      </div>
    );
  }

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
      <div style={{ width: '100%', maxWidth: '1400px', margin: '0.5rem auto 0' }}>
        <h1 className="title">Dashboard</h1>
        
        <div 
          role="region" 
          aria-label="Current event"
          style={{ 
            background: 'var(--gradient-primary)', 
            borderRadius: '0.75rem', 
            padding: '1.5rem', 
            color: 'white', 
            animation: 'fadeIn 0.5s ease',
            marginBottom: '1.5rem'
          }}
        >
          <h2 className="subtitle" style={{ color: 'white' }}>Current Event</h2>
          <p style={{ fontSize: '2rem', textAlign: 'center', fontWeight: '600' }}>
            {stats.eventName}
          </p>
        </div>
        
        <div 
          role="region" 
          aria-label="System statistics"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1.5rem', 
            marginBottom: '1.5rem',
            animation: 'fadeIn 0.5s ease'
          }}
        >
          <div className="stat-card">
            <UserIcon 
              style={{ 
                width: '2.5rem', 
                height: '2.5rem', 
                color: 'var(--primary-color)', 
                marginBottom: '0.5rem' 
              }} 
              className="icon-hover"
              aria-label="Total users"
            />
            <h3 className="subtitle">Total Users</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-color)' }}>
              {stats.totalUsers}
            </p>
          </div>
          
          <div className="stat-card">
            <RiUserFollowLine 
              size="2.5rem" 
              style={{ 
                color: 'var(--primary-color)', 
                marginBottom: '0.5rem' 
              }} 
              className="icon-hover"
              aria-label="Online users"
            />
            <h3 className="subtitle">Online Users</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-color)' }}>
              {stats.onlineUsers}
            </p>
          </div>
          
          <div className="stat-card">
            <ServerIcon 
              style={{ 
                width: '2.5rem', 
                height: '2.5rem', 
                color: 'var(--primary-color)', 
                marginBottom: '0.5rem' 
              }} 
              className="icon-hover"
              aria-label="Active servers"
            />
            <h3 className="subtitle">Active Servers</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-color)' }}>
              {stats.activeServers} / {stats.totalServers}
            </p>
          </div>
        </div>
        
        <div role="region" aria-label="System status" aria-live="polite">
          <h2 className="subtitle">System Status</h2>
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '1.5rem', 
              animation: 'fadeIn 0.5s ease'
            }}
          >
            <div className="status-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span 
                  className="status-dot" 
                  style={{ backgroundColor: stats.onlineUsers > 0 ? 'var(--success)' : 'var(--warning)' }}
                  aria-label={stats.onlineUsers > 0 ? 'Users active' : 'No users active'}
                />
                <h3 className="subtitle">User Activity</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                {stats.onlineUsers > 0 ? 'Users active' : 'No users active'}
              </p>
            </div>
            
            <div className="status-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span 
                  className="status-dot" 
                  style={{ backgroundColor: stats.activeServers > 0 ? 'var(--success)' : 'var(--danger)' }}
                  aria-label={stats.activeServers > 0 ? 'Servers running' : 'No servers running'}
                />
                <h3 className="subtitle">Server Status</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                {stats.activeServers > 0 ? `${stats.activeServers} running` : 'No servers running'}
              </p>
            </div>
            
            <div className="status-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span 
                  className="status-dot" 
                  style={{ backgroundColor: 'var(--success)' }}
                  aria-label="System operational"
                />
                <h3 className="subtitle">System Health</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                All systems operational
              </p>
            </div>
          </div>
        </div>

        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .icon-hover:hover {
              transform: scale(1.1);
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Dashboard;