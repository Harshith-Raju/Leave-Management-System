const LeaveRequest = require('../models/leaveRequest');
const LeaveBalance = require('../models/leaveBalance');
const Employee = require('../models/employee');
const db = require('../config/database');

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
    LeaveBalance.findByEmployeeId(employeeId, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Leave balance not found' });
      }
      
      const balance = results[0].balance;
      
      if (balance < leaveDays) {
        return res.status(400).json({ error: 'Insufficient leave balance' });
      }
      
      // Check for overlapping leave requests
      LeaveRequest.checkOverlap(employeeId, start_date, end_date, null, (err, overlapResults) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (overlapResults.length > 0) {
          return res.status(400).json({ error: 'Overlapping leave request exists' });
        }
        
        // Check if leave is before joining date
        Employee.findById(employeeId, (err, empResults) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          if (empResults.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
          }
          
          const joiningDate = new Date(empResults[0].joining_date);
          
          if (startDate < joiningDate) {
            return res.status(400).json({ error: 'Cannot apply for leave before joining date' });
          }
          
          // Create leave request
          const leaveData = {
            employee_id: employeeId,
            start_date,
            end_date,
            reason
          };
          
          LeaveRequest.create(leaveData, (err, results) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            
            res.status(201).json({ 
              message: 'Leave application submitted successfully', 
              leaveRequestId: results.insertId 
            });
          });
        });
      });
    });
  },
  
  // Get all leave requests (for managers/admins)
  getAllLeaveRequests: (req, res) => {
    LeaveRequest.findAll((err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    });
  },
  
  // Get leave requests for current employee
  getMyLeaveRequests: (req, res) => {
    const employeeId = req.user.id;
    
    LeaveRequest.findByEmployeeId(employeeId, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    });
  },
  
  // Get leave request by ID
  getLeaveRequestById: (req, res) => {
    const { id } = req.params;
    
    LeaveRequest.findById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      
      res.json(results[0]);
    });
  },
  
  // Approve or reject leave request
  updateLeaveStatus: (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const managerId = req.user.id;
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // First get the leave request details
    LeaveRequest.findById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      
      const leaveRequest = results[0];
      
      // If already processed
      if (leaveRequest.status !== 'PENDING') {
        return res.status(400).json({ error: 'Leave request already processed' });
      }
      
      // If approving, deduct from balance
      if (status === 'APPROVED') {
        const startDate = new Date(leaveRequest.start_date);
        const endDate = new Date(leaveRequest.end_date);
        const leaveDays = calculateWorkingDays(startDate, endDate);
        
        // Use transaction to ensure data consistency
        db.beginTransaction((err) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          // Deduct leave days
          LeaveBalance.deductDays(leaveRequest.employee_id, leaveDays, (err, deductResults) => {
            if (err) {
              return db.rollback(() => {
                res.status(400).json({ error: err.message });
              });
            }
            
            // Update leave request status
            LeaveRequest.updateStatus(id, status, (err, updateResults) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: 'Database error' });
                });
              }
              
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ error: 'Database error' });
                  });
                }
                
                res.json({ message: 'Leave request approved successfully' });
              });
            });
          });
        });
      } else {
        // Just reject the request
        LeaveRequest.updateStatus(id, status, (err, results) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({ message: 'Leave request rejected' });
        });
      }
    });
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