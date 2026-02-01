
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

export async function GET() {
  try {
    if (!uri) {
      return Response.json({ error: 'Database connection not configured' }, { status: 500 })
    }

    const client = new MongoClient(uri)
    await client.connect()

    const db = client.db()
    const zones = await db.collection('zones').find({}).toArray()

    const statusMap = {}
    zones.forEach(zone => {
      if (zone.beforePhoto && zone.afterPhoto) {
        statusMap[zone.zoneId] = 'complete'
      } else if (zone.beforePhoto) {
        statusMap[zone.zoneId] = 'before'
      } else {
        statusMap[zone.zoneId] = 'pending'
      }
    })

    await client.close()

    return Response.json(statusMap)
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Database connection failed' }, { status: 500 })
  }
}
