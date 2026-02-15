const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function checkUsers() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const users = await db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users in database:`);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.role}): ${u.email}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkUsers();
