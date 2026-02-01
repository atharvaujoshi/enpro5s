
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

export async function GET(request, { params }) {
  try {
    if (!uri) {
      return Response.json({ error: 'Database connection not configured' }, { status: 500 })
    }

    const zoneId = parseInt(params.id)

    if (isNaN(zoneId)) {
      return Response.json({ error: 'Invalid zone ID' }, { status: 400 })
    }

    const client = new MongoClient(uri)
    await client.connect()

    const db = client.db()
    const zone = await db.collection('zones').findOne({ id: zoneId })

    await client.close()

    if (!zone) {
      return Response.json({ id: zoneId, workRecords: [] })
    }

    // Sort workRecords by deadline (nearest first)
    if (zone.workRecords && zone.workRecords.length > 0) {
      zone.workRecords.sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline) : new Date(8640000000000000); // Max Date
        const dateB = b.deadline ? new Date(b.deadline) : new Date(8640000000000000);
        return dateA - dateB;
      });
    }

    return Response.json(zone)
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to fetch zone data' }, { status: 500 })
  }
}
