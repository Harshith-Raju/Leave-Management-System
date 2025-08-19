import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="logo">
          <i className="fas fa-calendar-alt"></i>
          <span>LeaveManager</span>
        </Link>
        
        <nav>
          <ul>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/leaves">Leaves</Link>
            </li>
            {(user.role === 'admin' || user.role === 'manager') && (
              <li>
                <Link to="/employees">Employees</Link>
              </li>
            )}
            <li>
              <Link to="/profile">Profile</Link>
            </li>
          </ul>
        </nav>
        
        <div className="user-actions">
          <div className="user-info">
            <i className="fas fa-user-circle"></i>
            <span>{user.name} ({user.role})</span>
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;