// Feedback.js

import axios from 'axios';
import React, { useState } from 'react';
import "./styles.css";

const Feedback = () => {
    // State for each form field
    const [feedback, setFeedback] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleFeedback = (event) => {
        event.preventDefault();

        // Basic input validation
        if (!feedback || !name || !email || !phone) {
            alert("All fields must be filled out");
            return;
        }

        // Send data to the backend
        axios.post('http://localhost:9000/sendFeedback', {
            feedback,
            name,
            email,
            phone
        })
        .then(() => alert('Feedback sent successfully.'))
        .catch((err) => alert('Error in sending feedback.'));
    };

    return (
        <div className="container">
            <h2>Browser Studio - Error Reporting</h2>
            <form onSubmit={handleFeedback}>
                <label htmlFor="name">Name/Username:</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your name" 
                    required 
                />

                <label htmlFor="email">Email:</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your email" 
                    required 
                />

                <label htmlFor="phone">Phone Number:</label>
                <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Enter your phone number" 
                    required 
                />

                <label htmlFor="feedback">Leave a brief description of any issues you have had with BrowserStudio:</label>
                <input 
                    type="text"
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)} 
                    placeholder="Enter your feedback" 
                    required 
                />

                <button type="submit">Send Feedback</button>
            </form>
        </div>
    );
};

export default Feedback;


