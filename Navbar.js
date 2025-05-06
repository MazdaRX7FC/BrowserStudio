// Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './navbar.css'; // Uses its own stylesheet

// Component to view all links in a horizontal list at the top of the page.
const Navbar = () => {
    const { currentUser, logout } = useContext(UserContext);
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        navigate('/Login');
    };

    return (
        <nav className="navbar">
            <ul>
                <li><Link to="/Dashboard">Dashboard</Link></li>
                <li><Link to="/ProjectManagement">Projects</Link></li>
                <li><Link to="/BrowserStudio">BrowserStudio</Link></li>
                <li><Link to="/Feedback">User Feedback</Link></li>
                {currentUser && (
                    <li className="user-menu">
                        <span className="username">Hello, {currentUser.username}</span>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;