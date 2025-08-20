import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleDoctorRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      
      const doctorData = {
        name,
        email,
        phoneNo,
        speciality,
        password
      };

      const response = await axios.post(
        'http://localhost:5043/api/Registration/RegisterDoctor',
        doctorData
      );

      if (response.status === 201) {
        setSuccess('Doctor registered successfully!');
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
      <form className="auth-form" onSubmit={handleDoctorRegister}>
        <h2>Doctor Registration</h2>
        <p style={{ textAlign: 'center', marginTop: '-15px', marginBottom: '20px', color: '#666' }}>
          Create a new practitioner account.
        </p>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <label htmlFor="speciality">Speciality</label>
          <input
            type="text"
            id="speciality"
            value={speciality}
            onChange={(e) => setSpeciality(e.target.value)}
            placeholder="e.g., Cardiology, Pediatrics"
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

        <button type="submit" className="auth-button">Register as Doctor</button>

        <p className="auth-switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default DoctorRegister;
