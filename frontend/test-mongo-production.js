import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// This simulates production environment
console.log('🔍 Testing MongoDB connection in production...');

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri-here';

console.log('MongoDB URI:', MONGODB_URI.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://***:***@'));

async function testConnection() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    // Test a simple operation
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Name:', error.name);
  } finally {
    await client.close();
  }
}

testConnection();