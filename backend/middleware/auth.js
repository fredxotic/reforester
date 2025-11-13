import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import connectDB from '../config/database.js';

const authenticateToken = async (req, res, next) => {
  try {
    // ⚠️ SECURITY FIX: Retrieve token from HTTP-only cookie first
    let token = req.cookies.jwt;
    
    // Fallback: Check Authorization header (for mobile/external clients)
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No authorization token provided'
      });
    }

    // JWT_SECRET must be defined (checked in server.js, but kept here for safety)
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      res.clearCookie('jwt'); // Clear token attempt
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
      res.clearCookie('jwt'); // Clear invalid token from client
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Clear cookie on any token error (invalid or expired)
    res.clearCookie('jwt');
    
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