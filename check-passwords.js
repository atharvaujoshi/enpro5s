const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;

async function syncAndVerify() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    // Drop the username index if it exists, as it's causing conflicts
    try {
      await db.collection('users').dropIndex('username_1');
      console.log('Dropped username_1 index');
    } catch (e) {
      // Index might not exist
    }

    const defaultUsers = [
      { email: 'atharva.jjoshi20@gmail.com', role: 'ceo', name: 'CEO' },
      { email: 'spydarr1106@gmail.com', role: 'user', name: 'Standard User' },
      { email: 'atharvaujoshi@gmail.com', role: 'zone_manager', name: 'Zone Manager 1', assignedZone: 1 }
    ]

    const hashedPassword = await bcrypt.hash('password', 12);
    for (const u of defaultUsers) {
      await db.collection('users').updateOne(
        { email: u.email },
        { 
          $setOnInsert: { password: hashedPassword },
          $set: { role: u.role, name: u.name, assignedZone: u.assignedZone }
        },
        { upsert: true }
      );
    }

    const users = await db.collection('users').find({
      email: { $in: defaultUsers.map(u => u.email) }
    }).toArray();
    
    console.log('Final Password Verification:');
    for (const user of users) {
      const isMatch = await bcrypt.compare('password', user.password);
      console.log(`- ${user.email} (${user.role}): ${isMatch ? 'Match (password)' : 'NO MATCH'}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

syncAndVerify();
