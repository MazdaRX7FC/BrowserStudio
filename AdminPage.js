import React, { useState } from 'react';
import axios from 'axios';

const AdminPage = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (password === 'admin123') { // Simplified auth
            setIsAuthenticated(true);
            const res = await axios.get('http://localhost:9000/allFeedbacks');
            setFeedbacks(res.data);
        } else {
            alert('Incorrect password');
        }
    };

    return (
        <div className="container">
            {!isAuthenticated ? (
                <form onSubmit={handleLogin}>
                    <h2>Admin Login</h2>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Enter admin password" 
                        required 
                    />
                    <button type="submit">Login</button>
                </form>
            ) : (
                <>
                    <h2>All Submitted Feedbacks</h2>
                    {feedbacks.length === 0 ? (
                        <p>No feedbacks found.</p>
                    ) : (
                        <ul>
                            {feedbacks.map((fb, idx) => (
                                <li key={idx}>
                                    <strong>{fb.name}</strong> ({fb.email}, {fb.phone}):<br />
                                    {fb.feedback}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminPage;
