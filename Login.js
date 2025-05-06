// Login.js
import React, { useState, useContext } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import "./styles.css";

const Login = () => {
  // Create variables to bind to the input fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Get login function from context
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  // Create the front-end API end-point
  const handleLogin = (event) => {
    event.preventDefault();
    setError('');
    
    axios.get('http://localhost:9000/getUser', { params: { username, password }})
      .then((res) => {
        if (res.data) {
          // Save user to context and localStorage
          login(res.data);
          
          // Redirect to home page or dashboard
          navigate('/dashboard');
        } else {
          setError('Invalid username or password.');
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        setError('Error logging in. Please try again later.');
      });
  };

  return (
    <div className="container">
      <h2>Browser Studio - User Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleLogin}>
        <label htmlFor="userId" id="ud">Username:</label>
        <input 
          type="text"
          id="userId"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter Username"
          required 
        />

        <label htmlFor="password" id="ps">Password:</label>
        <input 
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
          required 
        />
        <br />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account with us? <br /><Link to="/Signup">Signup</Link></p>
    </div>
  );
};

export default Login;