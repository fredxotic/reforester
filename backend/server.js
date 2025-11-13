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
// 🔐 SECURITY & MIDDLEWARE
// =================================================================
app.use(helmet());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS Configuration
app.use(cors({
  origin: [
    'https://reforester.vercel.app',
    'https://reforester-git-main-fred-kaloki.vercel.app',
    'https://reforester-fred-kaloki.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
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

// ✅ FIXED: Route mounting with proper paths
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
      analysis: 'POST /api/reforest',
      auth: 'POST /api/auth/login, POST /api/auth/register, POST /api/auth/google',
      projects: 'GET /api/projects, POST /api/projects',
      analytics: 'GET /api/analytics/overview',
      species: 'GET /api/species/popular, GET /api/species/search',
      teams: 'GET /api/teams/my-teams, POST /api/teams',
      chat: 'GET /api/chat/project/:projectId, POST /api/chat',
      collaboration: 'POST /api/collaboration/share-project',
      health: 'GET /api/health'
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

// 404 handler - MUST be after all routes
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
      'POST /api/auth/google',
      'GET /api/projects',
      'POST /api/projects',
      'GET /api/analytics/overview',
      'GET /api/teams/my-teams',
      'POST /api/teams',
      'GET /api/chat/project/:projectId',
      'POST /api/chat',
      'POST /api/collaboration/share-project'
    ]
  });
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
    
    if (!process.env.JWT_SECRET) {
      throw new Error('❌ JWT_SECRET environment variable is not defined');
    }

    // Initialize Socket Service
    new SocketService(server);
    console.log('✅ WebSocket service initialized');

    // Only listen if not in Vercel
    if (process.env.NODE_ENV !== 'production') {
      server.listen(PORT, () => {
        console.log(`🌳 ReForester backend running on port ${PORT}`);
        console.log(`🔌 WebSocket: Enabled on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// ✅ VERCEL REQUIREMENT: Export the app
export default app;