const bcrypt = require('bcryptjs');
const Counter = require('./counter');
const Department = require('./department');
const { mongoose } = require('../config/database');

const EmployeeSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department_id: { type: Number, required: true, index: true },
    joining_date: { type: Date, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
    created_at: { type: Date, default: Date.now },
  },
  { collection: 'employees' }
);

EmployeeSchema.statics.createEmployee = async function createEmployee(employeeData) {
  const hashedPassword = await bcrypt.hash(employeeData.password, 10);
  const id = await Counter.next('employees');

  const doc = await this.create({
    id,
    name: employeeData.name,
    email: employeeData.email,
    department_id: employeeData.department_id,
    joining_date: new Date(employeeData.joining_date),
    password: hashedPassword,
    role: employeeData.role || 'employee',
  });

  return doc.toObject();
};

EmployeeSchema.statics.findByEmail = async function findByEmail(email) {
  const doc = await this.findOne({ email: String(email).toLowerCase().trim() }).lean();
  return doc ? [doc] : [];
};

EmployeeSchema.statics.findByIdWithDepartment = async function findByIdWithDepartment(id) {
  const doc = await this.findOne({ id: Number(id) }).lean();
  if (!doc) return [];
  const dept = await Department.findOne({ id: doc.department_id }).lean();
  return [
    {
      ...doc,
      department_name: dept?.name ?? null,
    },
  ];
};

EmployeeSchema.statics.findAllWithDepartments = async function findAllWithDepartments() {
  const employees = await this.find({}).lean();
  const deptIds = Array.from(new Set(employees.map((e) => e.department_id)));
  const depts = await Department.find({ id: { $in: deptIds } }).lean();
  const deptMap = new Map(depts.map((d) => [d.id, d.name]));

  return employees.map((e) => ({
    ...e,
    department_name: deptMap.get(e.department_id) ?? null,
  }));
};

EmployeeSchema.statics.updateEmployee = async function updateEmployee(id, employeeData) {
  const update = {};
  if (employeeData.name != null) update.name = employeeData.name;
  if (employeeData.email != null) update.email = String(employeeData.email).toLowerCase().trim();
  if (employeeData.department_id != null) update.department_id = employeeData.department_id;
  if (employeeData.joining_date != null) update.joining_date = new Date(employeeData.joining_date);
  if (employeeData.role != null) update.role = employeeData.role;
  if (employeeData.password != null) update.password = await bcrypt.hash(employeeData.password, 10);

  const res = await this.updateOne({ id: Number(id) }, { $set: update });
  return { affectedRows: res.modifiedCount || res.matchedCount };
};

EmployeeSchema.statics.deleteEmployee = async function deleteEmployee(id) {
  const res = await this.deleteOne({ id: Number(id) });
  return { affectedRows: res.deletedCount };
};

module.exports = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);