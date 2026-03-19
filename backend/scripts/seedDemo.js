const Department = require('../models/department');
const Employee = require('../models/employee');
const LeaveBalance = require('../models/leaveBalance');
const Counter = require('../models/counter');

async function seedDemo() {
  // Departments (used for department_name joins)
  const departments = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'HR' },
    { id: 3, name: 'Marketing' },
    { id: 4, name: 'Sales' },
    { id: 5, name: 'Finance' },
  ];

  for (const dept of departments) {
    await Department.updateOne({ id: dept.id }, { $setOnInsert: dept }, { upsert: true });
  }

  // Ensure counters exist
  await Counter.findOneAndUpdate(
    { name: 'employees' },
    { $setOnInsert: { name: 'employees', seq: 0 } },
    { upsert: true }
  );
  await Counter.findOneAndUpdate(
    { name: 'leave_requests' },
    { $setOnInsert: { name: 'leave_requests', seq: 0 } },
    { upsert: true }
  );

  // Admin: admin@company.com / password
  const existingAdmin = await Employee.findByEmail('admin@company.com');
  if (existingAdmin.length === 0) {
    const admin = await Employee.createEmployee({
      name: 'Admin User',
      email: 'admin@company.com',
      department_id: 1,
      joining_date: '2024-01-01',
      password: 'password',
      role: 'admin',
    });
    await LeaveBalance.ensureForEmployee(admin.id);
  }
}

module.exports = { seedDemo };

