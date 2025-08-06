import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('username:password')) {
  console.warn('⚠️  No valid MongoDB URI provided. Using mock data for development.');
  console.warn('⚠️  To connect to real database, update MONGODB_URI in .env file.');
}

interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global variable to cache the database connection
let cached: ConnectionCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  // Skip connection if no valid URI provided
  if (!MONGODB_URI || MONGODB_URI.includes('username:password')) {
    console.log('⚠️  Skipping MongoDB connection - using mock data');
    return null;
  }

  // If we have a cached connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If we don't have a promise for a connection, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    // Wait for the connection to be established
    cached.conn = await cached.promise;
    console.log('✅ Connected to MongoDB Atlas');
    return cached.conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Falling back to mock data');
    return null;
  }
}

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('📴 Mongoose disconnected from MongoDB Atlas');
});

// Close connection when app terminates
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

export default mongoose;
