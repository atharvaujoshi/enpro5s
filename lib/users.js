import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export const getManagerEmailForZone = async (zoneId) => {
  if (!uri) return process.env.MANAGER_EMAIL;
  
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const manager = await db.collection('users').findOne({ 
      role: 'zone_manager', 
      assignedZone: parseInt(zoneId) 
    });
    return manager?.email || process.env.MANAGER_EMAIL;
  } catch (error) {
    console.error(`Error fetching manager for zone ${zoneId}:`, error);
    return process.env.MANAGER_EMAIL;
  } finally {
    await client.close();
  }
};
