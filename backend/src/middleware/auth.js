const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authorized to access this route. Please login.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'fail',
        message: 'Account has been deactivated',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please login again.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Token expired. Please login again.',
      });
    }

    return res.status(401).json({
      status: 'fail',
      message: 'Not authorized to access this route',
    });
  }
};

// Authorize based on roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
