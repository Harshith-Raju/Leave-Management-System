const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/employee');

const authController = {
  // Login employee
  login: (req, res) => {
    const { email, password } = req.body;
    
    // Find employee by email
    Employee.findByEmail(email)
      .then((results) => {
        if (results.length === 0) {
          return res.status(400).json({ error: 'Invalid email or password' });
        }

        const employee = results[0];

        return bcrypt.compare(password, employee.password).then((isMatch) => {
          if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
          }

          const token = jwt.sign(
            { id: employee.id, email: employee.email, role: employee.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          return Employee.findByIdWithDepartment(employee.id).then((fullResults) => {
            if (fullResults.length === 0) {
              return res.status(404).json({ error: 'Employee not found' });
            }

            const fullEmployee = fullResults[0];
            delete fullEmployee.password;
            delete fullEmployee._id;
            delete fullEmployee.__v;

            res.json({ token, employee: fullEmployee });
          });
        });
      })
      .catch(() => res.status(500).json({ error: 'Database error' }));
  },
  
  // Get current user profile
  getProfile: (req, res) => {
    Employee.findByIdWithDepartment(req.user.id)
      .then((results) => {
        if (results.length === 0) {
          return res.status(404).json({ error: 'Employee not found' });
        }

        const employee = results[0];
        delete employee.password;
        delete employee._id;
        delete employee.__v;
        res.json(employee);
      })
      .catch(() => res.status(500).json({ error: 'Database error' }));
  }
};

module.exports = authController;