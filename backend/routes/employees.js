const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');

// Get all employees (admin/manager only)
router.get('/', auth.verifyToken, auth.requireManager, employeeController.getAllEmployees);

// Get employee by ID
router.get('/:id', auth.verifyToken, employeeController.getEmployeeById);

// Create new employee (admin only)
router.post('/', auth.verifyToken, auth.requireAdmin, validate.employee, validate.checkValidation, employeeController.createEmployee);

// Update employee (admin only)
router.put('/:id', auth.verifyToken, auth.requireAdmin, validate.employee, validate.checkValidation, employeeController.updateEmployee);

// Delete employee (admin only)
router.delete('/:id', auth.verifyToken, auth.requireAdmin, employeeController.deleteEmployee);

// Get employee leave balance
router.get('/:id/balance', auth.verifyToken, employeeController.getLeaveBalance);

module.exports = router;