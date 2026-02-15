const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function clearUsers() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const result = await db.collection('users').deleteMany({});
    console.log(`Deleted ${result.deletedCount} users. The auth route will recreate them on next login.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

clearUsers();
