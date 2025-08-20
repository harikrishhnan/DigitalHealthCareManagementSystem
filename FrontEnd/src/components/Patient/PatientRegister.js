import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PatientRegister = () => {
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handlePatientRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      
      const patientData = {
        name: patientName,
        email,
        phoneNo,
        password
      };

      const response = await axios.post(
        'http://localhost:5043/api/Registration/RegisterPatient',
        patientData
      );

      if (response.status === 201) {
        setSuccess('Patient registered successfully!');
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
      <form className="auth-form" onSubmit={handlePatientRegister}>
        <h2>Patient Registration</h2>
        <p style={{ textAlign: 'center', marginTop: '-15px', marginBottom: '20px', color: '#666' }}>
          Create your patient account.
        </p>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

        <div className="form-group">
          <label htmlFor="patientName">Full Name</label>
          <input
            type="text"
            id="patientName"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
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

        <button type="submit" className="auth-button">Register as Patient</button>

        <p className="auth-switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default PatientRegister;
