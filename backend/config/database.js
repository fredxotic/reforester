import mongoose from 'mongoose';

// 1. Declare a global variable to cache the connection promise/instance.
// The 'global' object is used to prevent the connection from being 
// cleared during hot-reloads in development and for reuse in Vercel.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // 2. If a connection is already established, return it immediately.
  if (cached.conn) {
    // console.log(`✅ Using cached MongoDB connection.`);
    return cached.conn;
  }

  // 3. If a connection promise is pending, wait for it.
  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Optional: Set connection pooling options here if needed, 
      // though caching usually handles this better on Vercel.
    };
    
    // Set up the promise to connect
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongooseInstance) => {
        // Log on first successful connection
        console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:', error.message);
        // CRITICAL: Clear the promise so the next invocation can try again
        cached.promise = null; 
        throw error;
      });
  }

  // 4. Await the connection promise and save the connection instance.
  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;

// --- CRITICAL FINAL STEP ---
// In your main server file (e.g., server.js), remove the global call:
// // REMOVE: connectDB(); 
// Instead, call connectDB() at the START of every API route 
// or within a common middleware to ensure connection before DB operations.