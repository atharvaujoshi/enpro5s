

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function checkUsers() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected successfully to MongoDB.');

    const db = client.db();
    const users = await db.collection('users').find({}).toArray();

    console.log('\n--- Application Users found in Database ---');
    if (users.length === 0) {
      console.log('No users found.');
    } else {
      users.forEach(user => {
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        // We can't see the password, but we can see if the user exists
        console.log('-------------------');
      });
    }

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
  }
}

checkUsers();

