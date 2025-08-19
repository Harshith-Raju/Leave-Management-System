const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/employee');

const authController = {
  // Login employee
  login: (req, res) => {
    const { email, password } = req.body;
    
    // Find employee by email
    Employee.findByEmail(email, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
      
      const employee = results[0];
      
      // Check password
      bcrypt.compare(password, employee.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Server error' });
        }
        
        if (!isMatch) {
          return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        // Create and return JWT token
        const token = jwt.sign(
          { id: employee.id, email: employee.email, role: employee.role },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        res.json({
          token,
          employee: {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            department_id: employee.department_id
          }
        });
      });
    });
  },
  
  // Get current user profile
  getProfile: (req, res) => {
    Employee.findById(req.user.id, (err, results) => {
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
  }
};

module.exports = authController;