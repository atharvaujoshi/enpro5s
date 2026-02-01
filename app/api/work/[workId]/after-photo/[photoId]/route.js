
import { MongoClient, ObjectId } from 'mongodb'
import { unlink } from 'fs/promises'
import path from 'path'

const uri = process.env.MONGODB_URI

export async function DELETE(request, { params }) {
  try {
    const { workId, photoId } = params
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()

    const zone = await db.collection('zones').findOne({
      'workRecords._id': new ObjectId(workId)
    })
    if (!zone) {
      await client.close()
      return Response.json({ error: 'Work record not found' }, { status: 404 })
    }

    const workIdx = zone.workRecords.findIndex(w => w._id.toString() === workId)
    if (workIdx === -1) {
      await client.close()
      return Response.json({ error: 'Work record not found' }, { status: 404 })
    }

    const photoObj = zone.workRecords[workIdx].afterPhotos.find(p => p._id.toString() === photoId)
    if (!photoObj) {
      await client.close()
      return Response.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Delete file from disk
    try {
      const filepath = path.join(process.cwd(), 'public', 'uploads', photoObj.filename)
      await unlink(filepath)
    } catch {
      console.log('File not found or already deleted')
    }

    // Remove after photo from array and reset status to inprogress
    const updatePath = `workRecords.${workIdx}.afterPhotos`
    await db.collection('zones').updateOne(
      { id: zone.id, 'workRecords._id': new ObjectId(workId) },
      { 
        $pull: { [updatePath]: { _id: new ObjectId(photoId) } },
        $set: { [`workRecords.${workIdx}.status`]: 'inprogress', updatedAt: new Date() } 
      }
    )

    await client.close()
    return Response.json({ success: true, message: 'After photo deleted; work status reset to inprogress' })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return Response.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
