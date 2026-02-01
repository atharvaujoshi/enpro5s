
import { MongoClient } from 'mongodb'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

const uri = process.env.MONGODB_URI

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Only CEO can access report
    if (session?.user?.role !== 'ceo') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()

    const zones = await db.collection('zones').find({}).toArray()

    const stats = {
      FPP: { pending: 0, completed: 0, rejected: 0 },
      WPP: { pending: 0, completed: 0, rejected: 0 },
      WFP: { pending: 0, completed: 0, rejected: 0 }
    }

    zones.forEach(zone => {
      const records = zone.workRecords || []
      records.forEach(record => {
        const type = record.workType || 'WPP'
        const status = record.status || 'pending'
        
        // Map internal status to report categories
        // internal: pending, inprogress, complete, rejected
        // report: pending (includes inprogress), completed, rejected
        
        let reportStatus = 'pending'
        if (status === 'complete') reportStatus = 'completed'
        if (status === 'rejected') reportStatus = 'rejected'
        
        if (stats[type]) {
          stats[type][reportStatus]++
        }
      })
    })

    await client.close()

    return Response.json(stats)
  } catch (error) {
    console.error('Error fetching report:', error)
    return Response.json({ error: 'Report failed' }, { status: 500 })
  }
}
