const Employee = require('../models/employee');
const LeaveBalance = require('../models/leaveBalance');

const employeeController = {
  // Get all employees
  getAllEmployees: (req, res) => {
    Employee.findAllWithDepartments()
      .then((results) => {
        const employees = results.map((employee) => {
          const { password, ...employeeWithoutPassword } = employee;
          delete employeeWithoutPassword._id;
          delete employeeWithoutPassword.__v;
          return employeeWithoutPassword;
        });
        res.json(employees);
      })
      .catch(() => res.status(500).json({ error: 'Database error' }));
  },
  
  // Get employee by ID
  getEmployeeById: (req, res) => {
    const { id } = req.params;
    
    Employee.findByIdWithDepartment(id)
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
  },
  
  // Create new employee
  createEmployee: (req, res) => {
    const isAdmin = req.user?.role === 'admin';
    const payload = { ...req.body };

    if (!isAdmin) {
      payload.role = 'employee';
    }

    Employee.createEmployee(payload)
      .then(async (result) => {
        await LeaveBalance.ensureForEmployee(result.id);
        res.status(201).json({
          message: 'Employee created successfully',
          employee: { id: result.id, ...payload, role: result.role || payload.role },
        });
      })
      .catch((err) => {
        if (String(err?.message || '').toLowerCase().includes('duplicate') || err?.code === 11000) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      });
  },
  
  // Update employee
  updateEmployee: (req, res) => {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';
    const isSelf = Number(req.user?.id) === Number(id);

    const update = { ...req.body };
    if (!isAdmin && isSelf) {
      // self-update is limited to profile fields
      const allowed = {};
      if (update.name != null) allowed.name = update.name;
      if (update.email != null) allowed.email = update.email;
      return Employee.updateEmployee(id, allowed)
        .then((results) => {
          if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
          }
          res.json({ message: 'Employee updated successfully' });
        })
        .catch(() => res.status(500).json({ error: 'Database error' }));
    }

    Employee.updateEmployee(id, update)
      .then((results) => {
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee updated successfully' });
      })
      .catch(() => res.status(500).json({ error: 'Database error' }));
  },
  
  // Delete employee
  deleteEmployee: (req, res) => {
    const { id } = req.params;
    
    Employee.deleteEmployee(id)
      .then((results) => {
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
      })
      .catch(() => res.status(500).json({ error: 'Database error' }));
  },
  
  // Get employee leave balance
  getLeaveBalance: (req, res) => {
    const employeeId = req.params.id || req.user.id;
    LeaveBalance.findByEmployeeId(employeeId)
      .then(async (results) => {
        if (results.length === 0) {
          const created = await LeaveBalance.ensureForEmployee(employeeId);
          const sanitized = { ...created };
          delete sanitized._id;
          delete sanitized.__v;
          return res.json(sanitized);
        }
        const sanitized = { ...results[0] };
        delete sanitized._id;
        delete sanitized.__v;
        res.json(sanitized);
      })
      .catch(() => res.status(500).json({ error: 'Database error' }));
  }
};

module.exports = employeeController;