const db = require('../config/database');
const bcrypt = require('bcryptjs');

const Employee = {
  // Create a new employee
  create: (employeeData, callback) => {
    bcrypt.hash(employeeData.password, 10, (err, hashedPassword) => {
      if (err) return callback(err);
      
      const query = `
        INSERT INTO employees (name, email, department_id, joining_date, password) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.query(
        query, 
        [employeeData.name, employeeData.email, employeeData.department_id, employeeData.joining_date, hashedPassword], 
        (err, results) => {
          if (err) return callback(err);
          
          // Initialize leave balance for the new employee
          const balanceQuery = 'INSERT INTO leave_balances (employee_id, balance) VALUES (?, ?)';
          db.query(balanceQuery, [results.insertId, 20], (err) => {
            if (err) return callback(err);
            callback(null, { id: results.insertId, ...employeeData });
          });
        }
      );
    });
  },
  
  // Find employee by email
  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM employees WHERE email = ?';
    db.query(query, [email], callback);
  },
  
  // Find employee by ID
  findById: (id, callback) => {
    const query = `
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.id = ?
    `;
    db.query(query, [id], callback);
  },
  
  // Get all employees
  findAll: (callback) => {
    const query = `
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id
    `;
    db.query(query, callback);
  },
  
  // Update employee
  update: (id, employeeData, callback) => {
    const query = 'UPDATE employees SET name = ?, department_id = ?, joining_date = ? WHERE id = ?';
    db.query(query, [employeeData.name, employeeData.department_id, employeeData.joining_date, id], callback);
  },
  
  // Delete employee
  delete: (id, callback) => {
    const query = 'DELETE FROM employees WHERE id = ?';
    db.query(query, [id], callback);
  }
};

module.exports = Employee;