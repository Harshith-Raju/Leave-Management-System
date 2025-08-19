import React, { useState, useEffect } from 'react';
import './EmployeeManagement.css';

const EmployeeManagement = ({ token }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department_id: '',
    joining_date: '',
    password: ''
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [token]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      // In a real app, you would fetch this from your API
      setDepartments([
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'HR' },
        { id: 3, name: 'Marketing' },
        { id: 4, name: 'Sales' },
        { id: 5, name: 'Finance' }
      ]);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/employees', {
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
          name: '',
          email: '',
          department_id: '',
          joining_date: '',
          password: ''
        });
        fetchEmployees(); // Refresh the list
        alert('Employee added successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to add employee:', error);
      alert('Failed to add employee. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="employee-management">
      <div className="page-header">
        <h1>Employee Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fas fa-plus"></i> Add New Employee
        </button>
      </div>

      {showForm && (
        <div className="card fade-in">
          <div className="card-header">
            <h2 className="card-title">Add New Employee</h2>
          </div>
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
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-control"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Add Employee
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

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Employees List</h2>
          <span className="badge">{employees.length} employees</span>
        </div>
        
        {employees.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Joining Date</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.id} className="slide-in">
                  <td>
                    <div className="employee-info">
                      <i className="fas fa-user-circle"></i>
                      {employee.name}
                    </div>
                  </td>
                  <td>{employee.email}</td>
                  <td>{employee.department_name}</td>
                  <td>{new Date(employee.joining_date).toLocaleDateString()}</td>
                  <td>
                    <span className="role-badge">{employee.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center">No employees found.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;