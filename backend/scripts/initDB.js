require('dotenv').config();
const { connectToDatabase } = require('../config/database');
const Department = require('../models/department');
const Employee = require('../models/employee');
const LeaveBalance = require('../models/leaveBalance');
const Counter = require('../models/counter');

async function ensureCounters() {
  // Initialize counters close to MySQL sample ids
  await Counter.findOneAndUpdate({ name: 'employees' }, { $setOnInsert: { name: 'employees', seq: 0 } }, { upsert: true });
  await Counter.findOneAndUpdate({ name: 'leave_requests' }, { $setOnInsert: { name: 'leave_requests', seq: 0 } }, { upsert: true });
}

async function seed() {
  await connectToDatabase();
  await ensureCounters();

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

  // Demo accounts used by frontend
  // Admin: admin@company.com / password
  // Employee: test@company.com / password123
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

  const existingEmployee = await Employee.findByEmail('test@company.com');
  if (existingEmployee.length === 0) {
    const emp = await Employee.createEmployee({
      name: 'Test Employee',
      email: 'test@company.com',
      department_id: 2,
      joining_date: '2024-02-01',
      password: 'password123',
      role: 'employee',
    });
    await LeaveBalance.ensureForEmployee(emp.id);
  }

  console.log('MongoDB initialization completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Init failed:', err);
  process.exit(1);
});