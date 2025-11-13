import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

// Load environment variables FIRST
dotenv.config();

// Database connection
import connectDB from './config/database.js';
import SocketService from './services/socketService.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// =================================================================
// 🔐 CRITICAL SECURITY FIXES
// =================================================================

// 1. HTTP Security Headers (Helmet) [Good Practice]
app.use(helmet());

// 2. Global Rate Limiting [Good Practice]
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `windowMs`
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many requests from this IP, please try again after 15 minutes.'
    });
  }
});
app.use(limiter);

// 3. Cookie Parser [Required for HTTP-only cookie JWT]
app.use(cookieParser());

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://reforester.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
import reforestRouter from './routes/reforest.js';
import authRouter from './routes/auth.js';
import projectRouter from './routes/projects.js';
import analyticsRouter from './routes/analytics.js';
import speciesRouter from './routes/species.js';
import teamsRouter from './routes/teams.js';
import chatRouter from './routes/chat.js';
import collaborationRouter from './routes/collaboration.js';

// Route mounting
app.use('/api/reforest', reforestRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/species', speciesRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/collaboration', collaborationRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ReForester API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'ReForester API is running!',
    endpoints: {
      analysis: '/api/reforest',
      auth: '/api/auth',
      projects: '/api/projects',
      analytics: '/api/analytics',
      species: '/api/species',
      teams: '/api/teams',
      chat: '/api/chat',
      collaboration: '/api/collaboration',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS Error',
      message: 'Origin not allowed'
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /api',
      'GET /api/health',
      'POST /api/reforest',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/projects',
      'GET /api/analytics/overview',
      'GET /api/teams/my-teams',
      'GET /api/chat/project/:projectId'
    ]
  });
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // ⚠️ CRITICAL SECURITY FIX: Ensure JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
        throw new Error('❌ FATAL: JWT_SECRET environment variable is not defined. Server cannot start securely.');
    }

    // Initialize Socket Service
    new SocketService(server);
    console.log('✅ WebSocket service initialized');

    server.listen(PORT, () => {
      console.log(`🌳 ReForester backend running on port ${PORT}`);
      console.log(`📍 Analysis: POST /api/reforest`);
      console.log(`🔐 Authentication: /api/auth`);
      console.log(`📊 Projects: /api/projects`);
      console.log(`📈 Analytics: /api/analytics`);
      console.log(`🌿 Species: /api/species`);
      console.log(`👥 Teams: /api/teams`);
      console.log(`💬 Chat: /api/chat`);
      console.log(`🤝 Collaboration: /api/collaboration`);
      console.log(`🏥 Health: /api/health`);
      console.log(`🔌 WebSocket: Enabled on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;