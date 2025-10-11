import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import connectDB from '../config/database.js';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Ensure JWT secret is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Authentication service unavailable'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Connect to database and find user
    await connectDB();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    res.status(500).json({
      error: 'Authentication failed',
      message: 'Could not authenticate user'
    });
  }
};

export { authenticateToken };