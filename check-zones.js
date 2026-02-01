
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function checkZones() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected.');
    const db = client.db();

    const zones = await db.collection('zones').find({}).toArray();
    console.log(`Found ${zones.length} zones.`);
    
    if (zones.length > 0) {
      console.log('First zone sample:', JSON.stringify(zones[0], null, 2));
    } else {
        console.log("No zones found! The application might need to be run once to initialize them via GET /api/zones");
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkZones();
