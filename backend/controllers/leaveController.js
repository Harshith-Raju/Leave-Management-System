const LeaveRequest = require('../models/leaveRequest');
const LeaveBalance = require('../models/leaveBalance');
const Employee = require('../models/employee');
const mongoose = require('mongoose');

const leaveController = {
  applyForLeave: async (req, res) => {
    try {
      const employeeId = req.user.id;
      const { start_date, end_date, reason } = req.body;

      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const today = new Date();

      if (endDate < startDate) {
        return res.status(400).json({ error: 'End date cannot be before start date' });
      }

      if (startDate < today.setHours(0, 0, 0, 0)) {
        return res.status(400).json({ error: 'Cannot apply for leave in the past' });
      }

      const leaveDays = calculateWorkingDays(startDate, endDate);

      const leaveBalance = await LeaveBalance.findOne({ employee_id: employeeId });

      if (!leaveBalance) {
        return res.status(404).json({ error: 'Leave balance not found' });
      }

      if (leaveBalance.balance < leaveDays) {
        return res.status(400).json({ error: 'Insufficient leave balance' });
      }

      const overlapExists = await LeaveRequest.findOne({
        employee_id: employeeId,
        status: 'APPROVED',
        $or: [
          { start_date: { $lte: endDate }, end_date: { $gte: startDate } }
        ]
      });

      if (overlapExists) {
        return res.status(400).json({ error: 'Overlapping leave request exists' });
      }

      const employee = await Employee.findById(employeeId);

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const joiningDate = new Date(employee.joining_date);

      if (startDate < joiningDate) {
        return res.status(400).json({ error: 'Cannot apply for leave before joining date' });
      }

      const leaveRequest = new LeaveRequest({
        employee_id: employeeId,
        start_date,
        end_date,
        reason
      });

      await leaveRequest.save();

      res.status(201).json({
        message: 'Leave application submitted successfully',
        leaveRequestId: leaveRequest._id
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  },

  getAllLeaveRequests: async (req, res) => {
    try {
      const leaveRequests = await LeaveRequest.find()
        .populate({
          path: 'employee_id',
          select: 'name email department_id',
          populate: {
            path: 'department_id',
            select: 'name'
          }
        })
        .sort({ createdAt: -1 });

      const result = leaveRequests.map(lr => ({
        id: lr._id,
        employee_id: lr.employee_id?._id,
        employee_name: lr.employee_id?.name,
        employee_email: lr.employee_id?.email,
        department_name: lr.employee_id?.department_id?.name,
        start_date: lr.start_date,
        end_date: lr.end_date,
        reason: lr.reason,
        status: lr.status,
        created_at: lr.createdAt,
        updated_at: lr.updatedAt
      }));

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  },

  getMyLeaveRequests: async (req, res) => {
    try {
      const employeeId = req.user.id;

      const leaveRequests = await LeaveRequest.find({ employee_id: employeeId })
        .populate({
          path: 'employee_id',
          select: 'name department_id',
          populate: {
            path: 'department_id',
            select: 'name'
          }
        })
        .sort({ createdAt: -1 });

      const result = leaveRequests.map(lr => ({
        id: lr._id,
        employee_id: lr.employee_id?._id,
        employee_name: lr.employee_id?.name,
        department_name: lr.employee_id?.department_id?.name,
        start_date: lr.start_date,
        end_date: lr.end_date,
        reason: lr.reason,
        status: lr.status,
        created_at: lr.createdAt,
        updated_at: lr.updatedAt
      }));

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  },

  getLeaveRequestById: async (req, res) => {
    try {
      const { id } = req.params;

      const leaveRequest = await LeaveRequest.findById(id)
        .populate({
          path: 'employee_id',
          select: 'name email department_id',
          populate: {
            path: 'department_id',
            select: 'name'
          }
        });

      if (!leaveRequest) {
        return res.status(404).json({ error: 'Leave request not found' });
      }

      const result = {
        id: leaveRequest._id,
        employee_id: leaveRequest.employee_id?._id,
        employee_name: leaveRequest.employee_id?.name,
        employee_email: leaveRequest.employee_id?.email,
        department_name: leaveRequest.employee_id?.department_id?.name,
        start_date: leaveRequest.start_date,
        end_date: leaveRequest.end_date,
        reason: leaveRequest.reason,
        status: leaveRequest.status,
        created_at: leaveRequest.createdAt,
        updated_at: leaveRequest.updatedAt
      };

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  },

  updateLeaveStatus: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const leaveRequest = await LeaveRequest.findById(id)
        .populate('employee_id')
        .session(session);

      if (!leaveRequest) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Leave request not found' });
      }

      if (leaveRequest.status !== 'PENDING') {
        await session.abortTransaction();
        return res.status(400).json({ error: 'Leave request already processed' });
      }

      if (status === 'APPROVED') {
        const startDate = new Date(leaveRequest.start_date);
        const endDate = new Date(leaveRequest.end_date);
        const leaveDays = calculateWorkingDays(startDate, endDate);

        const leaveBalance = await LeaveBalance.findOne({
          employee_id: leaveRequest.employee_id
        }).session(session);

        if (!leaveBalance || leaveBalance.balance < leaveDays) {
          await session.abortTransaction();
          return res.status(400).json({ error: 'Insufficient leave balance' });
        }

        leaveBalance.balance -= leaveDays;
        await leaveBalance.save({ session });

        leaveRequest.status = status;
        await leaveRequest.save({ session });

        await session.commitTransaction();
        res.json({ message: 'Leave request approved successfully' });
      } else {
        leaveRequest.status = status;
        await leaveRequest.save({ session });

        await session.commitTransaction();
        res.json({ message: 'Leave request rejected' });
      }
    } catch (err) {
      await session.abortTransaction();
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    } finally {
      session.endSession();
    }
  }
};

function calculateWorkingDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

module.exports = leaveController;
