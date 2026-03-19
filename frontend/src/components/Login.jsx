import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.employee, data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="auth-split">
          {/* Brand Panel - Left Side */}
          <div className="auth-brand">
            <div className="auth-brand-inner">
              <div className="auth-badge">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h1 className="auth-brand-title">Leave Management</h1>
              <p className="auth-brand-subtitle">
                Track leave, approvals, and balances in one place.
              </p>
              <ul className="auth-brand-points">
                <li>
                  <i className="fas fa-shield-alt"></i>
                  <span>Secure access</span>
                </li>
                <li>
                  <i className="fas fa-bolt"></i>
                  <span>Fast approvals</span>
                </li>
                <li>
                  <i className="fas fa-chart-line"></i>
                  <span>Clear insights</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Form Panel - Right Side */}
          <div className="auth-form">
            <div className="login-card-inner">
              <div className="login-header">
                <h2 className="login-title">Welcome back</h2>
                <p className="login-subtitle">Sign in to continue</p>
              </div>

              {error && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <div className="input-wrapper">
                    <i className="fas fa-envelope input-icon"></i>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-wrapper">
                    <i className="fas fa-lock input-icon"></i>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue
                      <i className="fas fa-arrow-right"></i>
                    </>
                  )}
                </button>
              </form>

              <details className="demo-details">
                <summary className="demo-summary">Use demo accounts</summary>
                <div className="demo-content">
                  <div className="demo-row">
                    <span className="demo-label">Admin</span>
                    <span className="demo-value">admin@company.com / password</span>
                  </div>
                  <div className="demo-row">
                    <span className="demo-label">Employee</span>
                    <span className="demo-value">employee@company.com / password123</span>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;