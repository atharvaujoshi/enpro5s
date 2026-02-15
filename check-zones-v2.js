const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function checkZones() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const zones = await db.collection('zones').find({}).toArray();
    console.log('Zones and their workRecords:');
    zones.forEach(z => {
      const records = z.workRecords || [];
      const stats = records.reduce((acc, r) => {
        acc[r.status || 'pending']++;
        return acc;
      }, { pending: 0, inprogress: 0, complete: 0, rejected: 0 });
      console.log(`- Zone ${z.id}: ${records.length} records (P: ${stats.pending}, IP: ${stats.inprogress}, C: ${stats.complete}, R: ${stats.rejected})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkZones();
