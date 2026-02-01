
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function migrateZones() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected.');
    const db = client.db();

    // 1. Rename 'zoneId' to 'id' if 'id' doesn't exist
    const updateResult = await db.collection('zones').updateMany(
      { zoneId: { $exists: true }, id: { $exists: false } },
      { $rename: { "zoneId": "id" } }
    );
    console.log(`Renamed 'zoneId' to 'id' for ${updateResult.modifiedCount} documents.`);

    // 2. Ensure all zones 1-13 exist
    const existingZones = await db.collection('zones').find({}).toArray();
    const existingIds = new Set(existingZones.map(z => z.id || z.zoneId)); // Handle both just in case

    const newZones = [];
    for (let i = 1; i <= 13; i++) {
      if (!existingIds.has(i)) {
        newZones.push({
          id: i,
          workRecords: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    if (newZones.length > 0) {
      await db.collection('zones').insertMany(newZones);
      console.log(`Created ${newZones.length} missing zones.`);
    } else {
      console.log('All zones 1-13 already exist.');
    }

    // 3. Ensure workRecords is initialized
    await db.collection('zones').updateMany(
      { workRecords: { $exists: false } },
      { $set: { workRecords: [] } }
    );
    console.log('Ensured workRecords array exists for all zones.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

migrateZones();
