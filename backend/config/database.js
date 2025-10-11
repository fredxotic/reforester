import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables at the TOP of this file
dotenv.config();

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Check if MONGODB_URI is defined
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  if (cached.conn) {
    console.log(`✅ Using cached MongoDB connection.`);
    return cached.conn;
  }

  if (!cached.promise) {
    // Remove deprecated options for cleaner code
    const opts = {
      bufferCommands: false,
    };
    
    console.log('🔌 Establishing new MongoDB connection...');
    
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:', error.message);
        cached.promise = null; 
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;