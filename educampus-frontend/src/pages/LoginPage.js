import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css'; // We can reuse the same CSS!

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const loginData = { email, password };

      // Make the POST request to your backend's login route
      const response = await axios.post(
        'http://localhost:5001/api/users/login', // The login endpoint
        loginData
      );

      // If login is successful:
      console.log('Login successful:', response.data);

      // Save the user's data (and token) in the browser
      localStorage.setItem('educampusUser', JSON.stringify(response.data));

      // Redirect the user to the dashboard
      navigate('/dashboard');

    } catch (error) {
      // If the backend sends an error (e.g., "Invalid email or password")
      console.error('Login error:', error.response.data.message);
      alert(error.response.data.message); // Show the error
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h1>Sign In</h1>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
          </div>
          <button type="submit" className="form-button">
            Login
          </button>
        </form>
        <p className="form-link">
          Don't have an account? <Link to="/">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;