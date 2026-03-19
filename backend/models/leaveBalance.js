const { mongoose } = require('../config/database');

const LeaveBalanceSchema = new mongoose.Schema(
  {
    employee_id: { type: Number, required: true, unique: true, index: true },
    balance: { type: Number, required: true, default: 20, min: 0 },
    last_updated: { type: Date, default: Date.now },
  },
  { collection: 'leave_balances' }
);

LeaveBalanceSchema.statics.findByEmployeeId = async function findByEmployeeId(employeeId) {
  const doc = await this.findOne({ employee_id: Number(employeeId) }).lean();
  return doc ? [doc] : [];
};

LeaveBalanceSchema.statics.ensureForEmployee = async function ensureForEmployee(employeeId) {
  const id = Number(employeeId);
  const doc = await this.findOneAndUpdate(
    { employee_id: id },
    { $setOnInsert: { employee_id: id, balance: 20, last_updated: new Date() } },
    { new: true, upsert: true }
  ).lean();
  return doc;
};

LeaveBalanceSchema.statics.deductDays = async function deductDays(employeeId, days) {
  const id = Number(employeeId);
  const res = await this.findOneAndUpdate(
    { employee_id: id, balance: { $gte: Number(days) } },
    { $inc: { balance: -Number(days) }, $set: { last_updated: new Date() } },
    { new: true }
  );

  if (!res) {
    const err = new Error('Insufficient leave balance');
    throw err;
  }

  return { affectedRows: 1 };
};

module.exports =
  mongoose.models.LeaveBalance || mongoose.model('LeaveBalance', LeaveBalanceSchema);