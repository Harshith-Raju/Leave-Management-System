const Employee = require('../models/employee');
const LeaveBalance = require('../models/leaveBalance');

const employeeController = {
  // Get all employees
  getAllEmployees: (req, res) => {
    Employee.findAll((err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Remove passwords from response
      const employees = results.map(employee => {
        const { password, ...employeeWithoutPassword } = employee;
        return employeeWithoutPassword;
      });
      
      res.json(employees);
    });
  },
  
  // Get employee by ID
  getEmployeeById: (req, res) => {
    const { id } = req.params;
    
    Employee.findById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      const employee = results[0];
      // Remove password from response
      delete employee.password;
      
      res.json(employee);
    });
  },
  
  // Create new employee
  createEmployee: (req, res) => {
    Employee.create(req.body, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.status(201).json({ 
        message: 'Employee created successfully', 
        employee: result 
      });
    });
  },
  
  // Update employee
  updateEmployee: (req, res) => {
    const { id } = req.params;
    
    Employee.update(id, req.body, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      res.json({ message: 'Employee updated successfully' });
    });
  },
  
  // Delete employee
  deleteEmployee: (req, res) => {
    const { id } = req.params;
    
    Employee.delete(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      res.json({ message: 'Employee deleted successfully' });
    });
  },
  
  // Get employee leave balance
  getLeaveBalance: (req, res) => {
    const employeeId = req.params.id || req.user.id;
    
    LeaveBalance.findByEmployeeId(employeeId, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Leave balance not found' });
      }
      
      res.json(results[0]);
    });
  }
};

module.exports = employeeController;