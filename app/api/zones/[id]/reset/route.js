
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
    const zone = await db.collection('zones').findOne({ id: zoneId })

    // Delete files from filesystem (cleanup)
    if (zone?.workRecords) {
      for (const work of zone.workRecords) {
        const allPhotos = [...(work.beforePhotos || []), ...(work.afterPhotos || []), ...(work.archivedPhotos || [])];
        for (const photo of allPhotos) {
          if (photo.filename) {
            try {
              const filepath = path.join(process.cwd(), 'public', 'uploads', photo.filename)
              await unlink(filepath)
            } catch (err) {
              // Ignore if file not found
            }
          }
        }
      }
    }

    // Clear workRecords in database
    await db.collection('zones').updateOne(
      { id: zoneId },
      { $set: { workRecords: [], updatedAt: new Date() } }
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
