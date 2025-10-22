const jwt = require('jsonwebtoken');
const Employee = require('../models/employee');
const Department = require('../models/department');

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const employee = await Employee.findOne({ email }).populate('department_id', 'name');

      if (!employee) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const isMatch = await employee.comparePassword(password);

      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: employee._id, email: employee.email, role: employee.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          department_id: employee.department_id
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  getProfile: async (req, res) => {
    try {
      const employee = await Employee.findById(req.user.id)
        .populate('department_id', 'name')
        .select('-password');

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const result = {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department_id: employee.department_id?._id,
        department_name: employee.department_id?.name,
        joining_date: employee.joining_date,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt
      };

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
};

module.exports = authController;
