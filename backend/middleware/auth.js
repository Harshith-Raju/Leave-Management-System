const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = {
  // Verify JWT token
  verifyToken: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(400).json({ error: 'Invalid token.' });
    }
  },
  
  // Check if user is admin or manager
  requireManager: (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied. Manager privileges required.' });
    }
    next();
  },
  
  // Check if user is admin
  requireAdmin: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
  }
};

module.exports = auth;