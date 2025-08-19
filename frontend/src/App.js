import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
// import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import EmployeeManagement from './components/EmployeeManagement';
import LeaveManagement from './components/LeaveManagement';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await fetch('http://localhost:3000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <div className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
              } 
            />
            {/* <Route 
              path="/signup" 
              element={
                user ? <Navigate to="/dashboard" /> : <Signup onLogin={handleLogin} />
              } 
            /> */}
            <Route 
              path="/dashboard" 
              element={
                user ? <Dashboard user={user} token={token} /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/employees" 
              element={
                user && (user.role === 'admin' || user.role === 'manager') ? 
                <EmployeeManagement token={token} /> : <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/leaves" 
              element={
                user ? <LeaveManagement user={user} token={token} /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/profile" 
              element={
                user ? <Profile user={user} token={token} /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/" 
              element={
                user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;