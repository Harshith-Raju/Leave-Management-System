// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ user, token }) => {
  const [stats, setStats] = useState({
    balance: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch leave balance
        const balanceResponse = await fetch(`http://localhost:3000/api/employees/${user.id}/balance`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const balanceData = await balanceResponse.json();
        
        // Fetch recent leaves
        const leavesResponse = await fetch('http://localhost:3000/api/leaves/my-leaves', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const leavesData = await leavesResponse.json();
        
        if (balanceResponse.ok && leavesResponse.ok) {
          setStats({
            balance: balanceData.balance,
            pending: leavesData.filter(leave => leave.status === 'PENDING').length,
            approved: leavesData.filter(leave => leave.status === 'APPROVED').length,
            rejected: leavesData.filter(leave => leave.status === 'REJECTED').length
          });
          
          setRecentLeaves(leavesData.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="welcome">Welcome back, {user.name}!</h1>
        <p>Here's your leave management overview</p>
      </div>

      <div className="stats">
        <div className="stat-card balance fade-in">
          <div className="stat-icon">
            <i className="fas fa-coins"></i>
          </div>
          <div className="stat-value">{stats.balance}</div>
          <div className="stat-label">Leave Balance</div>
        </div>
        
        <div className="stat-card pending fade-in">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        
        <div className="stat-card approved fade-in">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved Leaves</div>
        </div>
        
        <div className="stat-card rejected fade-in">
          <div className="stat-icon">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Rejected Leaves</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Leave Applications</h2>
          <a href="/leaves" className="btn btn-outline">View All</a>
        </div>
        
        {recentLeaves.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeaves.map(leave => (
                <tr key={leave.id} className="slide-in">
                  <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                  <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                  <td>{leave.reason}</td>
                  <td>
                    <span className={`status status-${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center">No leave applications yet.</p>
        )}
      </div>

      {(user.role === 'admin' || user.role === 'manager') && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Team Management</h2>
          </div>
          <div className="team-actions">
            <a href="/employees" className="btn btn-primary">
              <i className="fas fa-users"></i> Manage Employees
            </a>
            <a href="/leaves" className="btn btn-secondary">
              <i className="fas fa-tasks"></i> Review Leave Requests
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;