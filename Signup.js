// Signup.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import "./styles.css";

const Signup = () => {
  // Variables to bind to the input fields on signup.js
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Get login function from context
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  // Create the front-end API end-point for signup
  const handleSignUp = (event) => {
  event.preventDefault();
  setError('');

  if (!username || !password) 
  {
    setError("All fields are required.");
    return;
  }

  axios.post('http://localhost:9000/createUser', { username, password })
    .then((res) => {
      login(res.data);
      navigate('/dashboard');
    })
    .catch((err) => {
      if (err.response) {
        if (err.response.status === 500) {
          setError('Account with that username already exists. Please create a different one.');
        } else {
          setError('Server error. Please try again later.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
      console.error('Signup error:', err);
    });
};


  return (
    <div className="container">
      <h2>Browser Studio - User Signup</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSignUp}>
        <label htmlFor="userId" id="ud">Create a Username:</label>
        <input 
          type="text"
          id="userId"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter Username"
          required 
        />

        <label htmlFor="password" id="ps">Create a Password:</label>
        <input 
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
          required 
        />
        <br />
        <button type="submit">Signup</button>
      </form>
      <p>Already have an account with us?<br /><Link to="/Login">Login</Link></p>
    </div>
  );
};

export default Signup;