const db = require('../config/database');

const LeaveRequest = {
  // Create a new leave request
  create: (leaveData, callback) => {
    const query = `
      INSERT INTO leave_requests (employee_id, start_date, end_date, reason) 
      VALUES (?, ?, ?, ?)
    `;
    
    db.query(
      query, 
      [leaveData.employee_id, leaveData.start_date, leaveData.end_date, leaveData.reason], 
      callback
    );
  },
  
  // Find leave request by ID
  findById: (id, callback) => {
    const query = `
      SELECT lr.*, e.name as employee_name, e.email as employee_email, d.name as department_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      WHERE lr.id = ?
    `;
    db.query(query, [id], callback);
  },
  
  // Find all leave requests for an employee
  findByEmployeeId: (employeeId, callback) => {
    const query = `
      SELECT lr.*, e.name as employee_name, d.name as department_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      WHERE lr.employee_id = ?
      ORDER BY lr.created_at DESC
    `;
    db.query(query, [employeeId], callback);
  },
  
  // Find all leave requests (for managers/admins)
  findAll: (callback) => {
    const query = `
      SELECT lr.*, e.name as employee_name, e.email as employee_email, d.name as department_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      ORDER BY lr.created_at DESC
    `;
    db.query(query, callback);
  },
  
  // Update leave request status
  updateStatus: (id, status, callback) => {
    const query = 'UPDATE leave_requests SET status = ? WHERE id = ?';
    db.query(query, [status, id], callback);
  },
  
  // Check for overlapping leave requests
  checkOverlap: (employeeId, startDate, endDate, excludeId = null, callback) => {
    let query = `
      SELECT * FROM leave_requests 
      WHERE employee_id = ? 
      AND status = 'APPROVED'
      AND ((start_date BETWEEN ? AND ?) 
        OR (end_date BETWEEN ? AND ?) 
        OR (start_date <= ? AND end_date >= ?))
    `;
    
    let params = [employeeId, startDate, endDate, startDate, endDate, startDate, endDate];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    db.query(query, params, callback);
  }
};

module.exports = LeaveRequest;