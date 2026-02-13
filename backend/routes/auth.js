import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import rateLimit from 'express-rate-limit'; // ⚠️ NEW IMPORT
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import connectDB from '../config/database.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ⚠️ ENHANCEMENT: Authentication Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login/register/resend requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many attempts',
    message: 'Too many requests, please try again after 15 minutes.'
  }
});

// ⚠️ SECURITY FIX: Centralized Token Generation and Cookie Setting
const generateTokenAndSetCookie = (userId, res) => {
  // CRITICAL FIX: Ensure JWT_SECRET is available (checked in server.js startup, but good to re-check)
  const secret = process.env.JWT_SECRET;
  if (!secret) {
      throw new Error('JWT_SECRET is not defined. Cannot generate token securely.');
  }

  const token = jwt.sign(
    { userId }, 
    secret,
    { expiresIn: '7d' } // Expires in 7 days
  );

  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax', // 'None' required for cross-origin cookies in production
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  };

  // Set the JWT in an HTTP-only cookie
  res.cookie('jwt', token, cookieOptions);
  
  // Return the token as well, for the initial successful login response body
  return token;
};

// Register with email/password
router.post('/register', authLimiter, async (req, res) => {
  try {
    await connectDB();

    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, and name are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password too short',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Create user - Hashing handled by User.pre('save') hook (FIX: Removed manual hashing)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({
      email: email.toLowerCase(),
      password, // Plain password is set, hook handles hashing before save
      name,
      verificationToken,
      emailVerified: false
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Generate token and set cookie
    const token = generateTokenAndSetCookie(user._id, res);

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: user.getPublicProfile(),
      token,
      requiresVerification: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Could not create user account'
    });
  }
});

// Login with email/password
router.post('/login', authLimiter, async (req, res) => {
  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Check if user has a password (might be OAuth user)
    if (!user.password) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Please use Google login for this account'
      });
    }

    // Check password - FIX: Use comparePassword method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // ⚠️ ENHANCEMENT: Use a structured error code for frontend to reliably check
      return res.status(403).json({
        error: 'Email not verified',
        message: 'Please verify your email address before logging in',
        errorCode: 'EMAIL_UNVERIFIED' // Specific code for the frontend
      });
    }

    // Generate token and set cookie
    const token = generateTokenAndSetCookie(user._id, res);

    res.json({
      message: 'Login successful',
      user: user.getPublicProfile(),
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Could not authenticate user'
    });
  }
});

// ⚠️ NEW ENDPOINT: Logout to clear the secure cookie
router.post('/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
  });
  
  res.json({ message: 'Logout successful' });
});

// Google OAuth
router.post('/google', authLimiter, async (req, res) => {
  try {
    await connectDB();

    const { token: googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({
        error: 'Missing Google token',
        message: 'Google authentication token is required'
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { googleId }
      ]
    });

    if (user) {
      // Update user with Google data if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        email: email.toLowerCase(),
        name,
        avatar: picture,
        googleId,
        emailVerified: true // Google emails are verified
      });

      await user.save();
    }

    // Generate token and set cookie
    const token = generateTokenAndSetCookie(user._id, res);

    res.json({
      message: 'Google authentication successful',
      user: user.getPublicProfile(),
      token
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({
      error: 'Google authentication failed',
      message: 'Invalid Google token'
    });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    await connectDB();

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Verification token is required'
      });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({
        error: 'Invalid token',
        message: 'Verification token is invalid or expired'
      });
    }

    // Update user
    user.emailVerified = true;
    user.verificationToken = null;
    await user.save();

    // Generate new token and set cookie
    const authToken = generateTokenAndSetCookie(user._id, res);

    res.json({
      message: 'Email verified successfully',
      user: user.getPublicProfile(),
      token: authToken
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Email verification failed',
      message: 'Could not verify email address'
    });
  }
});

// Resend verification email
router.post('/resend-verification', authLimiter, async (req, res) => {
  try {
    await connectDB();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email address is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found with this email'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken, user.name);

    res.json({
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      error: 'Failed to resend verification',
      message: 'Could not send verification email'
    });
  }
});

// Forgot password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    await connectDB();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email address is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({
        message: 'If an account with this email exists, a password reset link has been sent'
      });
    }

    // Generate reset token with 1-hour expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = resetToken;
    user.verificationTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken, user.name);

    res.json({
      message: 'If an account with this email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      message: 'Could not process password reset request'
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    await connectDB();

    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Reset token and new password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password too short',
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({
        error: 'Invalid token',
        message: 'Password reset token is invalid or expired'
      });
    }

    // Check if token has expired
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      user.verificationToken = null;
      user.verificationTokenExpiry = null;
      await user.save();
      return res.status(400).json({
        error: 'Token expired',
        message: 'Password reset link has expired. Please request a new one.'
      });
    }

    // Update password
    user.password = password; // Pre-save hook will hash this
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    
    // Trigger the pre-save hook
    await user.save(); 

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      message: 'Could not reset password'
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    await connectDB();
    res.json({
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'Could not retrieve user profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    await connectDB();

    const { name, preferences } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'Could not update user profile'
    });
  }
});

export default router;