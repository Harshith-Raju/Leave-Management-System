const Employee = require('../models/employee');
const LeaveBalance = require('../models/leaveBalance');

const employeeController = {
  getAllEmployees: async (req, res) => {
    try {
      const employees = await Employee.find()
        .populate('department_id', 'name')
        .select('-password');

      const result = employees.map(employee => ({
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department_id: employee.department_id?._id,
        department_name: employee.department_id?.name,
        joining_date: employee.joining_date,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt
      }));

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  },

  getEmployeeById: async (req, res) => {
    try {
      const { id } = req.params;

      const employee = await Employee.findById(id)
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
  },

  createEmployee: async (req, res) => {
    try {
      const employee = new Employee(req.body);
      await employee.save();

      const leaveBalance = new LeaveBalance({
        employee_id: employee._id,
        balance: 20
      });
      await leaveBalance.save();

      res.status(201).json({
        message: 'Employee created successfully',
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          department_id: employee.department_id,
          joining_date: employee.joining_date
        }
      });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Database error' });
    }
  },

  updateEmployee: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, department_id, joining_date } = req.body;

      const employee = await Employee.findByIdAndUpdate(
        id,
        { name, department_id, joining_date },
        { new: true, runValidators: true }
      );

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({ message: 'Employee updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  },

  deleteEmployee: async (req, res) => {
    try {
      const { id } = req.params;

      const employee = await Employee.findByIdAndDelete(id);

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      await LeaveBalance.deleteOne({ employee_id: id });

      res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  },

  getLeaveBalance: async (req, res) => {
    try {
      const employeeId = req.params.id || req.user.id;

      const leaveBalance = await LeaveBalance.findOne({ employee_id: employeeId });

      if (!leaveBalance) {
        return res.status(404).json({ error: 'Leave balance not found' });
      }

      const result = {
        id: leaveBalance._id,
        employee_id: leaveBalance.employee_id,
        balance: leaveBalance.balance,
        last_updated: leaveBalance.updatedAt
      };

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
};

module.exports = employeeController;
