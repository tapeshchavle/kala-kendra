import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  // Increase timeout for Atlas SRV resolution
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  console.warn('⚠️ MONGODB_URI is not set. Database connection will fail at runtime.');
  // Return a rejected promise instead of throwing synchronously at module load (which breaks Nextjs build)
  clientPromise = Promise.reject(new Error('Please add your Mongo URI to Vercel Environment Variables (.env.local)'));
} else {
  // Fix DNS to prefer IPv4 for Atlas SRV
  try {
    const dns = require('dns');
    dns.setDefaultResultOrder('ipv4first');
  } catch {}

  if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;
