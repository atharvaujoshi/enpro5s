
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function checkZone1() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    // Find Zone 1
    const zone = await db.collection('zones').findOne({ id: 1 });
    
    if (zone) {
      console.log('Zone 1 Found:');
      console.log(`Work Records Count: ${zone.workRecords ? zone.workRecords.length : 0}`);
      
      if (zone.workRecords && zone.workRecords.length > 0) {
        console.log('First Record Sample:');
        console.log(JSON.stringify(zone.workRecords[0], null, 2));
      } else {
        console.log('No work records in this zone.');
      }
    } else {
      console.log('Zone 1 NOT found in database.');
    }

  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

checkZone1();
