const LeaveRequest = require('../models/leaveRequest');
const LeaveBalance = require('../models/leaveBalance');
const Employee = require('../models/employee');

const leaveController = {
  // Apply for leave
  applyForLeave: (req, res) => {
    const employeeId = req.user.id;
    const { start_date, end_date, reason } = req.body;
    
    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const today = new Date();
    
    // Check if end date is before start date
    if (endDate < startDate) {
      return res.status(400).json({ error: 'End date cannot be before start date' });
    }
    
    // Check if start date is in the past
    if (startDate < today.setHours(0, 0, 0, 0)) {
      return res.status(400).json({ error: 'Cannot apply for leave in the past' });
    }
    
    // Calculate number of leave days (excluding weekends)
    const leaveDays = calculateWorkingDays(startDate, endDate);
    
    // Check if employee has enough balance
    LeaveBalance.findByEmployeeId(employeeId)
      .then(async (results) => {
        const balanceDoc =
          results.length > 0 ? results[0] : await LeaveBalance.ensureForEmployee(employeeId);

        const balance = balanceDoc.balance;

        if (balance < leaveDays) {
          return res.status(400).json({ error: 'Insufficient leave balance' });
        }

        const overlapResults = await LeaveRequest.checkOverlap(
          employeeId,
          start_date,
          end_date,
          null
        );

        if (overlapResults.length > 0) {
          return res.status(400).json({ error: 'Overlapping leave request exists' });
        }

        const empResults = await Employee.findByIdWithDepartment(employeeId);
        if (empResults.length === 0) {
          return res.status(404).json({ error: 'Employee not found' });
        }

        const joiningDate = new Date(empResults[0].joining_date);
        if (startDate < joiningDate) {
          return res.status(400).json({ error: 'Cannot apply for leave before joining date' });
        }

        const leaveData = { employee_id: employeeId, start_date, end_date, reason };
        const created = await LeaveRequest.createLeave(leaveData);

        res.status(201).json({
          message: 'Leave application submitted successfully',
          leaveRequestId: created.insertId,
        });
      })
      .catch(() => res.status(500).json({ error: 'Database error' }));
  },
  
  // Get all leave requests (for managers/admins)
  getAllLeaveRequests: (req, res) => {
    LeaveRequest.findAll()
      .then((results) =>
        res.json(
          results.map((r) => {
            const sanitized = { ...r };
            delete sanitized._id;
            delete sanitized.__v;
            return sanitized;
          })
        )
      )
      .catch(() => res.status(500).json({ error: 'Database error' }));
  },
  
  // Get leave requests for current employee
  getMyLeaveRequests: (req, res) => {
    const employeeId = req.user.id;
    
    LeaveRequest.findByEmployeeId(employeeId)
      .then((results) =>
        res.json(
          results.map((r) => {
            const sanitized = { ...r };
            delete sanitized._id;
            delete sanitized.__v;
            return sanitized;
          })
        )
      )
      .catch(() => res.status(500).json({ error: 'Database error' }));
  },
  
  // Get leave request by ID
  getLeaveRequestById: (req, res) => {
    const { id } = req.params;
    
    LeaveRequest.findById(id)
      .then((results) => {
        if (results.length === 0) {
          return res.status(404).json({ error: 'Leave request not found' });
        }
        const sanitized = { ...results[0] };
        delete sanitized._id;
        delete sanitized.__v;
        res.json(sanitized);
      })
      .catch(() => res.status(500).json({ error: 'Database error' }));
  },
  
  // Approve or reject leave request
  updateLeaveStatus: (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // First get the leave request details
    LeaveRequest.findById(id)
      .then(async (results) => {
        if (results.length === 0) {
          return res.status(404).json({ error: 'Leave request not found' });
        }

        const leaveRequest = results[0];

        if (leaveRequest.status !== 'PENDING') {
          return res.status(400).json({ error: 'Leave request already processed' });
        }

        const adminReason = req.body?.admin_reason ?? '';

        if (status === 'APPROVED') {
          const startDate = new Date(leaveRequest.start_date);
          const endDate = new Date(leaveRequest.end_date);
          const leaveDays = calculateWorkingDays(startDate, endDate);

          try {
            await LeaveBalance.deductDays(leaveRequest.employee_id, leaveDays);
          } catch (e) {
            return res.status(400).json({ error: e.message });
          }

          await LeaveRequest.updateStatus(id, status, adminReason);
          return res.json({ message: 'Leave request approved successfully' });
        }

        await LeaveRequest.updateStatus(id, status, adminReason);
        return res.json({ message: 'Leave request rejected' });
      })
      .catch(() => res.status(500).json({ error: 'Database error' }));
  }
};

// Helper function to calculate working days between two dates (excluding weekends)
function calculateWorkingDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

module.exports = leaveController;