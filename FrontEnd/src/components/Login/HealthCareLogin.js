import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const HealthCareLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5043/api/Login/login', {
        email,
        password
      });

      const token = response?.data?.token || response?.data?.jwt || response?.data?.accessToken;
      if (!token) {
        setError('Invalid user credentials');
        return;
      }

      // Store JWT in sessionStorage
      sessionStorage.setItem('token', token);

      // Decode the token to get user info
      const decoded = jwtDecode(token);
      console.log('Decoded JWT:', decoded);
      
      // Extract user id and role from common claim keys
      const msRoleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      const msNameIdKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

      const userId = decoded.uid || decoded.sub || decoded[msNameIdKey] || decoded.nameid || decoded.userId;
      let role = decoded[msRoleKey] || decoded.role || decoded.roles;
      if (Array.isArray(role)) {
        role = role[0];
      }

      if (userId) sessionStorage.setItem('userId', userId);
      if (role) sessionStorage.setItem('role', role);

      // Redirect based on role
      if (role === 'Admin') {
        navigate('/Admin-Dash');
      } else if (role === 'Patient' || role === 'User') {
        navigate('/patient-dashboard');
      } else if (role === 'Doctor') {
        navigate('/doctor-dash');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-branding">
          <div className="branding-content">
            <p className="branding-subtitle">Welcome to Our</p>
            <h1>Healthcare Platform</h1>
            <p className="branding-description">
              Providing seamless and secure access to your health records, appointments, and care team.
            </p>
          </div>
        </div>
        <div className="login-form-area">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-header">
              <h2>Login to your Account</h2>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button">Login</button>

            <p className="signup-text">
              Don't have an account?
              <a href="/register/patient"> Sign up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HealthCareLogin;
