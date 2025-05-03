// Dashboard.js
import React, { useContext } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const Dashboard = () => {
  const { currentUser, logout } = useContext(UserContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="container">
      <h2>Browser Studio - Dashboard</h2>
      <div className="welcome-box">
        <h3>Welcome, {currentUser?.username || 'User'}!</h3>
        <p>You are now logged in to your account.</p>
      </div>
      
      <div className="user-info">
        <h4>Your Account Details:</h4>
        <p><strong>Username:</strong> {currentUser?.username}</p>
      </div>
      
      <div className="dashboard-actions">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default Dashboard;