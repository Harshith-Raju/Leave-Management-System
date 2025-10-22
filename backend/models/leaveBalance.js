const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    default: 20,
    min: 0
  }
}, {
  timestamps: true
});

const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);

module.exports = LeaveBalance;
