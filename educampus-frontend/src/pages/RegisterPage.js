import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css';

// 1. Accept 'role' as a prop
const RegisterPage = ({ role }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { username, email, password, confirmPassword } = formData;
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
    } else {
      try {
        // 2. Create the data object, including the role
        const registerData = {
          username,
          email,
          password,
          role, // Add the role from props
        };

        const response = await axios.post(
          'http://localhost:5001/api/users/register',
          registerData
        );

        console.log('Registration successful:', response.data);
        localStorage.setItem('educampusUser', JSON.stringify(response.data));
        navigate('/dashboard');

      } catch (error) {
        const message = error.response?.data?.message || 'Registration failed';
        console.error('Registration error:', message);
        alert(message);
      }
    }
  };

  // 3. Make the title dynamic
  const title = role === 'teacher' ? 'Teacher Sign Up' : 'Student Sign Up';

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h1>{title}</h1>
        <form onSubmit={onSubmit}>
          {/* ... (The form fields are exactly the same) ... */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              required
            />
          </div>
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
              minLength="6"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              minLength="6"
              required
            />
          </div>
          <button type="submit" className="form-button">
            Create Account
          </button>
        </form>
        <p className="form-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;