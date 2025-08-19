const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');

// Apply for leave
router.post('/apply', auth.verifyToken, validate.leaveRequest, validate.checkValidation, leaveController.applyForLeave);

// Get all leave requests (admin/manager only)
router.get('/', auth.verifyToken, auth.requireManager, leaveController.getAllLeaveRequests);

// Get my leave requests
router.get('/my-leaves', auth.verifyToken, leaveController.getMyLeaveRequests);

// Get leave request by ID
router.get('/:id', auth.verifyToken, leaveController.getLeaveRequestById);

// Approve/reject leave request (admin/manager only)
router.patch('/:id/status', auth.verifyToken, auth.requireManager, leaveController.updateLeaveStatus);

module.exports = router;