const db = require('../config/database');

const LeaveBalance = {
  // Get leave balance for an employee
  findByEmployeeId: (employeeId, callback) => {
    const query = 'SELECT * FROM leave_balances WHERE employee_id = ?';
    db.query(query, [employeeId], callback);
  },
  
  // Update leave balance
  update: (employeeId, newBalance, callback) => {
    const query = 'UPDATE leave_balances SET balance = ? WHERE employee_id = ?';
    db.query(query, [newBalance, employeeId], callback);
  },
  
  // Deduct leave days (with transaction handling)
  deductDays: (employeeId, days, callback) => {
    const query = 'UPDATE leave_balances SET balance = balance - ? WHERE employee_id = ? AND balance >= ?';
    db.query(query, [days, employeeId, days], (err, results) => {
      if (err) return callback(err);
      
      if (results.affectedRows === 0) {
        return callback(new Error('Insufficient leave balance'));
      }
      
      callback(null, results);
    });
  }
};

module.exports = LeaveBalance;