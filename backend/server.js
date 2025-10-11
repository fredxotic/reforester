import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// ✅ Database connection
import connectDB from './config/database.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ FIXED CORS CONFIGURATION - More permissive for development
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://reforester.vercel.app',
    'https://reforester-git-main-fred-kaloki.vercel.app',
    'https://reforester-fred-kaloki.vercel.app',
    'https://reforester.netlify.app'
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
import speciesRouter from './routes/species.js'; // ADD THIS

// ✅ FIXED ROUTE MOUNTING - Ensure all routes have /api prefix
app.use('/api/reforest', reforestRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/species', speciesRouter); // ADD THIS

// ✅ FIXED HEALTH CHECK - Add /api prefix
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ReForester API is running',
    timestamp: new Date().toISOString()
  });
});

// ✅ FIXED ROOT ENDPOINT - Add /api prefix
app.get('/api', (req, res) => {
  res.json({ 
    message: 'ReForester API is running!',
    endpoints: {
      analysis: '/api/reforest',
      auth: '/api/auth',
      projects: '/api/projects',
      analytics: '/api/analytics',
      species: '/api/species',
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

// 404 handler - MUST be last
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /api',
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/projects',
      'GET /api/analytics/overview'
    ]
  });
});

// Initialize database connection
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🌳 ReForester backend running on port ${PORT}`);
      console.log(`🔐 Authentication: /api/auth`);
      console.log(`📊 Projects: /api/projects`);
      console.log(`📈 Analytics: /api/analytics`);
      console.log(`🌿 Species: /api/species`);
      console.log(`🏥 Health: /api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export for Vercel serverless functions
export default app;