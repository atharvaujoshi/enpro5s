
import { MongoClient } from 'mongodb'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

const uri = process.env.MONGODB_URI

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()

    // Initialize zones 1-13 if they don't exist
    const existingZones = await db.collection('zones').find({}).toArray()
    if (existingZones.length === 0) {
      const zones = Array.from({ length: 13 }, (_, i) => ({
        id: i + 1,
        workRecords: [],
        createdAt: new Date()
      }))
      await db.collection('zones').insertMany(zones)
    }

    let zones = await db.collection('zones').find({}).toArray()

    // Filter zones for zone managers
    if (session?.user?.role === 'zone_manager' && session?.user?.assignedZone) {
      const assignedId = parseInt(session.user.assignedZone)
      zones = zones.filter(zone => zone.id === assignedId)
    }

    // Process zones and filter work records based on status
    const processedZones = zones.map(zone => {
      let workRecords = zone.workRecords || []

      // Filter work records based on tab status
      if (status === 'complete') {
        workRecords = workRecords.filter(w => w.status === 'complete')
      } else if (status === 'rejected') {
        workRecords = workRecords.filter(w => w.status === 'rejected')
      } else {
        // unsolved - show pending and inprogress
        workRecords = workRecords.filter(w => w.status === 'pending' || w.status === 'inprogress' || !w.status)
      }

      // Determine zone status based on filtered work records
      let zoneStatus = 'pending'
      const workCount = workRecords.length

      if (workRecords.length > 0) {
        const hasComplete = workRecords.some(w => w.status === 'complete')
        const hasRejected = workRecords.some(w => w.status === 'rejected')
        const hasInProgress = workRecords.some(w => w.status === 'inprogress' || !w.status)

        if (status === 'complete' && hasComplete) {
          zoneStatus = 'complete'
        } else if (status === 'rejected' && hasRejected) {
          zoneStatus = 'rejected'
        } else if (hasInProgress) {
          zoneStatus = 'inprogress'
        }
      }

      return {
        id: zone.id,
        status: zoneStatus,
        workCount,
        workRecords: workRecords,
        lastUpdated: zone.updatedAt ? new Date(zone.updatedAt).toLocaleDateString() : 'N/A'
      }
    })

    await client.close()

    return Response.json(processedZones)
  } catch (error) {
    console.error('Error fetching zones:', error)
    return Response.json({ error: 'Failed to fetch zones' }, { status: 500 })
  }
}
