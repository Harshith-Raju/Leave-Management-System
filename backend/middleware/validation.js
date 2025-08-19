const { body, validationResult } = require('express-validator');

const validate = {
  // Employee validation rules
  employee: [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('department_id').isInt({ min: 1 }).withMessage('Valid department ID is required'),
    body('joining_date').isDate().withMessage('Valid joining date is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  
  // Leave request validation rules
  leaveRequest: [
    body('start_date').isDate().withMessage('Valid start date is required'),
    body('end_date').isDate().withMessage('Valid end date is required'),
    body('reason').notEmpty().withMessage('Reason is required')
  ],
  
  // Login validation rules
  login: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  
  // Check for validation errors
  checkValidation: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
};

module.exports = validate;