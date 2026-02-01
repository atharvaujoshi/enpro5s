
import { MongoClient } from 'mongodb'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'

const uri = process.env.MONGODB_URI

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only CEO can manual ping
    if (session?.user?.role !== 'ceo') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workId } = params
    
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()

    // Find the zone containing this work record
    const zone = await db.collection('zones').findOne(
      { "workRecords._id": workId },
      { projection: { id: 1, "workRecords.$": 1 } }
    )

    if (!zone || !zone.workRecords || zone.workRecords.length === 0) {
      await client.close()
      return Response.json({ error: 'Work record not found' }, { status: 404 })
    }

    const workRecord = zone.workRecords[0]
    const managerEmail = `manager${zone.id}@company.com`

    // Log the ping (Mock email sending)
    console.log(`[MANUAL PING] CEO pinged ${managerEmail} for Work ID ${workId} (Due: ${workRecord.deadline})`)

    // Update the record to show it was recently pinged? Optional.
    // For now just return success.

    await client.close()

    return Response.json({ success: true, message: `Ping sent to ${managerEmail}` })

  } catch (error) {
    console.error('Ping error:', error)
    return Response.json({ error: 'Ping failed' }, { status: 500 })
  }
}
