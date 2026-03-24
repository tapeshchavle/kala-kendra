const { MongoClient } = require('mongodb');
const fs = require('fs');

async function run() {
  require('dotenv').config({ path: '.env.local' });
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No Mongo URI");

  const client = new MongoClient(uri);
  await client.connect();
  console.log("Connected to MongoDB!");

  const db = client.db();
  const fileData = fs.readFileSync('package.json');
  const base64Data = fileData.toString('base64');

  const result = await db.collection('whatsapp_images').insertOne({
    filename: 'package.json',
    mimeType: 'application/json',
    size: fileData.length,
    base64Data: base64Data,
    createdAt: new Date()
  });

  console.log("Inserted ID:", result.insertedId);
  const fetched = await db.collection('whatsapp_images').findOne({ _id: result.insertedId });
  console.log("Fetched file length:", Buffer.from(fetched.base64Data, 'base64').length);
  
  await client.close();
}

run().catch(console.error);
