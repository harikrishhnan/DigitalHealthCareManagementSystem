import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminRegister = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const adminData = {
        name: fullName,   
        email,
        phoneNo,
        password
      };

      const response = await axios.post(
        'http://localhost:5043/api/Registration/RegisterAdmin',
        adminData
      );

      if (response.status === 201) {
        setSuccess('Admin registered successfully!');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) {
          setError('A user with this email already exists.');
        } else {
          setError(err.response.data.message || 'Registration failed.');
        }
      } else {
        setError('Server not reachable.');
      }
    }
  };

  return (
    <div className="auth-page-container">
      <form className="auth-form" onSubmit={handleAdminRegister}>
        <h2>Admin Registration</h2>
        <p style={{ textAlign: 'center', marginTop: '-15px', marginBottom: '20px', color: '#666' }}>
          Create a new administrator account.
        </p>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

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
          <label htmlFor="phoneNo">Phone Number</label>
          <input
            type="tel"
            id="phoneNo"
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
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

        <button type="submit" className="auth-button">Register Admin</button>

        <p className="auth-switch-text">
          Already an admin? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default AdminRegister;
