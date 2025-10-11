import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ FIXED CORS CONFIGURATION - REPLACE YOUR CURRENT CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://reforester.vercel.app',
      'https://reforester-git-main-fred-kaloki.vercel.app',
      'https://reforester-fred-kaloki.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Allow any Vercel preview deployment
      if (origin.includes('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Now import other modules
import reforestRouter from './routes/reforest.js';
import authRouter from './routes/auth.js';
import projectRouter from './routes/projects.js';
import analyticsRouter from './routes/analytics.js';

// Routes
app.use('/api', reforestRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/analytics', analyticsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ReForester API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ReForester API is running!',
    endpoints: {
      analysis: '/api/reforest',
      auth: '/api/auth',
      projects: '/api/projects',
      analytics: '/api/analytics',
      health: '/health'
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
    path: req.originalUrl 
  });
});

// Export for Vercel serverless functions
export default app;

// Only listen locally, not on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🌳 ReForester backend running on port ${PORT}`);
    console.log(`🔐 Authentication endpoints available at /api/auth`);
    console.log(`📊 Project management available at /api/projects`);
    console.log(`📈 Advanced analytics available at /api/analytics`);
  });
}