
import { MongoClient, ObjectId } from 'mongodb'
import { sendDecisionNotification } from '../../../../../lib/notifications'
import { getManagerEmailForZone } from '../../../../../lib/users'

const uri = process.env.MONGODB_URI

export async function POST(request, { params }) {
  try {
    const zoneId = parseInt(params.id)
    const { workId, approved, comment } = await request.json()

    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()

    // Fetch the zone and the correct work record
    const zone = await db.collection('zones').findOne({ id: zoneId })
    const workRecordIdx = zone.workRecords.findIndex(w => w._id.toString() === workId)
    const workRecord = zone.workRecords[workRecordIdx]

    // Validation: Require at least one before AND one after photo
    if (!workRecord?.beforePhotos?.length || !workRecord?.afterPhotos?.length) {
      await client.close()
      return Response.json({ error: 'Cannot approve/reject work without both before and after photos.' }, { status: 400 })
    }

    const status = approved ? 'complete' : 'rejected'
    const updatePathStatus = `workRecords.${workRecordIdx}.status`
    const updatePathComment = `workRecords.${workRecordIdx}.approvalComment`
    const updatePathApprovedAt = `workRecords.${workRecordIdx}.approvedAt`

    // Only update the single record in the workRecords array by index
    await db.collection('zones').updateOne(
      { id: zoneId },
      {
        $set: {
          [updatePathStatus]: status,
          [updatePathComment]: comment,
          [updatePathApprovedAt]: new Date(),
          updatedAt: new Date()
        }
      }
    )

    // If approved, also move to completedWorks collection
    if (approved) {
      await db.collection('completedWorks').insertOne({
        ...workRecord,
        zoneId,
        completedAt: new Date()
      })
    }

    // Send email notification to zone manager
    try {
      const managerEmail = await getManagerEmailForZone(zoneId);
      await sendDecisionNotification(zone.name || `Zone ${zoneId}`, workId, status, comment, managerEmail);
    } catch (emailError) {
      console.error('Email notification failed:', emailError)
    }

    await client.close()
    return Response.json({ success: true, message: `Work ${approved ? 'approved' : 'rejected'} successfully` })
  } catch (error) {
    console.error('Error approving work:', error)
    return Response.json({ error: 'Failed to process approval' }, { status: 500 })
  }
}
