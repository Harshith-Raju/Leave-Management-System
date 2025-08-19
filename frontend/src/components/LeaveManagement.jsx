import React, { useState, useEffect } from 'react';
import './LeaveManagement.css';

const LeaveManagement = ({ user, token }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [view, setView] = useState('my-leaves');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    admin_reason: ''
  });
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    if (view === 'my-leaves') {
      fetchMyLeaves();
    } else {
      fetchTeamLeaves();
    }
  }, [view, token]);

  const fetchMyLeaves = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/leaves/my-leaves', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamLeaves = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/leaves', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      }
    } catch (error) {
      console.error('Failed to fetch team leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/leaves/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowForm(false);
        setFormData({
          start_date: '',
          end_date: '',
          reason: ''
        });
        fetchMyLeaves();
        alert('Leave application submitted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to apply for leave:', error);
      alert('Failed to apply for leave. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusInputChange = (e) => {
    const { name, value } = e.target;
    setStatusUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openStatusModal = (leaveId, status) => {
    setSelectedLeave(leaveId);
    setStatusUpdateData({
      status: status,
      admin_reason: ''
    });
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/leaves/${selectedLeave}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statusUpdateData)
      });
      
      if (response.ok) {
        setShowStatusModal(false);
        if (view === 'my-leaves') {
          fetchMyLeaves();
        } else {
          fetchTeamLeaves();
        }
        alert(`Leave ${statusUpdateData.status.toLowerCase()} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to update leave status:', error);
      alert('Failed to update leave status. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="leave-management">
      <div className="page-header">
        <h1>Leave Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fas fa-plus"></i> Apply for Leave
        </button>
      </div>

      {showForm && (
        <div className="card fade-in">
          <div className="card-header">
            <h2 className="card-title">Apply for Leave</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea
                className="form-control"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows="4"
                required
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Submit Application
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="view-tabs">
        <button 
          className={`tab ${view === 'my-leaves' ? 'active' : ''}`}
          onClick={() => setView('my-leaves')}
        >
          My Leaves
        </button>
        {(user.role === 'admin' || user.role === 'manager') && (
          <button 
            className={`tab ${view === 'team-leaves' ? 'active' : ''}`}
            onClick={() => setView('team-leaves')}
          >
            Team Leaves
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {view === 'my-leaves' ? 'My Leave Applications' : 'Team Leave Applications'}
          </h2>
          <span className="badge">{leaves.length} leaves</span>
        </div>
        
        {leaves.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                {view === 'team-leaves' && <th>Employee</th>}
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Admin Feedback</th>
                {view === 'team-leaves' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave.id} className="slide-in">
                  {view === 'team-leaves' && (
                    <td>
                      <div className="employee-info">
                        <i className="fas fa-user-circle"></i>
                        {leave.employee_name}
                      </div>
                    </td>
                  )}
                  <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                  <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                  <td>{leave.reason}</td>
                  <td>
                    <span className={`status status-${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    {leave.admin_reason ? (
                      <div className="admin-reason">
                        <i className="fas fa-comment-dots"></i>
                        <span>{leave.admin_reason}</span>
                      </div>
                    ) : (
                      <span className="no-reason">No feedback provided</span>
                    )}
                  </td>
                  {view === 'team-leaves' && leave.status === 'PENDING' && (
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => openStatusModal(leave.id, 'APPROVED')}
                        >
                          <i className="fas fa-check"></i> Approve
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => openStatusModal(leave.id, 'REJECTED')}
                        >
                          <i className="fas fa-times"></i> Reject
                        </button>
                      </div>
                    </td>
                  )}
                  {view === 'team-leaves' && leave.status !== 'PENDING' && (
                    <td>-</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center">No leave applications found.</p>
        )}
      </div>

      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {statusUpdateData.status === 'APPROVED' 
                  ? 'Approve Leave Request' 
                  : 'Reject Leave Request'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowStatusModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  {statusUpdateData.status === 'APPROVED' 
                    ? 'Approval Notes (optional)' 
                    : 'Reason for Rejection (required)'}
                </label>
                <textarea
                  className="form-control"
                  name="admin_reason"
                  value={statusUpdateData.admin_reason}
                  onChange={handleStatusInputChange}
                  rows="4"
                  placeholder={
                    statusUpdateData.status === 'APPROVED' 
                      ? 'Add any additional notes for the employee...' 
                      : 'Please provide a clear reason for rejecting this leave request...'
                  }
                  required={statusUpdateData.status === 'REJECTED'}
                ></textarea>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className={`btn ${statusUpdateData.status === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleStatusUpdate}
                disabled={statusUpdateData.status === 'REJECTED' && !statusUpdateData.admin_reason.trim()}
              >
                Confirm {statusUpdateData.status}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;