import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = ({ user, token }) => {
  const [profile, setProfile] = useState(user);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  });

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/employees/${user.id}/balance`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setLeaveBalance(data.balance);
        }
      } catch (error) {
        console.error('Failed to fetch leave balance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveBalance();
  }, [user.id, token]); // include stable props in deps

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:3000/api/employees/${user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setProfile((prev) => ({ ...prev, ...formData }));
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-content">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Personal Information</h2>
            <button
              className="btn btn-outline"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <label>Name:</label>
                <span>{profile.name}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{profile.email}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span className="role-badge">{profile.role}</span>
              </div>
              <div className="info-item">
                <label>Department:</label>
                <span>{profile.department_name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Joining Date:</label>
                <span>
                  {new Date(profile.joining_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Leave Balance</h2>
          </div>
          <div className="leave-balance">
            <div className="balance-value">{leaveBalance} days</div>
            <p>Remaining leave days for this year</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
