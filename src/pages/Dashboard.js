import React, { useState, useEffect } from 'react';
import { ref, onValue } from "firebase/database";
import { collection, getDocs } from "firebase/firestore";
import { Realtimedb, db } from "../util/firebase";
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    activeServers: 0,
    totalServers: 4,
    eventName: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all registered users from Firestore
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const totalRegisteredUsers = usersSnapshot.docs
          .filter(doc => doc.id !== 'admin') // Exclude admin user
          .length;
        
        // Fetch online users data from Realtime DB
        const usersRef = ref(Realtimedb, 'loggedInUsers');
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val() || {};
          const users = Object.keys(data).filter(key => key !== 'admin');
          const onlineUsers = users.filter(user => data[user]?.login_status).length;
          
          // Fetch server data
          const serverRef = ref(Realtimedb, 'servers');
          onValue(serverRef, (serverSnapshot) => {
            const serverData = serverSnapshot.val() || {};
            const activeServers = Object.values(serverData).filter(server => server?.status).length;
            const eventName = serverData.event_name || 'No Event';
            
            setStats({
              totalUsers: totalRegisteredUsers,
              onlineUsers,
              activeServers,
              totalServers: 4,
              eventName
            });
            
            setLoading(false);
          });
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="large" text="Loading dashboard data..." />;
  }

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="dashboard-header">
        <div className="event-card">
          <h2>Current Event</h2>
          <p className="event-name">{stats.eventName}</p>
        </div>
      </div>
      
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon users-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon online-icon">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-content">
            <h3>Online Users</h3>
            <p className="stat-value">{stats.onlineUsers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon server-icon">
            <i className="fas fa-server"></i>
          </div>
          <div className="stat-content">
            <h3>Active Servers</h3>
            <p className="stat-value">{stats.activeServers} / {stats.totalServers}</p>
          </div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>System Status</h2>
        <div className="status-cards">
          <div className={`status-card ${stats.onlineUsers > 0 ? 'status-good' : 'status-warning'}`}>
            <h3>User Activity</h3>
            <p>{stats.onlineUsers > 0 ? 'Users are currently active' : 'No users currently active'}</p>
          </div>
          
          <div className={`status-card ${stats.activeServers > 0 ? 'status-good' : 'status-critical'}`}>
            <h3>Server Status</h3>
            <p>{stats.activeServers > 0 ? `${stats.activeServers} servers running` : 'No servers running'}</p>
          </div>
          
          <div className="status-card status-good">
            <h3>System Health</h3>
            <p>All systems operational</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;