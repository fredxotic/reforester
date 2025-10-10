import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reforestRouter from './routes/reforest.js';
import authRouter from './routes/auth.js';
import projectRouter from './routes/projects.js';
import analyticsRouter from './routes/analytics.js'; // ADD THIS LINE
import connectDB from './config/database.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Updated CORS for Vercel
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://reforester.vercel.app',
    'https://reforester-git-main-your-username.vercel.app',
    'https://reforester-your-username.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', reforestRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/analytics', analyticsRouter); // ADD THIS LINE

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ReForester API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint for Vercel
app.get('/', (req, res) => {
  res.json({ 
    message: 'ReForester API is running!',
    endpoints: {
      analysis: '/api/reforest',
      auth: '/api/auth',
      projects: '/api/projects',
      analytics: '/api/analytics', // ADD THIS LINE
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export for Vercel serverless functions
export default app;

// Only listen locally, not on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🌳 ReForester backend running on port ${PORT}`);
    console.log(`🔐 Authentication endpoints available at /api/auth`);
    console.log(`📊 Project management available at /api/projects`);
    console.log(`📈 Advanced analytics available at /api/analytics`); // ADD THIS LINE
  });
}