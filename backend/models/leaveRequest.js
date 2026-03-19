const { mongoose } = require('../config/database');
const Counter = require('./counter');
const Employee = require('./employee');
const Department = require('./department');

const LeaveRequestSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    employee_id: { type: Number, required: true, index: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    admin_reason: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: 'leave_requests' }
);

async function enrichLeave(leave) {
  const emp = await Employee.findOne({ id: leave.employee_id }).lean();
  const dept = emp ? await Department.findOne({ id: emp.department_id }).lean() : null;
  return {
    ...leave,
    employee_name: emp?.name ?? null,
    employee_email: emp?.email ?? null,
    department_name: dept?.name ?? null,
  };
}

LeaveRequestSchema.statics.createLeave = async function createLeave(leaveData) {
  const id = await Counter.next('leave_requests');
  const doc = await this.create({
    id,
    employee_id: Number(leaveData.employee_id),
    start_date: new Date(leaveData.start_date),
    end_date: new Date(leaveData.end_date),
    reason: leaveData.reason,
    status: 'PENDING',
    admin_reason: '',
  });
  return { insertId: doc.id };
};

LeaveRequestSchema.statics.findById = async function findById(id) {
  const doc = await this.findOne({ id: Number(id) }).lean();
  if (!doc) return [];
  return [await enrichLeave(doc)];
};

LeaveRequestSchema.statics.findByEmployeeId = async function findByEmployeeId(employeeId) {
  const docs = await this.find({ employee_id: Number(employeeId) })
    .sort({ created_at: -1 })
    .lean();
  const emp = await Employee.findOne({ id: Number(employeeId) }).lean();
  const dept = emp ? await Department.findOne({ id: emp.department_id }).lean() : null;
  return docs.map((d) => ({
    ...d,
    employee_name: emp?.name ?? null,
    department_name: dept?.name ?? null,
  }));
};

LeaveRequestSchema.statics.findAll = async function findAll() {
  const docs = await this.find({}).sort({ created_at: -1 }).lean();
  const employeeIds = Array.from(new Set(docs.map((d) => d.employee_id)));
  const employees = await Employee.find({ id: { $in: employeeIds } }).lean();
  const deptIds = Array.from(new Set(employees.map((e) => e.department_id)));
  const depts = await Department.find({ id: { $in: deptIds } }).lean();
  const empMap = new Map(employees.map((e) => [e.id, e]));
  const deptMap = new Map(depts.map((d) => [d.id, d]));

  return docs.map((lr) => {
    const emp = empMap.get(lr.employee_id);
    const dept = emp ? deptMap.get(emp.department_id) : null;
    return {
      ...lr,
      employee_name: emp?.name ?? null,
      employee_email: emp?.email ?? null,
      department_name: dept?.name ?? null,
    };
  });
};

LeaveRequestSchema.statics.updateStatus = async function updateStatus(id, status, admin_reason) {
  const update = { status, updated_at: new Date() };
  if (admin_reason != null) update.admin_reason = admin_reason;
  const res = await this.updateOne({ id: Number(id) }, { $set: update });
  return { affectedRows: res.modifiedCount || res.matchedCount };
};

LeaveRequestSchema.statics.checkOverlap = async function checkOverlap(
  employeeId,
  startDate,
  endDate,
  excludeId = null
) {
  const query = {
    employee_id: Number(employeeId),
    status: 'APPROVED',
    $or: [
      { start_date: { $gte: new Date(startDate), $lte: new Date(endDate) } },
      { end_date: { $gte: new Date(startDate), $lte: new Date(endDate) } },
      { start_date: { $lte: new Date(startDate) }, end_date: { $gte: new Date(endDate) } },
    ],
  };
  if (excludeId) query.id = { $ne: Number(excludeId) };
  const docs = await this.find(query).lean();
  return docs;
};

module.exports =
  mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema);