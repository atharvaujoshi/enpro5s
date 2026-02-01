
import { MongoClient } from 'mongodb'
import { unlink } from 'fs/promises'
import path from 'path'

const uri = process.env.MONGODB_URI

export async function POST(request, { params }) {
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

    // Get current zone data to delete files
    const zone = await db.collection('zones').findOne({ zoneId })

    // Delete files from filesystem (optional - for cleanup)
    if (zone?.beforePhoto?.filename) {
      try {
        const filepath = path.join(process.cwd(), 'public', 'uploads', zone.beforePhoto.filename)
        await unlink(filepath)
      } catch (err) {
        console.log('Before photo file not found or already deleted')
      }
    }

    if (zone?.afterPhoto?.filename) {
      try {
        const filepath = path.join(process.cwd(), 'public', 'uploads', zone.afterPhoto.filename)
        await unlink(filepath)
      } catch (err) {
        console.log('After photo file not found or already deleted')
      }
    }

    // Remove photo data from database
    await db.collection('zones').updateOne(
      { zoneId },
      { $unset: { beforePhoto: "", afterPhoto: "" } }
    )

    await client.close()

    return Response.json({ 
      success: true, 
      message: `Zone ${zoneId} reset successfully` 
    })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Failed to reset zone' }, { status: 500 })
  }
}
