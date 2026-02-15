const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function updateEmails() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    // Check if the user with role 'user' already has the email or needs updating
    // Based on previous check, spydarr1106@gmail.com already exists. 
    // I will try to find that specific user and set their role to 'user'.
    
    // 1. Update CEO
    await db.collection('users').updateOne(
      { role: 'ceo' },
      { $set: { email: 'atharva.jjoshi20@gmail.com' } }
    );
    console.log('CEO email updated to: atharva.jjoshi20@gmail.com');

    // 2. Update Manager 1
    await db.collection('users').updateOne(
      { role: 'zone_manager', assignedZone: 1 },
      { $set: { email: 'atharvaujoshi@gmail.com' } }
    );
    console.log('Manager 1 email updated to: atharvaujoshi@gmail.com');

    // 3. Handle spydarr1106@gmail.com
    // Delete any other user with role 'user' if it has a different email
    await db.collection('users').deleteOne({ role: 'user', email: { $ne: 'spydarr1106@gmail.com' } });
    // Assign role 'user' to spydarr1106@gmail.com
    await db.collection('users').updateOne(
      { email: 'spydarr1106@gmail.com' },
      { $set: { role: 'user', name: 'Standard User' } }
    );
    console.log('User role assigned to: spydarr1106@gmail.com');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateEmails();
