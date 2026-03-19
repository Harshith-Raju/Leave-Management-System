import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department_id: '1',
    joining_date: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          department_id: parseInt(formData.department_id),
          joining_date: formData.joining_date,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // After successful signup, automatically log the user in
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: formData.email, 
            password: formData.password 
          }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          onLogin(loginData.employee, loginData.token);
        } else {
          setError(loginData.error || 'Signup successful but login failed. Please try logging in.');
        }
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="auth-split">
          <div className="auth-brand">
            <div className="auth-brand-inner">
              <div className="auth-badge">
                <i className="fas fa-user-plus"></i>
              </div>
              <h1 className="auth-brand-title">Create your account</h1>
              <p className="auth-brand-subtitle">
                Join your team workspace and request leave in seconds.
              </p>
              <ul className="auth-brand-points">
                <li><i className="fas fa-id-badge"></i> Employee profile</li>
                <li><i className="fas fa-calendar-alt"></i> Leave requests</li>
                <li><i className="fas fa-balance-scale"></i> Balance tracking</li>
              </ul>
            </div>
          </div>

          <div className="auth-form">
            <div className="login-card-inner">
              <div className="login-header">
                <h2 className="login-title">Create account</h2>
                <p className="login-subtitle">Fill in the details to get started</p>
              </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
              <i className="fas fa-user input-icon"></i>
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
              <i className="fas fa-envelope input-icon"></i>
            </div>
            
            <div className="form-group">
              <label htmlFor="department" className="form-label">Department</label>
              <select
                id="department"
                name="department_id"
                className="form-control"
                value={formData.department_id}
                onChange={handleInputChange}
                required
              >
                <option value="1">Engineering</option>
                <option value="2">HR</option>
                <option value="3">Marketing</option>
                <option value="4">Sales</option>
                <option value="5">Finance</option>
              </select>
              <i className="fas fa-building input-icon"></i>
            </div>
            
            <div className="form-group">
              <label htmlFor="joining_date" className="form-label">Joining Date</label>
              <input
                type="date"
                id="joining_date"
                name="joining_date"
                className="form-control"
                value={formData.joining_date}
                onChange={handleInputChange}
                required
              />
              <i className="fas fa-calendar-day input-icon"></i>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
                autoComplete="new-password"
                required
                minLength="6"
              />
              <i className="fas fa-lock input-icon"></i>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                minLength="6"
              />
              <i className="fas fa-check-circle input-icon"></i>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating account...
                </>
              ) : (
                <>
                  <i className="fas fa-arrow-right"></i>
                  Continue
                </>
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;