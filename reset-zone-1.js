const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function resetZone1() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    await db.collection('zones').updateOne(
      { id: 1 },
      { $set: { workRecords: [], updatedAt: new Date() } }
    );
    console.log('Zone 1 workRecords cleared.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

resetZone1();
